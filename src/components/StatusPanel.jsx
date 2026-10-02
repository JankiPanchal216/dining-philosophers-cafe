import { useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlertCircle, CheckCircle2, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function StatusPanel() {
  const { 
    forks, 
    philosophers, 
    status, 
    deadlockDetected, 
    cyclePath, 
    events, 
    activeScenario,
    step,
    isRunning 
  } = useSimulation();

  const logContainerRef = useRef(null);

  // Auto-scroll event log to bottom when new events arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  // Derived status header badge
  const renderStatusBadge = () => {
    switch (status) {
      case 'READY':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            READY
          </div>
        );
      case 'RUNNING':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            LIVE
          </div>
        );
      case 'WAITING':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
            WAITING
          </div>
        );
      case 'DEADLOCK_DETECTED':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-100 text-red-900 border border-red-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            DEADLOCK DETECTED
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            COMPLETED
          </div>
        );
      default:
        return null;
    }
  };

  // Helper to get formatted status for each fork
  const getForkDisplay = (fork) => {
    // If held
    if (fork.heldBy) {
      const isWaiting = fork.waitingPhils && fork.waitingPhils.length > 0;
      if (isWaiting) {
        const waitNames = fork.waitingPhils.map(id => `P${id}`).join(', ');
        return (
          <span className="text-amber-800 font-mono text-xs font-semibold">
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
              HELD [P{fork.heldBy}]
            </span>{' '}
            <span className="text-[11px] text-amber-700">({waitNames} waits)</span>
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          HELD [P{fork.heldBy}]
        </span>
      );
    }

    // Available
    return (
      <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        AVAILABLE
      </span>
    );
  };

  return (
    <div className="card-surface p-5 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-border/60">
          <div>
            <h3 className="font-bold text-xs tracking-widest text-theme-textMuted uppercase font-mono">
              Mutex Table Dispatcher
            </h3>
            <p className="text-[11px] text-theme-textMuted">
              {activeScenario === 'circular_wait' ? 'Naive Greedy Strategy' : 'Havender Hierarchy'}
            </p>
          </div>
          {renderStatusBadge()}
        </div>

        {/* 5 Forks Mutex Table (Natural height, no huge gaps) */}
        <div className="space-y-2 mb-4 font-mono text-xs">
          {forks.map((fork) => (
            <div 
              key={fork.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80 border border-theme-border/50 hover:bg-gray-100/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-primary/60"></span>
                <span className="font-bold text-theme-text">{fork.name}</span>
                <span className="text-theme-textMuted text-[10px]">({fork.mutexName})</span>
              </div>
              <div>
                {getForkDisplay(fork)}
              </div>
            </div>
          ))}
        </div>

        {/* Wait-For Cycle Status Card */}
        <div className="mb-4">
          {deadlockDetected && cyclePath ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-900 font-mono text-xs">
              <div className="flex items-center gap-1.5 font-bold text-red-700 mb-1">
                <ShieldAlert size={14} className="text-red-600" />
                <span>CIRCULAR WAIT DETECTED (Coffman #4)</span>
              </div>
              <div className="text-[11px] leading-relaxed break-all bg-white/80 p-1.5 rounded border border-red-200 text-red-800 font-semibold">
                Cycle: {cyclePath}
              </div>
            </div>
          ) : status === 'WAITING' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <Clock size={14} className="text-amber-600 animate-spin" />
                <span>Philosophers waiting for held forks...</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold">NO DEADLOCK YET</span>
            </div>
          ) : status === 'COMPLETED' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-900 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Safe State: 0 deadlocks verified</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">NO CYCLE</span>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-600 font-mono text-xs flex items-center justify-between">
              <span className="text-[11px]">Cycle Detector:</span>
              <span className="text-[11px] font-bold text-gray-500">No circular wait detected.</span>
            </div>
          )}
        </div>
      </div>

      {/* Readable Terminal Event Log (High contrast, JetBrains Mono, crisp, natural height) */}
      <div className="bg-[#1e1c1b] border border-gray-700/80 rounded-lg p-3 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-700/60 text-[10px] uppercase font-bold text-gray-400">
          <span>EVENT LOG</span>
          <span className="text-gray-500">{events.length} events</span>
        </div>

        <div 
          ref={logContainerRef}
          className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed custom-scrollbar pr-1"
        >
          {events.length === 0 ? (
            <div className="text-gray-400 italic">No events recorded.</div>
          ) : (
            events.map((ev, idx) => (
              <div 
                key={ev.id || idx} 
                className={`flex items-start gap-1.5 ${
                  ev.type === 'error' 
                    ? 'text-red-400 font-semibold bg-red-950/40 px-1 py-0.5 rounded' 
                    : ev.type === 'success' 
                    ? 'text-emerald-400 font-semibold' 
                    : 'text-gray-200'
                }`}
              >
                <span className="text-gray-400 select-none shrink-0 font-medium">
                  {ev.time}
                </span>
                <span className="break-words">
                  {ev.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
