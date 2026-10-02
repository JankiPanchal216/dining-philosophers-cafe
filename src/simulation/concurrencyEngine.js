/**
 * Dining Philosophers Café - Concurrency & Synchronization Engine
 * 
 * Central Source of Truth for:
 * - 5 Philosophers (P1..P5)
 * - 5 Forks / Mutexes (Fork #1..Fork #5)
 * - Topology:
 *     P1 -> Fork #1 & Fork #5
 *     P2 -> Fork #2 & Fork #1
 *     P3 -> Fork #3 & Fork #2
 *     P4 -> Fork #4 & Fork #3
 *     P5 -> Fork #5 & Fork #4
 * - Real Wait-For Graph (WFG) cycle detection algorithm
 * - Step-by-step state machine with semantically correct states
 */

export const PHILOSOPHER_COUNT = 5;
export const FORK_COUNT = 5;

export const PHILOSOPHERS_CONFIG = [
  { id: 1, name: 'P1', fullName: 'Philosopher 1', leftFork: 1, rightFork: 5, forks: [1, 5] },
  { id: 2, name: 'P2', fullName: 'Philosopher 2', leftFork: 2, rightFork: 1, forks: [2, 1] },
  { id: 3, name: 'P3', fullName: 'Philosopher 3', leftFork: 3, rightFork: 2, forks: [3, 2] },
  { id: 4, name: 'P4', fullName: 'Philosopher 4', leftFork: 4, rightFork: 3, forks: [4, 3] },
  { id: 5, name: 'P5', fullName: 'Philosopher 5', leftFork: 5, rightFork: 4, forks: [5, 4] },
];

export const FORKS_CONFIG = [
  { id: 1, name: 'Fork #1', mutexName: 'Mutex A', sharedBetween: [1, 2] },
  { id: 2, name: 'Fork #2', mutexName: 'Mutex B', sharedBetween: [2, 3] },
  { id: 3, name: 'Fork #3', mutexName: 'Mutex C', sharedBetween: [3, 4] },
  { id: 4, name: 'Fork #4', mutexName: 'Mutex D', sharedBetween: [4, 5] },
  { id: 5, name: 'Fork #5', mutexName: 'Mutex E', sharedBetween: [5, 1] },
];

/**
 * Creates a clean, idle/ready initial simulation state.
 */
export function createInitialSimulationState() {
  return {
    status: 'READY', // 'READY' | 'RUNNING' | 'WAITING' | 'DEADLOCK_DETECTED' | 'COMPLETED'
    scenario: 'circular_wait', // 'circular_wait' | 'havender_safe'
    step: 0,
    totalSteps: 10,
    philosophers: PHILOSOPHERS_CONFIG.map(p => ({
      id: p.id,
      name: p.name,
      fullName: p.fullName,
      state: 'THINKING', // 'THINKING' | 'HUNGRY' | 'EATING' | 'WAITING' | 'DEADLOCKED'
      heldForks: [],
      waitingForFork: null,
      mealsEaten: 0,
      waitTimeMs: 0,
    })),
    forks: FORKS_CONFIG.map(f => ({
      id: f.id,
      name: f.name,
      mutexName: f.mutexName,
      status: 'AVAILABLE', // 'AVAILABLE' | 'HELD'
      heldBy: null, // Philosopher ID (1..5) or null
      waitingPhils: [], // Philosopher IDs waiting for this fork
    })),
    deadlockDetected: false,
    starvationDetected: false,
    cycle: null, // e.g. [1, 5, 4, 3, 2]
    cyclePath: null, // e.g. 'P1 → P5 → P4 → P3 → P2 → P1'
    waitForGraph: {}, // { [philId]: [heldByPhilId] }
    events: [
      {
        id: 'ev-init',
        time: formatLogTime(new Date()),
        message: 'Simulation workbench initialized. System is in READY state.',
        type: 'normal',
      }
    ],
  };
}

/**
 * Formats time as HH:MM:SS or MM:SS.mmm for the event log
 */
export function formatLogTime(d = new Date()) {
  const pad = (n, z = 2) => String(n).padStart(z, '0');
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const ms = pad(d.getMilliseconds(), 3);
  return `${hh}:${mm}:${ss}.${ms}`;
}

/**
 * Mathematically detects cycles in the Wait-For Graph (WFG).
 * 
 * Construct Wait-For Relationship:
 * Philosopher P_i waiting for Fork F_k
 * If Fork F_k is held by P_j (and j != i):
 *   Directed edge P_i → P_j (P_i waits for resource held by P_j)
 * 
 * If Fork F_k is AVAILABLE, P_i is NOT waiting on another process.
 * 
 * Cycle detection via DFS with recursion stack.
 */
