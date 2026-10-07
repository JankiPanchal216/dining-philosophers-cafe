// Dining Philosophers engine: a small deterministic simulation.
// Each philosopher is a state machine (thinking -> hungry -> eating). A "strategy"
// decides how forks are acquired. The world advances in fixed 50 ms steps.

export const STEP_MS = 50;
export const ACTION_MS = 500; // time to reach for one fork
export const STARVE_MS = 6000; // hungry this long => flagged as starving

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round50 = (ms) => Math.round(ms / 50) * 50;

export function fmtTime(ms) {
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
}

export const leftFork = (i, n) => (i + 1) % n; // clockwise side
export const rightFork = (i) => i;
export const forkNeighbors = (f, n) => [(f - 1 + n) % n, f];

// ---------- world ----------
export function createWorld(strategy, n = 5, seed = 7) {
  const rng = mulberry32(seed);
  const w = {
    n,
    strategy,
    t: 0,
    log: [],
    deadlock: null,
    phils: [],
    forks: [],
    rng,
  };
  for (let i = 0; i < n; i++) {
    w.phils.push({
      i,
      state: 'thinking',
      until: strategy.timing.initial(i),
      cycle: 0,
      held: [],
      waiting: null, // 'fork' | 'room' | 'arbiter' | 'forks'
      plan: [],
      step: 0,
      nextAt: null,
      backoffUntil: null,
      requestedAt: 0,
      hungrySince: 0,
      meals: 0,
      maxWait: 0,
      lastWait: 0,
    });
  }
  for (let f = 0; f < n; f++) w.forks.push({ i: f, holder: null, queue: [], dirty: false, token: null, request: false });

  w.addLog = (text, kind = 'info', who = null) => {
    w.log.push({ id: w.log.length, t: w.t, text, kind, who });
    if (w.log.length > 60) w.log.shift();
  };
  w.take = (p, f, quiet = false) => {
    w.forks[f].holder = p.i;
    p.held.push(f);
    if (!quiet) w.addLog(`P${p.i + 1} picked up F${f + 1}`, 'take', p.i);
  };
  w.put = (p, f, quiet = false) => {
    w.forks[f].holder = null;
    p.held = p.held.filter((x) => x !== f);
    if (!quiet) w.addLog(`P${p.i + 1} put down F${f + 1}`, 'put', p.i);
    strategy.onForkFree?.(w, f);
  };
  w.isFree = (f) => w.forks[f].holder === null;
  w.startEating = (p) => {
    p.state = 'eating';
    p.waiting = null;
    p.nextAt = null;
    p.lastWait = w.t - p.hungrySince;
    p.maxWait = Math.max(p.maxWait, p.lastWait);
    p.until = w.t + strategy.timing.eat(p.i, p.cycle, rng);
    w.addLog(`P${p.i + 1} is eating (waited ${(p.lastWait / 1000).toFixed(1)}s)`, 'eat', p.i);
  };
  w.finishEating = (p) => {
    p.meals++;
    p.cycle++;
    const held = [...p.held];
    p.state = 'thinking';
    if (strategy.keepForksAfterEating) strategy.afterEating(w, p);
    else {
      w.addLog(`P${p.i + 1} finished, now thinking`, 'think', p.i);
      for (const f of held) w.put(p, f);
    }
    p.until = w.t + strategy.timing.think(p.i, p.cycle, rng);
    strategy.onFinishEating?.(w, p);
  };
  w.becomeHungry = (p) => {
    p.state = 'hungry';
    p.hungrySince = w.t;
    p.requestedAt = w.t;
    p.waiting = null;
    w.addLog(`P${p.i + 1} is hungry`, 'hungry', p.i);
    strategy.onHungry(w, p);
  };

  strategy.setup?.(w);
  w.addLog(`Started: ${strategy.name}`, 'info');
  return w;
}

// ---------- stepping ----------
export function stepWorld(w) {
  w.t += STEP_MS;
  for (const p of w.phils) if (p.state === 'eating' && w.t >= p.until) w.finishEating(p);
  for (const p of w.phils) if (p.state === 'thinking' && w.t >= p.until) w.becomeHungry(p);
  w.strategy.update?.(w);
  detectDeadlock(w);
}

