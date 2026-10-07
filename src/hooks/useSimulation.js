import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorld, stepWorld, snapshot, STEP_MS } from '../sim/engine';
import { STRATEGIES } from '../sim/strategies';

const TICK_MS = 50;

export function useSimulation(strategyId) {
  const worldRef = useRef(null);
  const [snap, setSnap] = useState(null);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);

  const reset = useCallback(() => {
    worldRef.current = createWorld(STRATEGIES[strategyId], 5, 7);
    setSnap(snapshot(worldRef.current));
    setRunning(true);
  }, [strategyId]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!running) return undefined;
    let acc = 0;
    const id = setInterval(() => {
      const w = worldRef.current;
      if (!w) return;
      acc += TICK_MS * speed;
      while (acc >= STEP_MS) {
        stepWorld(w);
        acc -= STEP_MS;
      }
      setSnap(snapshot(w));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, speed]);

  const toggle = useCallback(() => setRunning((r) => !r), []);
  return { snap, running, speed, setSpeed, toggle, reset };
}