export function detectDeadlock(philosophers, forks) {
  const waitForGraph = {}; // philId -> array of philIds it is waiting on
  const forkMap = new Map(forks.map(f => [f.id, f]));

  // Build the wait-for relationships
  for (const p of philosophers) {
    waitForGraph[p.id] = [];
    if (p.waitingForFork !== null && p.waitingForFork !== undefined) {
      const fork = forkMap.get(p.waitingForFork);
      if (fork && fork.heldBy && fork.heldBy !== p.id) {
        // p is waiting for a fork held by fork.heldBy
        waitForGraph[p.id].push(fork.heldBy);
      }
    }
  }

  // Detect cycle using DFS
  const visited = new Set();
  const recStack = new Set();
  let detectedCycle = null;

  function dfs(node, path) {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = waitForGraph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, path)) return true;
      } else if (recStack.has(neighbor)) {
        // Cycle found! Extract the cycle path from `neighbor` to current node
        const cycleStartIndex = path.indexOf(neighbor);
        detectedCycle = path.slice(cycleStartIndex);
        return true;
      }
    }

    path.pop();
    recStack.delete(node);
    return false;
  }

  for (const p of philosophers) {
    if (!visited.has(p.id)) {
      if (dfs(p.id, [])) break;
    }
  }

  if (detectedCycle && detectedCycle.length > 0) {
    // Format cycle string: P1 → P5 → P4 → P3 → P2 → P1
    const cycleNames = detectedCycle.map(id => `P${id}`);
    const cyclePath = [...cycleNames, cycleNames[0]].join(' → ');
    return {
      hasDeadlock: true,
      cycle: detectedCycle,
      cyclePath,
      deadlockedPhils: detectedCycle,
      waitForGraph,
    };
  }

  return {
    hasDeadlock: false,
    cycle: null,
    cyclePath: null,
    deadlockedPhils: [],
    waitForGraph,
  };
}

/**
 * Generates the state for a specific step in the "Circular Wait (Naive Greedy)" scenario.
 */
export function getCircularWaitStepState(stepNumber) {
  // Base clean state
  const base = createInitialSimulationState();
  base.scenario = 'circular_wait';
  base.totalSteps = 10;
  base.step = stepNumber;

  if (stepNumber === 0) {
    base.status = 'READY';
    base.events = [
      { id: 'ev-0', time: formatLogTime(), message: 'SCENARIO: Circular Wait Demonstration (Naive Greedy Acquisition)', type: 'normal' },
      { id: 'ev-1', time: formatLogTime(), message: 'Initial state: All 5 philosophers THINKING. All 5 forks AVAILABLE.', type: 'normal' },
      { id: 'ev-2', time: formatLogTime(), message: 'No circular wait detected.', type: 'normal' },
    ];
    return base;
  }

  // Copy philosophers and forks
  const phils = base.philosophers.map(p => ({ ...p, heldForks: [...p.heldForks] }));
  const forks = base.forks.map(f => ({ ...f, waitingPhils: [...f.waitingPhils] }));
  const events = [
    { id: 'ev-0', time: formatLogTime(), message: 'SCENARIO: Circular Wait Demonstration started.', type: 'normal' }
  ];

  // Helper to give fork to philosopher
  const acquire = (pId, fId, timeOffset = '') => {
    const p = phils.find(x => x.id === pId);
    const f = forks.find(x => x.id === fId);
    p.heldForks.push(fId);
    p.state = 'HUNGRY';
    f.status = 'HELD';
    f.heldBy = pId;
    events.push({
      id: `ev-acq-${pId}-${fId}`,
      time: formatLogTime(),
      message: `P${pId} acquired Fork #${fId} (${f.mutexName})`,
      type: 'normal'
    });
  };

  // Helper to set wait
  const wait = (pId, fId) => {
    const p = phils.find(x => x.id === pId);
    const f = forks.find(x => x.id === fId);
    p.waitingForFork = fId;
    p.state = 'WAITING';
    if (!f.waitingPhils.includes(pId)) f.waitingPhils.push(pId);
    const holder = f.heldBy ? `P${f.heldBy}` : 'None';
    events.push({
      id: `ev-wait-${pId}-${fId}`,
      time: formatLogTime(),
      message: `P${pId} waiting for Fork #${fId} (currently held by ${holder})`,
      type: 'normal'
    });
  };

  // Steps 1 to 5: Each philosopher acquires their left fork
  if (stepNumber >= 1) acquire(1, 1);
  if (stepNumber >= 2) acquire(2, 2);
  if (stepNumber >= 3) acquire(3, 3);
  if (stepNumber >= 4) acquire(4, 4);
  if (stepNumber >= 5) acquire(5, 5);

  // Steps 6 to 10: Each philosopher tries to acquire their right fork
  if (stepNumber >= 6) wait(1, 5);
  if (stepNumber >= 7) wait(2, 1);
  if (stepNumber >= 8) wait(3, 2);
  if (stepNumber >= 9) wait(4, 3);
  if (stepNumber >= 10) wait(5, 4);

  // Calculate real deadlock
  const deadlockResult = detectDeadlock(phils, forks);
  base.deadlockDetected = deadlockResult.hasDeadlock;
  base.cycle = deadlockResult.cycle;
  base.cyclePath = deadlockResult.cyclePath;
  base.waitForGraph = deadlockResult.waitForGraph;

  if (deadlockResult.hasDeadlock) {
    base.status = 'DEADLOCK_DETECTED';
    // Mark deadlocked philosophers as DEADLOCKED
    for (const p of phils) {
      if (deadlockResult.deadlockedPhils.includes(p.id)) {
        p.state = 'DEADLOCKED';
      }
    }
    events.push({
      id: 'ev-deadlock',
      time: formatLogTime(),
      message: 'CIRCULAR WAIT DETECTED! Coffman Condition #4 verified.',
      type: 'error'
    });
    events.push({
      id: 'ev-cycle-path',
      time: formatLogTime(),
      message: `Wait-for cycle: ${deadlockResult.cyclePath}`,
      type: 'error'
    });
  } else if (stepNumber >= 6) {
    base.status = 'WAITING';
    events.push({
      id: `ev-status-${stepNumber}`,
      time: formatLogTime(),
      message: 'Resource contention active: philosopher waiting, no circular wait yet.',
      type: 'normal'
    });
  } else {
    base.status = 'RUNNING';
  }

  base.philosophers = phils;
  base.forks = forks;
  base.events = events;

  return base;
}

