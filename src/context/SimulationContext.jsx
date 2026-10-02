import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  createInitialSimulationState, 
  getCircularWaitStepState, 
  getHavenderSafeStepState 
} from '../simulation/concurrencyEngine';
import { useDeadlockSim as useDeadlockSimHook } from '../hooks/useDeadlockSim';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [simulationState, setSimulationState] = useState(createInitialSimulationState);
  const [activeScenario, setActiveScenario] = useState('circular_wait');
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Instantiates the dedicated Deadlock Lab simulation state machine
  const deadlockSim = useDeadlockSimHook();

  // Stop any running timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getNextStepState = useCallback((scenario, currentStep) => {
    if (scenario === 'circular_wait') {
      return getCircularWaitStepState(currentStep);
    }
    return getHavenderSafeStepState(currentStep);
  }, []);

  // Step forward by 1 for Dashboard
  const stepScenario = useCallback(() => {
    setSimulationState(prev => {
      const nextStep = prev.step + 1;
      if (nextStep > prev.totalSteps) {
        setIsRunning(false);
        return prev;
      }
      return getNextStepState(activeScenario, nextStep);
    });
  }, [activeScenario, getNextStepState]);

  // Run the scenario automatically for Dashboard
  const runScenario = useCallback((scenarioToRun = activeScenario) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(true);

    // If starting from clean state or completed/deadlocked, start from step 1
    setSimulationState(prev => {
      const startStep = prev.step >= prev.totalSteps ? 1 : prev.step + 1;
      return getNextStepState(scenarioToRun, startStep);
    });

    timerRef.current = setInterval(() => {
      setSimulationState(prev => {
        const nextStep = prev.step + 1;
        const nextState = getNextStepState(scenarioToRun, nextStep);

        if (nextStep >= prev.totalSteps || nextState.status === 'DEADLOCK_DETECTED' || nextState.status === 'COMPLETED') {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRunning(false);
        }
        return nextState;
      });
    }, 1200);
  }, [activeScenario, getNextStepState]);

  // Pause for Dashboard
  const pauseSimulation = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Reset to initial clean READY state for Dashboard
  const resetSimulation = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setSimulationState(createInitialSimulationState());
  }, []);

  // Switch scenario for Dashboard
  const switchScenario = useCallback((newScenario) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setActiveScenario(newScenario);
    const initial = createInitialSimulationState();
    initial.scenario = newScenario;
    if (newScenario === 'havender_safe') {
      initial.totalSteps = 6;
      initial.events = [
        {
          id: 'ev-init-safe',
          time: initial.events[0].time,
          message: 'Switched to Havender Resource Ordering (Deadlock-Free). System is in READY state.',
          type: 'normal'
        }
      ];
    }
    setSimulationState(initial);
  }, []);

  const value = {
    simulationState,
    philosophers: simulationState.philosophers,
    forks: simulationState.forks,
    status: simulationState.status,
    deadlockDetected: simulationState.deadlockDetected,
    starvationDetected: simulationState.starvationDetected,
    cycle: simulationState.cycle,
    cyclePath: simulationState.cyclePath,
    waitForGraph: simulationState.waitForGraph,
    events: simulationState.events,
    activeScenario,
    switchScenario,
    step: simulationState.step,
    totalSteps: simulationState.totalSteps,
    isRunning,
    runScenario,
    pauseSimulation,
    resetSimulation,
    stepScenario,
    deadlockSim,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
