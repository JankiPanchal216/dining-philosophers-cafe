import { ACTION_MS, leftFork, rightFork, forkNeighbors } from './engine';

const round50 = (ms) => Math.round(ms / 50) * 50;
const P = (i) => `P${i + 1}`;

// ---- timings ----
// Deadlock labs: everyone gets hungry at almost the same moment (so the naive
// protocol deadlocks reliably), then durations are random but seeded.
const deadlockTiming = {
  initial: (i) => 600 + 40 * i,
  think: (i, c, rng) => round50(1500 + rng() * 2000),
  eat: (i, c, rng) => round50(1800 + rng() * 1200),
};
// Starvation labs: P2+P4 eat together, then P5+P3 eat together, forever. P1 sits
// between P5 and P2 and never sees both of its forks free at the same time.
const starveTiming = {
  initial: (i) => ({ 0: 300, 1: 200, 3: 200, 4: 2200, 2: 2200 })[i],
  think: () => 2000,
  eat: () => 2000,
};

// ---- blocking lock flow (naive, ordering, room, try-lock) ----
function beginAcquire(w, p, order) {
  p.plan = order;
  p.step = 0;
  p.waiting = null;
  p.nextAt = w.t + ACTION_MS;
}
function gotFork(w, p) {
  p.step++;
  p.waiting = null;
  if (p.step >= p.plan.length) w.startEating(p);
  else p.nextAt = w.t + ACTION_MS;
}
function attempt(w, p, strat) {
  const f = p.plan[p.step];
  if (w.isFree(f)) {
    w.take(p, f);
    gotFork(w, p);
  } else if (strat.tryLockSecond && p.step > 0) {
    const held = [...p.held];
    for (const h of held) w.put(p, h, true);
    const ms = round50(400 + w.rng() * 1400);
    p.backoffUntil = w.t + ms;
    p.nextAt = null;
    w.addLog(`${P(p.i)} couldn't get F${f + 1}: put down F${held.map((x) => x + 1).join(',')}, backs off ${(ms / 1000).toFixed(1)}s`, 'warn', p.i);
  } else {
    p.waiting = 'fork';
    p.nextAt = null;
    w.forks[f].queue.push(p.i);
    w.addLog(`${P(p.i)} waits for F${f + 1} (held by ${P(w.forks[f].holder)})`, 'warn', p.i);
  }
}
const lockFlow = {
  onForkFree(w, f) {
    const q = w.forks[f].queue.shift();
    if (q === undefined) return;
    const p = w.phils[q];
    w.take(p, f);
    gotFork(w, p);
  },
  update(w) {
    for (const p of w.phils) {
      if (p.state !== 'hungry') continue;
      if (p.backoffUntil !== null) {
        if (w.t >= p.backoffUntil) {
          p.backoffUntil = null;
          beginAcquire(w, p, w.strategy.order(w, p.i));
        }
      } else if (p.nextAt !== null && w.t >= p.nextAt) attempt(w, p, w.strategy);
    }
  },
  onHungry(w, p) {
    beginAcquire(w, p, w.strategy.order(w, p.i));
  },
};

const leftFirst = (w, i) => [leftFork(i, w.n), rightFork(i)];

const naive = {
  name: 'Naive: left fork, then right fork',
  timing: deadlockTiming,
  ...lockFlow,
  order: leftFirst,
  center: () => ({ title: 'Left, then right', lines: ['no coordination'] }),
};

const ordering = {
  name: 'Resource ordering: lowest-numbered fork first',
  timing: deadlockTiming,
  ...lockFlow,
  order: (w, i) => [leftFork(i, w.n), rightFork(i)].sort((a, b) => a - b),
  center: () => ({ title: 'F1 < F2 < … < F5', lines: ['always take the', 'lower number first'] }),
};

const tryLock = {
  name: 'Try-lock with random back-off',
  timing: deadlockTiming,
  ...lockFlow,
  tryLockSecond: true,
  order: leftFirst,
  center: () => ({ title: 'Try-lock', lines: ['second fork busy?', 'put the first down'] }),
};

const room = {
  name: 'Room semaphore: at most N-1 at the table',
  timing: deadlockTiming,
  ...lockFlow,
  order: leftFirst,
  setup(w) {
    w.room = { count: w.n - 1, queue: [] };
  },
  onHungry(w, p) {
    if (w.room.count > 0) {
      w.room.count--;
      w.addLog(`${P(p.i)} takes a seat (${w.n - 1 - w.room.count}/${w.n - 1})`, 'info', p.i);
      beginAcquire(w, p, w.order ? w.order(w, p.i) : leftFirst(w, p.i));
    } else {
      p.waiting = 'room';
      w.room.queue.push(p.i);
      w.addLog(`${P(p.i)} waits outside: table is full`, 'warn', p.i);
    }
  },
  onFinishEating(w) {
    w.room.count++;
    const q = w.room.queue.shift();
    if (q !== undefined) {
      w.room.count--;
      const p = w.phils[q];
      w.addLog(`${P(q)} takes the free seat`, 'info', q);
      beginAcquire(w, p, leftFirst(w, q));
    }
  },
  center: (w) => ({
    title: `Seats ${w.room.count} free`,
    lines: [`${w.n - 1 - w.room.count} / ${w.n - 1} taken`],
    dots: { total: w.n - 1, filled: w.n - 1 - w.room.count },
  }),
};