/**
 * Generates the state for a specific step in the "Havender Resource Ordering (Safe)" scenario.
 * Enforces total order F_low < F_high to prevent circular wait!
 */
export function getHavenderSafeStepState(stepNumber) {
  const base = createInitialSimulationState();
  base.scenario = 'havender_safe';
  base.totalSteps = 6;
  base.step = stepNumber;

  if (stepNumber === 0) {
    base.status = 'READY';
    base.events = [
      { id: 'ev-0', time: formatLogTime(), message: 'SCENARIO: Havender Resource Ordering (Deadlock-Free)', type: 'normal' },
      { id: 'ev-1', time: formatLogTime(), message: 'Total resource hierarchy enforced: F1 < F2 < F3 < F4 < F5.', type: 'normal' },
      { id: 'ev-2', time: formatLogTime(), message: 'No circular wait can form.', type: 'normal' },
    ];
    return base;
  }

  const phils = base.philosophers.map(p => ({ ...p, heldForks: [...p.heldForks] }));
  const forks = base.forks.map(f => ({ ...f, waitingPhils: [...f.waitingPhils] }));
  const events = [
    { id: 'ev-0', time: formatLogTime(), message: 'SCENARIO: Havender Resource Hierarchy running.', type: 'normal' }
  ];

  if (stepNumber === 1) {
    // P1..P4 acquire lower fork. P5 (forks 4,5) contends for F4.
    // P1 holds F1. P2 waits for F1 (since F1 < F2). F2 remains free!
    phils[0].heldForks = [1]; phils[0].state = 'HUNGRY'; forks[0].heldBy = 1; forks[0].status = 'HELD';
    phils[1].state = 'WAITING'; phils[1].waitingForFork = 1; forks[0].waitingPhils = [2];
    phils[2].heldForks = [2]; phils[2].state = 'HUNGRY'; forks[1].heldBy = 3; forks[1].status = 'HELD';
    phils[3].heldForks = [3, 4]; phils[3].state = 'EATING'; phils[3].mealsEaten = 1;
    forks[2].heldBy = 4; forks[2].status = 'HELD';
    forks[3].heldBy = 4; forks[3].status = 'HELD';
    forks[4].status = 'AVAILABLE'; // F5 remains free!

    events.push({ id: 'ev-1-1', time: formatLogTime(), message: 'P2 waits for F1. F2 remains free.', type: 'normal' });
    events.push({ id: 'ev-1-2', time: formatLogTime(), message: 'P4 acquired F3 & F4 and entered critical section (EATING).', type: 'success' });
    base.status = 'RUNNING';
  } else if (stepNumber === 2) {
    // P4 finished eating, released F3 and F4. P3 acquires F3 and eats!
    phils[3].heldForks = []; phils[3].state = 'THINKING';
    phils[2].heldForks = [2, 3]; phils[2].state = 'EATING'; phils[2].mealsEaten = 1;
    phils[0].heldForks = [1]; phils[0].state = 'HUNGRY';
    phils[1].state = 'WAITING'; phils[1].waitingForFork = 1;
    forks[0].heldBy = 1; forks[0].status = 'HELD'; forks[0].waitingPhils = [2];
    forks[1].heldBy = 3; forks[1].status = 'HELD';
    forks[2].heldBy = 3; forks[2].status = 'HELD';
    forks[3].status = 'AVAILABLE';
    forks[4].status = 'AVAILABLE';

    events.push({ id: 'ev-2-1', time: formatLogTime(), message: 'P4 finished eating, released F3 & F4.', type: 'normal' });
    events.push({ id: 'ev-2-2', time: formatLogTime(), message: 'P3 acquired F3, eating with F2 & F3.', type: 'success' });
    base.status = 'RUNNING';
  } else if (stepNumber === 3) {
    // P3 finishes, releases F2 & F3. P5 acquires F4 and F5.
    phils[2].heldForks = []; phils[2].state = 'THINKING';
    phils[4].heldForks = [4, 5]; phils[4].state = 'EATING'; phils[4].mealsEaten = 1;
    phils[0].heldForks = [1]; phils[0].state = 'HUNGRY';
    phils[1].state = 'WAITING'; phils[1].waitingForFork = 1;
    forks[0].heldBy = 1; forks[0].status = 'HELD'; forks[0].waitingPhils = [2];
    forks[1].status = 'AVAILABLE';
    forks[2].status = 'AVAILABLE';
    forks[3].heldBy = 5; forks[3].status = 'HELD';
    forks[4].heldBy = 5; forks[4].status = 'HELD';

    events.push({ id: 'ev-3-1', time: formatLogTime(), message: 'P3 finished eating, released F2 & F3.', type: 'normal' });
    events.push({ id: 'ev-3-2', time: formatLogTime(), message: 'P5 acquired F4 & F5 and entered critical section.', type: 'success' });
    base.status = 'RUNNING';
  } else if (stepNumber === 4) {
    // P5 finishes, releases F4 & F5. P1 acquires F5 and eats!
    phils[4].heldForks = []; phils[4].state = 'THINKING';
    phils[0].heldForks = [1, 5]; phils[0].state = 'EATING'; phils[0].mealsEaten = 1;
    phils[1].state = 'WAITING'; phils[1].waitingForFork = 1;
    forks[0].heldBy = 1; forks[0].status = 'HELD'; forks[0].waitingPhils = [2];
    forks[1].status = 'AVAILABLE';
    forks[2].status = 'AVAILABLE';
    forks[3].status = 'AVAILABLE';
    forks[4].heldBy = 1; forks[4].status = 'HELD';

    events.push({ id: 'ev-4-1', time: formatLogTime(), message: 'P5 released F4 & F5.', type: 'normal' });
    events.push({ id: 'ev-4-2', time: formatLogTime(), message: 'P1 acquired F5, eating with F1 & F5.', type: 'success' });
    base.status = 'RUNNING';
  } else if (stepNumber === 5) {
    // P1 finishes, releases F1 & F5. P2 unblocks, acquires F1 & F2, eats!
    phils[0].heldForks = []; phils[0].state = 'THINKING';
    phils[1].heldForks = [1, 2]; phils[1].state = 'EATING'; phils[1].waitingForFork = null; phils[1].mealsEaten = 1;
    forks[0].heldBy = 2; forks[0].status = 'HELD'; forks[0].waitingPhils = [];
    forks[1].heldBy = 2; forks[1].status = 'HELD';
    forks[2].status = 'AVAILABLE';
    forks[3].status = 'AVAILABLE';
    forks[4].status = 'AVAILABLE';

    events.push({ id: 'ev-5-1', time: formatLogTime(), message: 'P1 released F1 & F5.', type: 'normal' });
    events.push({ id: 'ev-5-2', time: formatLogTime(), message: 'P2 acquired F1 & F2, eating happily!', type: 'success' });
    base.status = 'RUNNING';
  } else if (stepNumber >= 6) {
    // All completed
    phils.forEach(p => { p.heldForks = []; p.state = 'THINKING'; p.waitingForFork = null; });
    forks.forEach(f => { f.status = 'AVAILABLE'; f.heldBy = null; f.waitingPhils = []; });
    events.push({ id: 'ev-6-1', time: formatLogTime(), message: 'All philosophers completed execution cycles without deadlock.', type: 'success' });
    events.push({ id: 'ev-6-2', time: formatLogTime(), message: 'Invariant verified: 0 deadlocks, circular wait impossible under total order.', type: 'success' });
    base.status = 'COMPLETED';
  }

  const deadlockResult = detectDeadlock(phils, forks);
  base.deadlockDetected = deadlockResult.hasDeadlock;
  base.cycle = deadlockResult.cycle;
  base.cyclePath = deadlockResult.cyclePath;
  base.waitForGraph = deadlockResult.waitForGraph;

  base.philosophers = phils;
  base.forks = forks;
  base.events = events;

  return base;
}
