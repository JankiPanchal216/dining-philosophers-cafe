import { useState, useEffect, useRef, useCallback } from 'react';
import LabHeader from '../components/LabHeader';
import MutexScenario from '../components/MutexScenario';
import SemaphorePanel from '../components/SemaphorePanel';
import CriticalSectionPanel from '../components/CriticalSectionPanel';
import Footer from '../components/Footer';

export default function SynchronizationLab() {
  const [activeTab, setActiveTab] = useState('mutex');
  const [mutexOwner, setMutexOwner] = useState('P1');
  const [waitTime, setWaitTime] = useState(1420);
  const [p3HasPermit, setP3HasPermit] = useState(false);
  const [suiteRunning, setSuiteRunning] = useState(false);
  const [suiteResults, setSuiteResults] = useState([]);
  
  const [telemetry, setTelemetry] = useState([
    { time: '00:01.120', msg: 'P1 pthread_mutex_lock(&plate_lock) ACQUIRED', type: 'success' },
    { time: '00:01.145', msg: 'P2 pthread_mutex_lock(&plate_lock) BLOCKED (Futex Sleep)', type: 'error' },
    { time: '00:01.890', msg: 'SEM permits decremented to 0 CAPACITY_REACHED', type: 'info' },
    { time: '00:02.102', msg: 'P3 sem_wait(&permits) QUEUE_ENQUEUE', type: 'info' }
  ]);

  const mutexRef = useRef(null);
  const semRef = useRef(null);
  const csRef = useRef(null);

  const addTelemetry = useCallback((msg, type = 'info') => {
    setTelemetry(prev => [{
      time: `00:0${2 + Math.floor(Math.random()*5)}.${Math.floor(Math.random()*999)}`,
      msg,
      type
    }, ...prev]);
  }, []);

  // Wait timer for P2
  useEffect(() => {
    let interval;
    if (mutexOwner === 'P1') {
      interval = setInterval(() => {
        setWaitTime(w => w + 47);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [mutexOwner]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'mutex') mutexRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (tab === 'semaphore') semRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (tab === 'critical-section') csRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSimulateMutex = () => {
    setMutexOwner('P2');
    addTelemetry('P1 pthread_mutex_unlock(&plate_lock) → MUTEX_UNLOCKED', 'success');
    addTelemetry('P2 futex_wake() → lock acquired → ACQUIRED_0xCAFE', 'success');
  };

  const handleResetMutex = () => {
    setMutexOwner('P1');
    setWaitTime(1420);
    addTelemetry('Mutex simulation reset', 'info');
  };

  const handleTriggerSemPost = () => {
    setP3HasPermit(true);
    addTelemetry('P1 → sem_post(&permits) → SIGNAL_SENT', 'success');
    addTelemetry('P3 → sem_wait(&permits) unblocked → PERMIT_ACQUIRED', 'success');
  };

  const handleResetSem = () => {
    setP3HasPermit(false);
    addTelemetry('Semaphore simulation reset', 'info');
  };

  const runSuite = () => {
    setSuiteRunning(true);
    setSuiteResults([]);
    addTelemetry('SUITE Executing 10,000 pthread_create() cycles... RUNNING', 'info');
    
    setTimeout(() => {
      setSuiteResults(prev => [...prev, { title: 'Dijkstra Invariant 1: Mutual Exclusion', status: 'VERIFIED (0 Contention Leaks)' }]);
      addTelemetry('Invariant 1 VERIFIED', 'success');
    }, 1000);

    setTimeout(() => {
      setSuiteResults(prev => [...prev, { title: 'Dijkstra Invariant 2: Deadlock Freedom / Progress', status: 'VERIFIED' }]);
      addTelemetry('Invariant 2 VERIFIED', 'success');
    }, 2000);

    setTimeout(() => {
      setSuiteResults(prev => [...prev, { title: 'Dijkstra Invariant 3: Bounded Waiting Queue', status: 'VERIFIED (Max wait: 3 cycles)' }]);
      addTelemetry('Invariant 3 VERIFIED', 'success');
      setSuiteRunning(false);
    }, 3000);
  };

  const handleGlobalReset = () => {
    handleResetMutex();
    handleResetSem();
    setSuiteResults([]);
    setSuiteRunning(false);
    setTelemetry([
      { time: '00:00.000', msg: 'Global Reset Initiated', type: 'info' }
    ]);
  };

  // Bind top navbar Run/Reset buttons
  useEffect(() => {
    const runBtn = document.getElementById('nav-run-btn');
    const resetBtn = document.getElementById('nav-reset-btn');
    
    if (runBtn) runBtn.onclick = runSuite;
    if (resetBtn) resetBtn.onclick = handleGlobalReset;
    
    return () => {
      if (runBtn) runBtn.onclick = null;
      if (resetBtn) resetBtn.onclick = null;
    };
  }, [runSuite, handleGlobalReset]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-grow w-full space-y-8">
        
        <LabHeader activeTab={activeTab} onTabClick={handleTabClick} />

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7" ref={mutexRef}>
            <MutexScenario 
              mutexOwner={mutexOwner} 
              waitTime={waitTime} 
              onSimulate={handleSimulateMutex}
              onReset={handleResetMutex}
            />
          </div>
          <div className="lg:col-span-5" ref={semRef}>
            <SemaphorePanel 
              p3HasPermit={p3HasPermit}
              onTrigger={handleTriggerSemPost}
              onReset={handleResetSem}
            />
          </div>
        </div>

        <div ref={csRef}>
          <CriticalSectionPanel 
            runSuite={runSuite}
            suiteRunning={suiteRunning}
            suiteResults={suiteResults}
            telemetry={telemetry}
            onGlobalReset={handleGlobalReset}
          />
        </div>

      </div>
      <Footer />
    </div>
  );
}
