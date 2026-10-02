import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, Play, Pause, RotateCcw, CheckCircle2, Info, ListOrdered } from 'lucide-react';
import Footer from '../components/Footer';

export default function StarvationLab() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarving, setIsStarving] = useState(true);
  const [waitingTime, setWaitingTime] = useState(18.4);
  const [fifoApplied, setFifoApplied] = useState(false);
  const [contentionLevel, setContentionLevel] = useState("Extreme (98.2%)");

  const [philosophers, setPhilosophers] = useState([
    { id: "P1", state: "Eating", runs: 8, wait: 0.8 },
    { id: "P2", state: "Eating (Aggressive)", runs: 9, wait: 0.5 },
    { id: "P3", state: "Waiting (CRITICAL)", runs: 0, wait: 18.4 },
    { id: "P4", state: "Eating (Aggressive)", runs: 7, wait: 0.9 },
    { id: "P5", state: "Eating", runs: 8, wait: 0.4 }
  ]);

  const [forks, setForks] = useState([
    { id: "F1", status: "Busy" },
    { id: "F2", status: "Held by P2" },
    { id: "F3", status: "HOARDED" },
    { id: "F4", status: "HOARDED" },
    { id: "F5", status: "Held by P1" }
  ]);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setWaitingTime(prev => {
          const newWait = prev + 0.1;
          setPhilosophers(phils => phils.map(p => 
            p.id === "P3" && isStarving ? { ...p, wait: newWait } : p
          ));
          return newWait;
        });

        // Simulate P2 and P4 cycles increasing if starving
        if (isStarving) {
          setPhilosophers(phils => phils.map(p => {
            if (p.id === "P2" && Math.random() > 0.9) return { ...p, runs: p.runs + 1 };
            if (p.id === "P4" && Math.random() > 0.9) return { ...p, runs: p.runs + 1 };
            return p;
          }));
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused, isStarving]);

  const handleRun = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsStarving(true);
    setWaitingTime(18.4);
    setFifoApplied(false);
    setContentionLevel("Extreme (98.2%)");
    setPhilosophers([
      { id: "P1", state: "Eating", runs: 8, wait: 0.8 },
      { id: "P2", state: "Eating (Aggressive)", runs: 9, wait: 0.5 },
      { id: "P3", state: "Waiting (CRITICAL)", runs: 0, wait: 18.4 },
      { id: "P4", state: "Eating (Aggressive)", runs: 7, wait: 0.9 },
      { id: "P5", state: "Eating", runs: 8, wait: 0.4 }
    ]);
    setForks([
      { id: "F1", status: "Busy" },
      { id: "F2", status: "Held by P2" },
      { id: "F3", status: "HOARDED" },
      { id: "F4", status: "HOARDED" },
      { id: "F5", status: "Held by P1" }
    ]);
  };

  const handleApplyFifo = () => {
    setFifoApplied(true);
    setIsStarving(false);
    setContentionLevel("Balanced (12.4%)");
    
    // Update P3
    setPhilosophers(phils => phils.map(p => {
      if (p.id === "P3") return { ...p, state: "Eating (Bounded)", runs: 1, wait: 3.2 };
      if (p.id === "P2") return { ...p, state: "Waiting", wait: 0.0 };
      if (p.id === "P4") return { ...p, state: "Waiting", wait: 0.0 };
      return p;
    }));

    setForks([
      { id: "F1", status: "Held by P1" },
      { id: "F2", status: "Busy" },
      { id: "F3", status: "Held by P3" },
      { id: "F4", status: "Held by P3" },
      { id: "F5", status: "Busy" }
    ]);

    setWaitingTime(3.2); // Wait resolved to 3.2s
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Page Header */}
      <div className="border-b border-theme-border bg-theme-surface shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-sans">⚠️ Starvation Lab · Indefinite Waiting & Unfair Scheduling</h1>
            <p className="text-sm text-theme-textMuted">Observe how aggressive neighboring threads can perpetually starve an unlucky process.</p>
          </div>
          <div className="flex flex-col items-end text-sm">
            {fifoApplied ? (
               <div className="text-theme-success font-bold flex items-center gap-2">
                 🟢 FAIRNESS ACTIVE
               </div>
            ) : (
               <div className="text-theme-error font-bold flex items-center gap-2 animate-pulse">
                 🔴 ACTIVE CONTENTION: ASYMMETRIC GREED
               </div>
            )}
            <div className="font-mono text-xs text-theme-textMuted mt-1 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              Pthreads FIFO Queue: {fifoApplied ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 flex-grow w-full">
        {/* 12 Column Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: 4 columns */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Critical Status Banner */}
            {!fifoApplied ? (
              <div className="bg-red-50 border-2 border-theme-error rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-theme-error font-bold text-lg mb-2">
                  <AlertTriangle size={20} />
                  ⚠️ Starvation Detected · Thread P3 Starving
                </div>
                <p className="text-sm text-theme-textMuted font-medium">
                  Threads P2 and P4 are alternating lock acquisitions of Mutex F3 & F4, leaving P3 with 0 execution turns.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-theme-success rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-theme-success font-bold text-lg mb-2">
                  <CheckCircle2 size={20} />
                  🟢 FIFO Fairness Active · P3 Starvation Eliminated
                </div>
                <p className="text-sm text-theme-textMuted font-medium">
                  Fair scheduling queues enforce bounded wait: adjacent neighbors surrendered forks F3 and F4 upon queue exhaustion.
                </p>
              </div>
            )}

            {/* Waiting Timer */}
            <div className="card-surface p-5 text-center">
              <div className="text-xs font-bold text-theme-textMuted tracking-widest uppercase mb-1">Target Thread Telemetry</div>
              <div className="text-sm font-bold mb-4">THREAD ID: P3</div>
              
              <div className={`inline-block px-4 py-2 rounded-lg font-mono text-sm font-bold mb-2 ${fifoApplied ? 'bg-theme-success text-white' : 'bg-theme-error text-white'}`}>
                {fifoApplied ? 'WAIT BOUNDED' : 'INDEFINITE BLOCKED TIME'}
              </div>
              <div className={`text-4xl font-mono font-bold flex items-center justify-center gap-2 ${fifoApplied ? 'text-theme-success' : 'text-theme-error'}`}>
                <Clock size={28} />
                Waiting: {waitingTime.toFixed(1)}s
              </div>
            </div>

            {/* Process Table Diagnostics */}
            <div className="card-surface p-5">
              <h3 className="font-bold mb-4">Process Diagnostics</h3>
              <div className="space-y-3">
                {philosophers.map(p => (
                  <div key={p.id} className={`p-3 rounded-lg border text-sm font-mono flex justify-between items-center ${
                    p.id === 'P3' ? (fifoApplied ? 'bg-green-50 border-theme-success/30' : 'bg-red-50 border-theme-error/50 shadow-sm') : 
                    (p.id === 'P2' || p.id === 'P4' ? 'bg-orange-50/50 border-orange-200' : 'bg-gray-50 border-theme-border')
                  }`}>
                    <div>
                      <div className={`font-bold text-base ${p.id === 'P3' && !fifoApplied ? 'text-theme-error' : p.id==='P3' && fifoApplied ? 'text-theme-success' : 'text-theme-text'}`}>
                        {p.id} - {p.state}
                      </div>
                      <div className="text-xs text-theme-textMuted mt-1">
                        Runs: {p.runs} | Wait: {p.wait.toFixed(1)}s
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation Card */}
            <div className="card-surface p-5 bg-blue-50 border-blue-200">
              <h3 className="font-bold flex items-center gap-2 text-blue-900 mb-2">
                <Info size={18} /> 💡 What causes starvation?
              </h3>
              <p className="text-sm text-blue-800">
                A process may wait indefinitely because other processes repeatedly receive access to the required resources due to unfair priority or timing synchronicity. Unlike deadlock, other threads are making progress while one thread starves.
              </p>
            </div>

          </div>

          {/* CENTER PANEL: 5 columns */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="card-surface p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-8 text-xs font-mono font-bold text-theme-textMuted">
                <div>
                  TOPOLOGY: 5-NODE RING<br/>
                  RESOURCE: 5 BINARY MUTEXES
                </div>
                <div className="text-right">
                  Lock Cadence: 2.4 Hz
                </div>
              </div>

              {/* Circular Table */}
              <div className="flex-grow relative flex items-center justify-center min-h-[400px]">
                
                {/* Table */}
                <div className="absolute w-40 h-40 rounded-full border-4 border-theme-border bg-theme-bg flex flex-col items-center justify-center text-center shadow-inner z-0">
                  <span className="text-2xl mb-1">🍽️</span>
                  <span className="text-xs font-bold font-sans">Shared Memory</span>
                  <span className="text-[10px] font-mono text-theme-textMuted">Heap Buffer [0..4]</span>
                </div>

                {/* Nodes */}
                <div className="relative w-80 h-80 z-10">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const p = philosophers[i];
                    const f = forks[i];
                    
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const fAngle = angle + Math.PI / 5;
                    
                    const px = Math.cos(angle) * 140;
                    const py = Math.sin(angle) * 140;
                    
                    const fx = Math.cos(fAngle) * 80;
                    const fy = Math.sin(fAngle) * 80;

                    const isP3 = p.id === "P3";

                    return (
                      <div key={i}>
                        {/* Philosopher */}
                        <div 
                          className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-2 flex flex-col items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${
                            isP3 && !fifoApplied ? 'border-theme-error bg-red-100 text-theme-error shadow-[0_0_15px_rgba(186,26,26,0.5)] animate-pulse scale-110' :
                            isP3 && fifoApplied ? 'border-theme-success bg-green-100 text-theme-success' :
                            p.state.includes('Eating') ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-400 bg-gray-100 text-gray-700'
                          }`}
                          style={{ left: `calc(50% + ${px}px)`, top: `calc(50% + ${py}px)` }}
                        >
                          {p.id}
                        </div>

                        {/* Status Label */}
                        <div 
                          className={`absolute font-mono text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded shadow-sm text-center transform -translate-x-1/2 mt-9 ${
                            isP3 && !fifoApplied ? 'bg-theme-error text-white font-bold' :
                            isP3 && fifoApplied ? 'bg-theme-success text-white font-bold' :
                            'bg-white border border-gray-200'
                          }`}
                          style={{ left: `calc(50% + ${px}px)`, top: `calc(50% + ${py}px)` }}
                        >
                          <div className="font-bold">
                            {isP3 && !fifoApplied ? 'STARVING / BLOCKED' : 
                             isP3 && fifoApplied ? 'SERVING NOW / EATING' : 
                             p.state.includes('Aggressive') ? 'EATING' : p.state.toUpperCase()}
                          </div>
                          {isP3 ? (
                            <div className="text-[8px] flex items-center justify-center gap-1">
                              {!fifoApplied ? <>⏳ Waiting: {p.wait.toFixed(1)}s</> : <>✓ (Wait Resolved: 3.2s)</>}
                            </div>
                          ) : (
                            <div className="text-[8px] text-gray-500">
                              {p.state.includes('Eating') ? `Cycles: ${p.runs}` : `T: ${p.wait}s`}
                            </div>
                          )}
                        </div>

                        {/* Fork */}
                        <div 
                          className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold shadow-sm transition-colors duration-500 ${
                            f.status.includes('HOARDED') ? 'bg-red-50 border-theme-error text-theme-error' :
                            f.status.includes('Held') || f.status === 'Busy' ? 'bg-green-100 border-green-500 text-green-700' : 
                            'bg-gray-100 border-gray-400 text-gray-500'
                          }`}
                          style={{ left: `calc(50% + ${fx}px)`, top: `calc(50% + ${fy}px)` }}
                        >
                          {f.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="border-t border-theme-border pt-4 mt-6">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button onClick={handleRun} disabled={isRunning && !isPaused} className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white font-bold rounded-lg hover:bg-theme-primaryContainer disabled:opacity-50">
                    <Play size={16} fill="currentColor" /> Run Starvation Loop
                  </button>
                  <button onClick={handlePause} disabled={!isRunning || isPaused} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50">
                    <Pause size={16} fill="currentColor" /> Pause
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: 3 columns */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            <div className="card-surface p-5 border-t-4 border-theme-primary">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">The Solution</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-theme-primary bg-theme-bg px-2 py-1 rounded">Bounded Waiting</span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  ⚖️ Fair / FIFO Scheduling Queue
                </h4>
                <p className="text-xs text-theme-textMuted">
                  Tracks arrival time and waiting duration. Guarantees bounded waiting: no philosopher can eat twice while an adjacent neighbor is waiting.
                </p>
              </div>

              <div className="bg-gray-50 border border-theme-border rounded-xl p-4 mb-4">
                <div className="text-xs font-bold text-theme-textMuted mb-2 uppercase flex items-center gap-2">
                  <ListOrdered size={14} /> ADMITTANCE PRIORITY QUEUE
                </div>
                <div className="font-mono text-sm font-bold text-theme-text mb-3">
                  FIFO Head: P3
                </div>
                
                <div className="flex items-center gap-2 text-xs font-mono overflow-hidden">
                  <div className="bg-theme-primary text-white px-2 py-1 rounded shadow-sm flex-shrink-0">[P3 (18.4s)]</div>
                  <span className="text-theme-textMuted">→</span>
                  <div className="bg-white border border-theme-border px-2 py-1 rounded flex-shrink-0">[P5 (1.2s)]</div>
                  <span className="text-theme-textMuted">→</span>
                  <div className="bg-white border border-theme-border px-2 py-1 rounded flex-shrink-0">[P2 (0.5s)]</div>
                </div>
                <div className="flex justify-between text-[10px] text-theme-textMuted mt-2 font-bold uppercase">
                  <span>High Priority</span>
                  <span>Low Priority</span>
                </div>
              </div>

              <button 
                onClick={handleApplyFifo}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-theme-secondary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Play size={16} fill="currentColor" /> Apply Fairness / FIFO Priority
              </button>
            </div>

            {/* Outcome Card */}
            {fifoApplied && (
              <div className="card-surface p-5 bg-green-50 border-green-200 animate-fade-in">
                <h3 className="font-bold text-theme-success mb-3">🟢 Starvation Prevented · Max Wait Bounded to 3.2s</h3>
                <ul className="text-sm space-y-2 text-green-900 list-disc pl-4">
                  <li>P3 elevated to top priority via aging factor.</li>
                  <li>Neighbors P2 & P4 forced to yield shared mutexes F3 and F4.</li>
                  <li>Thread P3 successfully acquires locks and transitions to EATING!</li>
                </ul>
              </div>
            )}

            {/* Formal Proof Matrix */}
            <div className="card-surface p-5 font-mono text-sm">
              <h3 className="font-bold font-sans text-theme-text mb-4">FORMAL PROOF MATRIX</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-theme-textMuted mb-1">Max Wait Guarantee (W):</div>
                  <div className="font-bold">2 × T_eat + T_switch</div>
                </div>
                <div>
                  <div className="text-theme-textMuted mb-1">Fairness Invariant:</div>
                  <div className="font-bold">Strict Liveness</div>
                </div>
                <div>
                  <div className="text-theme-textMuted mb-1">Contention Level:</div>
                  <div className={`font-bold ${fifoApplied ? 'text-theme-success' : 'text-theme-error'}`}>
                    {contentionLevel}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
