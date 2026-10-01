import { useState, useCallback, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ProblemRecap from '../components/ProblemRecap';
import StrategySelector from '../components/StrategySelector';
import DiningTableSimulation from '../components/DiningTableSimulation';
import ThreadMutexMatrix from '../components/ThreadMutexMatrix';
import ProofPanel from '../components/ProofPanel';
import ComparisonSection from '../components/ComparisonSection';
import EventLog from '../components/EventLog';
import Footer from '../components/Footer';

export default function SolutionLab() {
  const [selectedStrategy, setSelectedStrategy] = useState('resource-ordering');
  const [simulationState, setSimulationState] = useState('deadlock'); // 'deadlock' or 'safe'
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);

  // Initial problem state (Deadlock)
  const initialPhilosophers = [
    { id: 1, state: 'BLOCKED', forks: [1], waitsFor: 2 },
    { id: 2, state: 'BLOCKED', forks: [2], waitsFor: 3 },
    { id: 3, state: 'BLOCKED', forks: [3], waitsFor: 4 },
    { id: 4, state: 'BLOCKED', forks: [4], waitsFor: 5 },
    { id: 5, state: 'BLOCKED', forks: [5], waitsFor: 1 },
  ];

  const initialForks = [
    { id: 1, owner: 1 },
    { id: 2, owner: 2 },
    { id: 3, owner: 3 },
    { id: 4, owner: 4 },
    { id: 5, owner: 5 },
  ];

  const initialEvents = [
    { time: '00:00.00', message: 'Simulation initialized with greedy acquisition' },
    { time: '00:00.50', message: 'All philosophers acquired left fork' },
    { time: '00:01.00', message: 'All philosophers waiting for right fork', type: 'error' },
    { time: '00:01.50', message: 'DEADLOCK DETECTED', type: 'error' }
  ];

  const [philosophers, setPhilosophers] = useState(initialPhilosophers);
  const [forks, setForks] = useState(initialForks);
  const [events, setEvents] = useState(initialEvents);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setStep(0);
    setSimulationState('deadlock');
    setPhilosophers(initialPhilosophers);
    setForks(initialForks);
    setEvents(initialEvents);
  }, []);

  const addEvent = (msg, type = 'normal') => {
    setEvents(prev => [...prev, { time: `00:0${2 + Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 99)}`, message: msg, type }]);
  };

  const playSimulation = useCallback(() => {
    if (selectedStrategy === 'resource-ordering') {
      setSimulationState('safe');
      setIsRunning(true);
      setStep(1);
      
      // Step 1: Reset to initial safe state applying resource ordering
      setPhilosophers([
        { id: 1, state: 'THINKING', forks: [], waitsFor: null },
        { id: 2, state: 'THINKING', forks: [], waitsFor: null },
        { id: 3, state: 'THINKING', forks: [], waitsFor: null },
        { id: 4, state: 'THINKING', forks: [], waitsFor: null },
        { id: 5, state: 'THINKING', forks: [], waitsFor: null },
      ]);
      setForks([
        { id: 1, owner: null },
        { id: 2, owner: null },
        { id: 3, owner: null },
        { id: 4, owner: null },
        { id: 5, owner: null },
      ]);
      
      setEvents([
        { time: '00:00.00', message: 'Applied Resource Ordering (Havender)' },
        { time: '00:00.20', message: 'All resources freed' }
      ]);
    }
  }, [selectedStrategy]);

  // Handle simulation steps
  useEffect(() => {
    if (!isRunning) return;

    let timer;
    if (step === 1) {
      timer = setTimeout(() => {
        // P1, P2, P3, P4 ask for their lower fork. P5 asks for F1.
        setPhilosophers(prev => prev.map(p => {
          if (p.id === 1) return { ...p, state: 'WAITING', forks: [1], waitsFor: 2 };
          if (p.id === 2) return { ...p, state: 'WAITING', forks: [2], waitsFor: 3 };
          if (p.id === 3) return { ...p, state: 'WAITING', forks: [3], waitsFor: 4 };
          if (p.id === 4) return { ...p, state: 'WAITING', forks: [4], waitsFor: 5 };
          if (p.id === 5) return { ...p, state: 'WAITING', forks: [], waitsFor: 1 }; // Wait without holding F5!
          return p;
        }));
        setForks([
          { id: 1, owner: 1 },
          { id: 2, owner: 2 },
          { id: 3, owner: 3 },
          { id: 4, owner: 4 },
          { id: 5, owner: null }, // F5 remains free!
        ]);
        addEvent('P1-P4 acquired lower fork. P5 requested F1.', 'normal');
        addEvent('P5 blocked on F1. F5 remains FREE.', 'success');
        setStep(2);
      }, 1500);
    } else if (step === 2) {
      timer = setTimeout(() => {
        // P4 can acquire F5
        setPhilosophers(prev => prev.map(p => {
          if (p.id === 4) return { ...p, state: 'EATING', forks: [4, 5], waitsFor: null };
          return p;
        }));
        setForks(prev => prev.map(f => f.id === 5 ? { ...f, owner: 4 } : f));
        addEvent('P4 acquired F5. P4 ENTERED critical section.', 'success');
        setStep(3);
      }, 1500);
    } else if (step === 3) {
      timer = setTimeout(() => {
        // P4 finishes, releases 4 and 5. P3 can eat.
        setPhilosophers(prev => prev.map(p => {
          if (p.id === 4) return { ...p, state: 'THINKING', forks: [], waitsFor: null };
          if (p.id === 3) return { ...p, state: 'EATING', forks: [3, 4], waitsFor: null };
          return p;
        }));
        setForks(prev => prev.map(f => {
          if (f.id === 5) return { ...f, owner: null };
          if (f.id === 4) return { ...f, owner: 3 };
          return f;
        }));
        addEvent('P4 finished eating, released F4 and F5.', 'normal');
        addEvent('P3 acquired F4. P3 ENTERED critical section.', 'success');
        setStep(4);
      }, 1500);
    } else if (step === 4) {
      timer = setTimeout(() => {
        addEvent('CIRCULAR WAIT BROKEN', 'success');
        addEvent('SAFE STATE', 'success');
        setIsRunning(false);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [isRunning, step]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-grow w-full space-y-8">
        
        <PageHeader 
          module="MODULE 03"
          title="🔄 Circular Wait → Prevention Lab"
          subtitle="Breaking the Cycle with Resource Ordering and Central Arbitration"
          status={simulationState === 'safe' ? "🟢 Safe State (Dijkstra Banker) | Contention: 0.0%" : "🔴 DEADLOCK DETECTED"}
        />

        {simulationState === 'deadlock' && <ProblemRecap />}

        <StrategySelector 
          selectedStrategy={selectedStrategy} 
          setSelectedStrategy={setSelectedStrategy} 
        />

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <DiningTableSimulation 
              strategy={selectedStrategy}
              philosophers={philosophers}
              forks={forks}
              onPlay={playSimulation}
              onReset={resetSimulation}
              simulationState={simulationState}
            />
            <EventLog events={events} />
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            <ThreadMutexMatrix 
              philosophers={philosophers}
              forks={forks}
              strategy={selectedStrategy}
            />
            <ProofPanel />
          </div>
        </div>

        <ComparisonSection />

      </div>
      <Footer />
    </div>
  );
}
