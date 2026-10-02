import { useState, useCallback, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import DiningTableSimulation from '../components/DiningTableSimulation';
import ThreadMutexMatrix from '../components/ThreadMutexMatrix';
import ProofPanel from '../components/ProofPanel';
import ComparisonSection from '../components/ComparisonSection';
import EventLog from '../components/EventLog';
import Footer from '../components/Footer';

/**
 * Deterministic step calculator for Solution Lab.
 * Single source of truth for both scenarios:
 * - 'without-fix': Naive Greedy Protocol (Deadlock Cycle)
 * - 'with-fix': Havender Resource Ordering (Safe State)
 */
function calculateSolutionStep(mode, stepNumber) {
  const maxStep = mode === 'without-fix' ? 3 : 6;
  const step = Math.min(Math.max(0, stepNumber), maxStep);

  if (mode === 'without-fix') {
    // Mode: Without Fix (Deadlock demonstration)
    if (step === 0) {
      return {
        step: 0,
        maxStep: 3,
        simulationState: 'deadlock',
        statusText: '🟡 Ready (Naive Greedy Protocol)',
        philosophers: [1, 2, 3, 4, 5].map(id => ({ id, state: 'THINKING', forks: [], waitsFor: null })),
        forks: [1, 2, 3, 4, 5].map(id => ({ id, owner: null })),
        events: [
          { time: '00:00.00', message: 'Initialized naive protocol: Greedy Left-First acquisition', type: 'normal' }
        ]
      };
    }
    if (step === 1) {
      return {
        step: 1,
        maxStep: 3,
        simulationState: 'deadlock',
        statusText: '🟡 Contention: All Hungry',
        philosophers: [1, 2, 3, 4, 5].map(id => ({ id, state: 'HUNGRY', forks: [], waitsFor: null })),
        forks: [1, 2, 3, 4, 5].map(id => ({ id, owner: null })),
        events: [
          { time: '00:00.00', message: 'Initialized naive protocol: Greedy Left-First acquisition', type: 'normal' },
          { time: '00:00.50', message: 'All philosophers became HUNGRY and requested left-hand fork', type: 'normal' }
        ]
      };
    }
    if (step === 2) {
      return {
        step: 2,
        maxStep: 3,
        simulationState: 'deadlock',
        statusText: '🟠 Hold & Wait Condition Met',
        philosophers: [1, 2, 3, 4, 5].map(id => ({ id, state: 'WAITING', forks: [id], waitsFor: null })),
        forks: [1, 2, 3, 4, 5].map(id => ({ id, owner: id })),
        events: [
          { time: '00:00.00', message: 'Initialized naive protocol: Greedy Left-First acquisition', type: 'normal' },
          { time: '00:00.50', message: 'All philosophers became HUNGRY and requested left-hand fork', type: 'normal' },
          { time: '00:01.00', message: 'All philosophers acquired left fork (F1..F5 held)', type: 'normal' }
        ]
      };
    }
    // step === 3 (Deadlocked)
    return {
      step: 3,
      maxStep: 3,
      simulationState: 'deadlock',
      statusText: '🔴 DEADLOCK DETECTED',
      philosophers: [
        { id: 1, state: 'DEADLOCKED', forks: [1], waitsFor: 5 },
        { id: 2, state: 'DEADLOCKED', forks: [2], waitsFor: 1 },
        { id: 3, state: 'DEADLOCKED', forks: [3], waitsFor: 2 },
        { id: 4, state: 'DEADLOCKED', forks: [4], waitsFor: 3 },
        { id: 5, state: 'DEADLOCKED', forks: [5], waitsFor: 4 },
      ],
      forks: [
        { id: 1, owner: 1 },
        { id: 2, owner: 2 },
        { id: 3, owner: 3 },
        { id: 4, owner: 4 },
        { id: 5, owner: 5 },
      ],
      events: [
        { time: '00:00.00', message: 'Initialized naive protocol: Greedy Left-First acquisition', type: 'normal' },
        { time: '00:00.50', message: 'All philosophers became HUNGRY and requested left-hand fork', type: 'normal' },
        { time: '00:01.00', message: 'All philosophers acquired left fork (F1..F5 held)', type: 'normal' },
        { time: '00:01.50', message: 'All philosophers waiting for right fork held by neighbor', type: 'error' },
        { time: '00:02.00', message: 'DEADLOCK DETECTED: Cycle P1 → P5 → P4 → P3 → P2 → P1', type: 'error' }
      ]
    };
  }

  // Mode: With Havender Ordering
  if (step === 0) {
    return {
      step: 0,
      maxStep: 6,
      simulationState: 'safe',
      statusText: '🟢 Ready (Havender Total Order)',
      philosophers: [1, 2, 3, 4, 5].map(id => ({ id, state: 'THINKING', forks: [], waitsFor: null })),
      forks: [1, 2, 3, 4, 5].map(id => ({ id, owner: null })),
      events: [
        { time: '00:00.00', message: 'Applied Havender Resource Ordering (Flow < Fhigh)', type: 'normal' },
        { time: '00:00.20', message: 'All held forks released. Total ordering constraint enforced.', type: 'success' }
      ]
    };
  }
  if (step === 1) {
    return {
      step: 1,
      maxStep: 6,
      simulationState: 'safe',
      statusText: '🟢 Running: P3 Eating',
      philosophers: [
        { id: 1, state: 'HUNGRY', forks: [1], waitsFor: 5 },
        { id: 2, state: 'WAITING', forks: [], waitsFor: 1 },
        { id: 3, state: 'EATING', forks: [2, 3], waitsFor: null },
        { id: 4, state: 'THINKING', forks: [], waitsFor: null },
        { id: 5, state: 'THINKING', forks: [], waitsFor: null },
      ],
      forks: [
        { id: 1, owner: 1 },
        { id: 2, owner: 3 },
        { id: 3, owner: 3 },
        { id: 4, owner: null },
        { id: 5, owner: null },
      ],
      events: [
        { time: '00:00.00', message: 'Applied Havender Resource Ordering (Flow < Fhigh)', type: 'normal' },
        { time: '00:00.20', message: 'All held forks released. Total ordering constraint enforced.', type: 'success' },
        { time: '00:01.50', message: 'P1 acquired F1. P2 contends for F1 first (F1 < F2) and blocks.', type: 'normal' },
        { time: '00:01.70', message: 'F2 remains FREE! P3 acquired F2 & F3 and entered Critical Section (EATING).', type: 'success' }
      ]
    };
  }
  if (step === 2) {
    return {
      step: 2,
      maxStep: 6,
      simulationState: 'safe',
      statusText: '🟢 Running: P4 Eating',
      philosophers: [
        { id: 1, state: 'HUNGRY', forks: [1], waitsFor: 5 },
        { id: 2, state: 'WAITING', forks: [], waitsFor: 1 },
        { id: 3, state: 'THINKING', forks: [], waitsFor: null },
        { id: 4, state: 'EATING', forks: [3, 4], waitsFor: null },
        { id: 5, state: 'THINKING', forks: [], waitsFor: null },
      ],
      forks: [
        { id: 1, owner: 1 },
        { id: 2, owner: null },
        { id: 3, owner: 4 },
        { id: 4, owner: 4 },
        { id: 5, owner: null },
      ],
      events: [
        { time: '00:00.00', message: 'Applied Havender Resource Ordering (Flow < Fhigh)', type: 'normal' },
        { time: '00:00.20', message: 'All held forks released. Total ordering constraint enforced.', type: 'success' },
        { time: '00:01.50', message: 'P1 acquired F1. P2 contends for F1 first (F1 < F2) and blocks.', type: 'normal' },
        { time: '00:01.70', message: 'F2 remains FREE! P3 acquired F2 & F3 and entered Critical Section (EATING).', type: 'success' },
        { time: '00:03.00', message: 'P3 finished eating, released F2 & F3.', type: 'normal' },
        { time: '00:03.20', message: 'P4 acquired F3 & F4 and entered Critical Section (EATING).', type: 'success' }
      ]
    };
  }
  if (step === 3) {
    return {
      step: 3,
      maxStep: 6,
      simulationState: 'safe',
      statusText: '🟢 Running: P5 Eating',
      philosophers: [
        { id: 1, state: 'HUNGRY', forks: [1], waitsFor: 5 },
        { id: 2, state: 'WAITING', forks: [], waitsFor: 1 },
        { id: 3, state: 'THINKING', forks: [], waitsFor: null },
        { id: 4, state: 'THINKING', forks: [], waitsFor: null },
        { id: 5, state: 'EATING', forks: [4, 5], waitsFor: null },
      ],
      forks: [
        { id: 1, owner: 1 },
        { id: 2, owner: null },
        { id: 3, owner: null },
        { id: 4, owner: 5 },
        { id: 5, owner: 5 },
      ],
      events: [
        { time: '00:00.00', message: 'Applied Havender Resource Ordering (Flow < Fhigh)', type: 'normal' },
        { time: '00:00.20', message: 'All held forks released. Total ordering constraint enforced.', type: 'success' },
        { time: '00:01.50', message: 'P1 acquired F1. P2 contends for F1 first (F1 < F2) and blocks.', type: 'normal' },
        { time: '00:01.70', message: 'F2 remains FREE! P3 acquired F2 & F3 and entered Critical Section (EATING).', type: 'success' },
        { time: '00:03.00', message: 'P3 finished eating, released F2 & F3.', type: 'normal' },
        { time: '00:03.20', message: 'P4 acquired F3 & F4 and entered Critical Section (EATING).', type: 'success' },
        { time: '00:04.50', message: 'P4 released F3 & F4. P5 acquired F4 & F5, eating.', type: 'success' }
      ]
    };
  }
  if (step === 4) {
    return {
      step: 4,
      maxStep: 6,
      simulationState: 'safe',
      statusText: '🟢 Running: P1 Eating',
      philosophers: [
        { id: 1, state: 'EATING', forks: [1, 5], waitsFor: null },
        { id: 2, state: 'WAITING', forks: [], waitsFor: 1 },
        { id: 3, state: 'THINKING', forks: [], waitsFor: null },
        { id: 4, state: 'THINKING', forks: [], waitsFor: null },
        { id: 5, state: 'THINKING', forks: [], waitsFor: null },
      ],
      forks: [
        { id: 1, owner: 1 },
        { id: 2, owner: null },
        { id: 3, owner: null },
        { id: 4, owner: null },
        { id: 5, owner: 1 },
      ],
      events: [
        { time: '00:00.00', message: 'Applied Havender Resource Ordering (Flow < Fhigh)', type: 'normal' },
        { time: '00:00.20', message: 'All held forks released. Total ordering constraint enforced.', type: 'success' },
        { time: '00:01.50', message: 'P1 acquired F1. P2 contends for F1 first (F1 < F2) and blocks.', type: 'normal' },
        { time: '00:01.70', message: 'F2 remains FREE! P3 acquired F2 & F3 and entered Critical Section (EATING).', type: 'success' },
        { time: '00:03.00', message: 'P3 finished eating, released F2 & F3.', type: 'normal' },
        { time: '00:03.20', message: 'P4 acquired F3 & F4 and entered Critical Section (EATING).', type: 'success' },
        { time: '00:04.50', message: 'P4 released F3 & F4. P5 acquired F4 & F5, eating.', type: 'success' },
        { time: '00:06.00', message: 'P5 released F4 & F5. P1 acquired F5, now EATING with F1 & F5.', type: 'success' }
      ]
    };
  }
  if (step === 5) {
    return {
      step: 5,
      maxStep: 6,
      simulationState: 'safe',
      statusText: '🟢 Running: P2 Eating',
      philosophers: [
        { id: 1, state: 'THINKING', forks: [], waitsFor: null },
        { id: 2, state: 'EATING', forks: [1, 2], waitsFor: null },
        { id: 3, state: 'THINKING', forks: [], waitsFor: null },
        { id: 4, state: 'THINKING', forks: [], waitsFor: null },
        { id: 5, state: 'THINKING', forks: [], waitsFor: null },
      ],
      forks: [
        { id: 1, owner: 2 },
        { id: 2, owner: 2 },
        { id: 3, owner: null },
        { id: 4, owner: null },
        { id: 5, owner: null },
      ],
      events: [
        { time: '00:00.00', message: 'Applied Havender Resource Ordering (Flow < Fhigh)', type: 'normal' },
        { time: '00:00.20', message: 'All held forks released. Total ordering constraint enforced.', type: 'success' },
        { time: '00:01.50', message: 'P1 acquired F1. P2 contends for F1 first (F1 < F2) and blocks.', type: 'normal' },
        { time: '00:01.70', message: 'F2 remains FREE! P3 acquired F2 & F3 and entered Critical Section (EATING).', type: 'success' },
        { time: '00:03.00', message: 'P3 finished eating, released F2 & F3.', type: 'normal' },
        { time: '00:03.20', message: 'P4 acquired F3 & F4 and entered Critical Section (EATING).', type: 'success' },
        { time: '00:04.50', message: 'P4 released F3 & F4. P5 acquired F4 & F5, eating.', type: 'success' },
        { time: '00:06.00', message: 'P5 released F4 & F5. P1 acquired F5, now EATING with F1 & F5.', type: 'success' },
        { time: '00:07.50', message: 'P1 finished eating, released F1 & F5.', type: 'normal' },
        { time: '00:07.70', message: 'P2 unblocked! Acquired F1 & F2 and entered Critical Section (EATING).', type: 'success' }
      ]
    };
  }
  // step === 6
  return {
    step: 6,
    maxStep: 6,
    simulationState: 'safe',
    statusText: '🟢 Safe State (Havender Order) | Deadlocks: 0',
    philosophers: [1, 2, 3, 4, 5].map(id => ({ id, state: 'THINKING', forks: [], waitsFor: null })),
    forks: [1, 2, 3, 4, 5].map(id => ({ id, owner: null })),
    events: [
      { time: '00:00.00', message: 'Applied Havender Resource Ordering (Flow < Fhigh)', type: 'normal' },
      { time: '00:00.20', message: 'All held forks released. Total ordering constraint enforced.', type: 'success' },
      { time: '00:01.50', message: 'P1 acquired F1. P2 contends for F1 first (F1 < F2) and blocks.', type: 'normal' },
      { time: '00:01.70', message: 'F2 remains FREE! P3 acquired F2 & F3 and entered Critical Section (EATING).', type: 'success' },
      { time: '00:03.00', message: 'P3 finished eating, released F2 & F3.', type: 'normal' },
      { time: '00:03.20', message: 'P4 acquired F3 & F4 and entered Critical Section (EATING).', type: 'success' },
      { time: '00:04.50', message: 'P4 released F3 & F4. P5 acquired F4 & F5, eating.', type: 'success' },
      { time: '00:06.00', message: 'P5 released F4 & F5. P1 acquired F5, now EATING with F1 & F5.', type: 'success' },
      { time: '00:07.50', message: 'P1 finished eating, released F1 & F5.', type: 'normal' },
      { time: '00:07.70', message: 'P2 unblocked! Acquired F1 & F2 and entered Critical Section (EATING).', type: 'success' },
      { time: '00:09.00', message: 'CIRCULAR WAIT BROKEN: Total ordering eliminates cyclic dependency.', type: 'success' },
      { time: '00:09.20', message: 'SAFE STATE VERIFIED: All 5 philosophers completed execution.', type: 'success' }
    ]
  };
}

export default function SolutionLab() {
  const [mode, setMode] = useState('with-fix'); // 'without-fix' | 'with-fix'
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Derive all state purely from single source of truth (mode, step)
  const currentState = useMemo(() => {
    return calculateSolutionStep(mode, step);
  }, [mode, step]);

  const {
    maxStep,
    simulationState,
    statusText,
    philosophers,
    forks,
    events
  } = currentState;

  const isFinished = step >= maxStep;

  // Single timer runner with proper cleanup (Never moves window viewport)
  useEffect(() => {
    if (!isRunning) return;

    if (step >= maxStep) {
      setIsRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      setStep((current) => {
        const next = current + 1;
        if (next >= maxStep) {
          setIsRunning(false);
        }
        return next;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [isRunning, step, maxStep]);

  // Mode Selection: changes scenario without automatically starting playback
  const handleModeChange = useCallback((newMode) => {
    if (newMode === mode) return;
    setIsRunning(false);
    setMode(newMode);
    setStep(0);
  }, [mode]);

  // Transport Bar: Play / Pause / Resume / Replay
  const handlePrimaryAction = useCallback(() => {
    if (isFinished) {
      // Replay: reset to step 0 and start running immediately
      setStep(0);
      setIsRunning(true);
      return;
    }
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    // Start or Resume
    setIsRunning(true);
  }, [isFinished, isRunning]);

  // Transport Bar: Step Forward
  const handleStepForward = useCallback(() => {
    setIsRunning(false);
    setStep((prev) => Math.min(prev + 1, maxStep));
  }, [maxStep]);

  // Transport Bar: Reset
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStep(0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-grow w-full space-y-6">
        
        {/* Module Header */}
        <PageHeader 
          module="MODULE 03"
          title="🔄 Circular Wait → Prevention Lab"
          subtitle="Breaking the Cycle with Resource Ordering and Central Arbitration"
          status={statusText}
        />

        {/* Main Grid: Clean top alignment without excessive empty space */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Simulation Canvas & Contained Event Log */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <DiningTableSimulation 
              mode={mode}
              onModeChange={handleModeChange}
              step={step}
              maxStep={maxStep}
              isRunning={isRunning}
              isFinished={isFinished}
              philosophers={philosophers}
              forks={forks}
              onPrimaryAction={handlePrimaryAction}
              onStepForward={handleStepForward}
              onReset={handleReset}
              simulationState={simulationState}
            />
            
            {/* Event log with contained internal scrolling, never page-level scroll */}
            <EventLog events={events} />
          </div>
          
          {/* Right Column: Mutex Matrix & Mathematical Proof */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <ThreadMutexMatrix 
              philosophers={philosophers}
              strategy={mode === 'with-fix' ? 'resource-ordering' : 'greedy'}
            />
            <ProofPanel />
          </div>
        </div>

        {/* Comparative Analysis Section */}
        <ComparisonSection />

      </div>
      <Footer />
    </div>
  );
}