export function waitsOn(w, p) {
  // returns [{fork, holder}] this philosopher is blocked behind
  if (p.state !== 'hungry' || !p.waiting) return [];
  const n = w.n;
  if (p.waiting === 'fork') return [p.plan[p.step]].filter((f) => f !== undefined).map((f) => ({ fork: f, holder: w.forks[f].holder }));
  if (p.waiting === 'forks' || p.waiting === 'arbiter') {
    return [rightFork(p.i), leftFork(p.i, n)]
      .filter((f) => w.forks[f].holder !== null && w.forks[f].holder !== p.i)
      .map((f) => ({ fork: f, holder: w.forks[f].holder }));
  }
  if (p.waiting === 'request') {
    return [rightFork(p.i), leftFork(p.i, n)]
      .filter((f) => w.forks[f].holder !== p.i)
      .map((f) => ({ fork: f, holder: w.forks[f].holder }));
  }
  return [];
}

function detectDeadlock(w) {
  const edges = new Map();
  for (const p of w.phils) {
    const holders = waitsOn(w, p).map((x) => x.holder).filter((h) => h !== null && h !== p.i);
    // only a blocking fork wait while holding something can form a cycle
    edges.set(p.i, p.waiting === 'fork' && p.held.length ? holders : []);
  }
  let cycle = null;
  const color = new Map();
  const stack = [];
  const dfs = (u) => {
    color.set(u, 1);
    stack.push(u);
    for (const v of edges.get(u) || []) {
      if (cycle) return;
      if (!color.get(v)) dfs(v);
      else if (color.get(v) === 1) cycle = stack.slice(stack.indexOf(v));
      if (cycle) return;
    }
    stack.pop();
    color.set(u, 2);
  };
  for (const p of w.phils) if (!color.get(p.i) && !cycle) dfs(p.i);
  if (cycle) {
    if (!w.deadlock) {
      w.deadlock = { cycle, since: w.t };
      w.addLog(`DEADLOCK: ${cycle.map((i) => 'P' + (i + 1)).join(' → ')} → P${cycle[0] + 1}`, 'bad');
    }
  } else if (w.deadlock) w.deadlock = null;
}

// ---------- snapshot for the UI ----------
export function snapshot(w) {
  const n = w.n;
  const dead = new Set(w.deadlock ? w.deadlock.cycle : []);
  const phils = w.phils.map((p) => {
    const waitMs = p.state === 'hungry' ? w.t - p.hungrySince : 0;
    const waits = waitsOn(w, p);
    let label = 'THINKING';
    let tone = 'thinking';
    if (p.state === 'eating') [label, tone] = ['EATING', 'eating'];
    else if (p.state === 'hungry') {
      if (dead.has(p.i)) [label, tone] = ['DEADLOCK', 'bad'];
      else if (waitMs > STARVE_MS && p.waiting) [label, tone] = ['STARVING', 'bad'];
      else if (p.backoffUntil !== null) [label, tone] = ['BACK-OFF', 'backoff'];
      else if (p.waiting) [label, tone] = ['WAITING', 'waiting'];
      else [label, tone] = ['HUNGRY', 'hungry'];
    }
    return {
      i: p.i,
      state: p.state,
      label,
      tone,
      held: [...p.held],
      left: leftFork(p.i, n),
      right: rightFork(p.i),
      waits,
      waitKind: p.waiting,
      waitMs,
      meals: p.meals,
      maxWait: Math.max(p.maxWait, waitMs),
    };
  });
  return {
    t: w.t,
    n,
    phils,
    forks: w.forks.map((f) => ({ i: f.i, holder: f.holder, dirty: f.dirty })),
    deadlock: w.deadlock,
    center: w.strategy.center ? w.strategy.center(w) : null,
    log: w.log.slice(-30),
    totalMeals: phils.reduce((a, p) => a + p.meals, 0),
  };
}
