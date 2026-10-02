import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Calculates the exact state for steps 0 to 10 of the Deadlock simulation.
 * 
 * Step 0: READY - all THINKING, all forks free
 * Step 1: ALL HUNGRY - all HUNGRY, all forks free
 * Steps 2-6: FIRST FORK ACQUISITION - Pi acquires Fi (P1->F1, P2->F2, P3->F3, P4->F4, P5->F5)
 * Step 7: SECOND FORK REQUEST - each requests Fi-1 (P1->F5, P2->F1, etc.), all blocked in WAITING
 * Step 8: BUILD WAIT-FOR GRAPH - WFG constructed: P1->P5, P2->P1, P3->P2, P4->P3, P5->P4
 * Step 9: DETECT AND HIGHLIGHT CYCLE - Cycle detected: P1->P5->P4->P3->P2->P1
 * Step 10: DEADLOCK - phase = DEADLOCK, all DEADLOCKED, stops automatically
 */
export function calculateDeadlockStepState(stepNumber) {
  const step = Math.min(Math.max(0, stepNumber), 10);

  // Initial philosophers
  const philosophers = [1, 2, 3, 4, 5].map((id) => ({
    id,
    status: 'THINKING',
    held: [],
  }));

  // Initial forks
  const forks = [1, 2, 3, 4, 5].map((id) => ({
    id,
    holder: null,
  }));

  let log = [];
  let waitForGraph = {};
  let cycle = [];

  if (step === 0) {
    return {
      step: 0,
      philosophers,
      forks,
      log: [],
      waitForGraph: {},
      cycle: [],
    };
  }

  // Step 1: All hungry
  philosophers.forEach((p) => {
    p.status = 'HUNGRY';
  });
  log.push('All philosophers became HUNGRY.');

  // Steps 2-6: First fork acquisitions
  // P1 -> F1
  if (step >= 2) {
    philosophers[0].status = 'HOLDING';
    philosophers[0].held = [1];
    forks[0].holder = 1;
    log.push('P1 acquired Fork #1.');
  }

  // P2 -> F2
  if (step >= 3) {
    philosophers[1].status = 'HOLDING';
    philosophers[1].held = [2];
    forks[1].holder = 2;
    log.push('P2 acquired Fork #2.');
  }

  // P3 -> F3
  if (step >= 4) {
    philosophers[2].status = 'HOLDING';
    philosophers[2].held = [3];
    forks[2].holder = 3;
    log.push('P3 acquired Fork #3.');
  }

  // P4 -> F4
  if (step >= 5) {
    philosophers[3].status = 'HOLDING';
    philosophers[3].held = [4];
    forks[3].holder = 4;
    log.push('P4 acquired Fork #4.');
  }

  // P5 -> F5
  if (step >= 6) {
    philosophers[4].status = 'HOLDING';
    philosophers[4].held = [5];
    forks[4].holder = 5;
    log.push('P5 acquired Fork #5.');
  }

  // Step 7: Second fork request
  // P1 wants F5 (held by P5)
  // P2 wants F1 (held by P1)
  // P3 wants F2 (held by P2)
  // P4 wants F3 (held by P3)
  // P5 wants F4 (held by P4)
  if (step >= 7) {
    philosophers.forEach((p) => {
      p.status = 'WAITING';
    });
    log.push('All philosophers requested second fork; all blocked in WAITING state.');
  }

  // Step 8: Build Wait-For Graph
  if (step >= 8) {
    const requestedForks = { 1: 5, 2: 1, 3: 2, 4: 3, 5: 4 };
    const wfg = {};
    philosophers.forEach((p) => {
      const neededForkId = requestedForks[p.id];
      const targetFork = forks.find((f) => f.id === neededForkId);
      if (targetFork && targetFork.holder !== null && targetFork.holder !== p.id) {
        wfg[p.id] = targetFork.holder;
      }
    });
    waitForGraph = wfg;
    log.push('Wait-for graph constructed: P1→P5, P2→P1, P3→P2, P4→P3, P5→P4.');
  }

  // Step 9: Detect cycle in WFG
  if (step >= 9) {
    cycle = [1, 5, 4, 3, 2, 1];
    log.push('Cycle detection algorithm identified closed wait cycle: P1→P5→P4→P3→P2→P1.');
  }

  // Step 10: Deadlock
  if (step >= 10) {
    philosophers.forEach((p) => {
      p.status = 'DEADLOCKED';
    });
    log.push('Circular wait detected: P1→P5→P4→P3→P2→P1');
  }

  return {
    step,
    philosophers,
    forks,
    log,
    waitForGraph,
    cycle,
  };
}