// ---- arbiter flow (waiter, greedy, FIFO): both forks are granted at once ----
function makeArbiter(name, eligible, centerFn, timing) {
  return {
    name,
    timing,
    setup(w) {
      w.queue = [];
    },
    onHungry(w, p) {
      p.waiting = 'arbiter';
      w.queue.push(p.i);
    },
    update(w) {
      let progressed = true;
      while (progressed) {
        progressed = false;
        const candidates = eligible.order(w);
        for (const i of candidates) {
          const [a, b] = [rightFork(i), leftFork(i, w.n)];
          if (!w.isFree(a) || !w.isFree(b)) continue;
          if (!eligible.ok(w, i)) continue;
          const p = w.phils[i];
          w.queue = w.queue.filter((x) => x !== i);
          w.addLog(`${eligible.who} gives F${a + 1} + F${b + 1} to ${P(i)}`, 'info', i);
          w.take(p, a);
          w.take(p, b);
          w.startEating(p);
          progressed = true;
          break;
        }
      }
    },
    center: centerFn,
  };
}
const adjacent = (w, a, b) => (a + 1) % w.n === b || (b + 1) % w.n === a;
const queueText = (w) => (w.queue.length ? w.queue.map(P).join(', ') : 'empty');

const waiter = makeArbiter(
  'Waiter: forks are handed out together',
  { who: 'Waiter', order: (w) => [...w.queue], ok: () => true },
  (w) => ({ title: 'Waiter', lines: ['both forks or none', `queue: ${queueText(w)}`] }),
  deadlockTiming
);

const PRIORITY = [1, 4, 2, 3, 0]; // P1 (index 0) is last
const greedy = makeArbiter(
  'Greedy: fixed priority, P1 is last',
  {
    who: 'Arbiter',
    order: (w) => PRIORITY.filter((i) => w.queue.includes(i)),
    ok: (w, i) => {
      const mine = PRIORITY.indexOf(i);
      return !w.queue.some((j) => adjacent(w, i, j) && PRIORITY.indexOf(j) < mine);
    },
  },
  () => ({ title: 'Priority', lines: [PRIORITY.map(P).join(' > ')] }),
  starveTiming
);

const fifo = makeArbiter(
  'FIFO: first come, first served',
  {
    who: 'Queue',
    order: (w) => [...w.queue],
    ok: (w, i) => {
      const pos = w.queue.indexOf(i);
      return !w.queue.slice(0, pos).some((j) => adjacent(w, i, j));
    },
  },
  (w) => ({ title: 'FIFO queue', lines: [queueText(w), 'nobody is overtaken'] }),
  starveTiming
);

// ---- Chandy-Misra: forks are clean or dirty and always owned by someone ----
const chandy = {
  name: 'Chandy–Misra: clean / dirty forks',
  timing: starveTiming,
  keepForksAfterEating: true,
  setup(w) {
    for (const f of w.forks) {
      const [a, b] = forkNeighbors(f.i, w.n);
      w.take(w.phils[Math.min(a, b)], f.i, true);
      f.token = Math.max(a, b);
      f.dirty = true;
    }
  },
  afterEating(w, p) {
    for (const f of p.held) w.forks[f].dirty = true;
    w.addLog(`${P(p.i)} finished, forks are dirty`, 'think', p.i);
  },
  onHungry(w, p) {
    p.waiting = p.held.length === 2 ? null : 'request';
  },
  update(w) {
    for (const p of w.phils) {
      if (p.state !== 'hungry') continue;
      for (const f of [rightFork(p.i), leftFork(p.i, w.n)]) {
        const fk = w.forks[f];
        if (fk.holder !== p.i && fk.token === p.i && !fk.request) {
          fk.request = true;
          fk.token = fk.holder;
          w.addLog(`${P(p.i)} asks ${P(fk.holder)} for F${f + 1}`, 'warn', p.i);
        }
      }
    }
    for (const fk of w.forks) {
      if (!fk.request) continue;
      const h = w.phils[fk.holder];
      if (h.state === 'eating' || !fk.dirty) continue; // defer
      const [a, b] = forkNeighbors(fk.i, w.n);
      const to = w.phils[a === h.i ? b : a];
      h.held = h.held.filter((x) => x !== fk.i);
      to.held.push(fk.i);
      fk.holder = to.i;
      fk.dirty = false;
      fk.request = false;
      w.addLog(`${P(h.i)} hands clean F${fk.i + 1} to ${P(to.i)}`, 'take', to.i);
    }
    for (const p of w.phils) {
      if (p.state !== 'hungry') continue;
      if (p.held.length === 2) w.startEating(p);
      else p.waiting = 'request';
    }
  },
  center: () => ({ title: 'Clean / dirty', lines: ['dirty forks go to', 'whoever asks'] }),
};

export const STRATEGIES = { naive, ordering, room, waiter, tryLock, greedy, fifo, chandy };