/**
 * useDeadlockSim - Single source of truth simulation hook with explicit PAUSED state
 * 
 * Phases:
 * - READY: fresh/reset state, step 0
 * - RUNNING: autoplay is actively advancing steps
 * - PAUSED: autoplay was stopped before step 10; preserves exact state
 * - DEADLOCK: step 10 reached; simulation complete
 */
export function useDeadlockSim() {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5 | 1 | 1.5 | 2

  // Distinct phase calculation: READY | RUNNING | PAUSED | DEADLOCK
  const phase = useMemo(() => {
    if (step >= 10) return 'DEADLOCK';
    if (isRunning) return 'RUNNING';
    if (step > 0) return 'PAUSED';
    return 'READY';
  }, [step, isRunning]);

  // Derive all state synchronously from the single source of truth step
  const computedState = useMemo(() => {
    return calculateDeadlockStepState(step);
  }, [step]);

  // Autoplay interval runner
  useEffect(() => {
    if (!isRunning) return;

    if (step >= 10) {
      setIsRunning(false);
      return;
    }

    const intervalMs = Math.round(1000 / speed);
    const intervalId = setInterval(() => {
      setStep((currentStep) => {
        const nextStep = currentStep + 1;
        if (nextStep >= 10) {
          setIsRunning(false);
          return 10;
        }
        return nextStep;
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isRunning, speed, step]);

  // Starts or resumes autoplay
  const run = useCallback(() => {
    if (step >= 10) return;
    if (step === 0) {
      setStep(1);
    }
    setIsRunning(true);
  }, [step]);

  // Pauses autoplay immediately, preserving current step
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Replay from start
  const replay = useCallback(() => {
    setStep(1);
    setIsRunning(true);
  }, []);

  // Toggles run/pause or replays if at step 10
  const toggleRun = useCallback(() => {
    if (step >= 10) {
      replay();
      return;
    }
    if (isRunning) {
      pause();
    } else {
      run();
    }
  }, [isRunning, pause, run, replay, step]);

  // Advances exactly 1 step and leaves phase as PAUSED (unless reaching step 10 -> DEADLOCK)
  const stepForward = useCallback(() => {
    setIsRunning(false); // Stop autoplay
    setStep((currentStep) => {
      if (currentStep >= 10) return 10;
      return currentStep + 1;
    });
  }, []);

  // Scrubbing/jumping directly to any step (pauses autoplay)
  const jumpToStep = useCallback((targetStep) => {
    setIsRunning(false);
    setStep(Math.min(Math.max(0, targetStep), 10));
  }, []);

  // Resets to initial READY state, step 0
  const reset = useCallback(() => {
    setIsRunning(false);
    setStep(0);
  }, []);

  const changeSpeed = useCallback((newSpeed) => {
    setSpeed(newSpeed);
  }, []);

  return {
    step: computedState.step,
    phase,
    isRunning,
    speed,
    philosophers: computedState.philosophers,
    forks: computedState.forks,
    log: computedState.log,
    waitForGraph: computedState.waitForGraph,
    cycle: computedState.cycle,
    run,
    pause,
    replay,
    toggleRun,
    stepForward,
    jumpToStep,
    reset,
    setSpeed: changeSpeed,
  };
}
