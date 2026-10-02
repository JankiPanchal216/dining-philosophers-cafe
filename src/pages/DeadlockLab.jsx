import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  AlertCircle, 
  Info, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DiningTable from '../components/DiningTable';
import { useSimulation } from '../context/SimulationContext';

const CONDITIONS = [
  { 
    id: 'mutual_exclusion', 
    name: 'Mutual Exclusion (Coffman #1)', 
    desc: 'Forks cannot be shared; each fork can be held by only one philosopher at a time.',
    activeAtStep: 2,
  },
  { 
    id: 'hold_and_wait', 
    name: 'Hold & Wait (Coffman #2)', 
    desc: 'Philosophers hold one fork while waiting for their second required fork.',
    activeAtStep: 7,
  },
  { 
    id: 'no_preemption', 
    name: 'No Preemption (Coffman #3)', 
    desc: 'Forks cannot be forcibly taken away from a philosopher holding them.',
    activeAtStep: 7,
  },
  { 
    id: 'circular_wait', 
    name: 'Circular Wait (Coffman #4)', 
    desc: 'Each philosopher waits for a resource held by another philosopher, creating a closed dependency cycle.',
    activeAtStep: 9,
  },
];

// Canonical simulation events for the interactive timeline
const SIMULATION_EVENTS = [
  { step: 1, title: 'All philosophers became HUNGRY', desc: 'Threads request mutual exclusion locks.', icon: '🍽️' },
  { step: 2, title: 'P1 acquired Fork #1', desc: 'P1 enters HOLDING state; F1 locked.', icon: '🔒' },
  { step: 3, title: 'P2 acquired Fork #2', desc: 'P2 enters HOLDING state; F2 locked.', icon: '🔒' },
  { step: 4, title: 'P3 acquired Fork #3', desc: 'P3 enters HOLDING state; F3 locked.', icon: '🔒' },
  { step: 5, title: 'P4 acquired Fork #4', desc: 'P4 enters HOLDING state; F4 locked.', icon: '🔒' },
  { step: 6, title: 'P5 acquired Fork #5', desc: 'All 5 philosophers now hold exactly one fork.', icon: '🔒' },
  { step: 7, title: 'All philosophers WAITING for second fork', desc: 'Hold & Wait satisfied; contention causes deadlock trap.', icon: '⏳' },
  { step: 8, title: 'Wait-For Graph (WFG) constructed', desc: 'Dependency graph: P1→P5, P2→P1, P3→P2, P4→P3, P5→P4.', icon: '📊' },
  { step: 9, title: 'Circular dependency cycle detected', desc: 'Cycle identified: P1→P5→P4→P3→P2→P1.', icon: '🔄' },
  { step: 10, title: 'DEADLOCK confirmed — system halted', desc: 'All 4 Coffman conditions active. No thread can proceed.', icon: '⚠️' },
];

// Visual cycle ring node coordinates for SVG diagram
const CYCLE_NODES = [
  { id: 1, label: 'P1', x: 100, y: 26 },
  { id: 5, label: 'P5', x: 38, y: 68 },
  { id: 4, label: 'P4', x: 62, y: 138 },
  { id: 3, label: 'P3', x: 138, y: 138 },
  { id: 2, label: 'P2', x: 162, y: 68 },
];

// Directed cycle arcs (P1 -> P5 -> P4 -> P3 -> P2 -> P1)
const CYCLE_EDGES = [
  { from: 1, to: 5, d: 'M 88 28 Q 58 40 46 60', fork: 5 },
  { from: 5, to: 4, d: 'M 40 78 Q 44 110 56 128', fork: 4 },
  { from: 4, to: 3, d: 'M 74 138 Q 100 148 126 138', fork: 3 },
  { from: 3, to: 2, d: 'M 144 128 Q 156 110 160 78', fork: 2 },
  { from: 2, to: 1, d: 'M 154 60 Q 142 40 112 28', fork: 1 },
];

export default function DeadlockLab() {
  const navigate = useNavigate();
  const { deadlockSim } = useSimulation();
  const [hoveredDep, setHoveredDep] = useState(null);
  const currentTimelineRef = useRef(null);

  const {
    step,
    phase,
    speed,
    philosophers,
    forks,
    cycle,
    toggleRun,
    stepForward,
    jumpToStep,
    reset,
    setSpeed,
  } = deadlockSim;

  // Auto-scroll timeline to active step (Phase 6)
  useEffect(() => {
    if (currentTimelineRef.current) {
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      currentTimelineRef.current.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
  }, [step]);

  // Active condition label derived from current step
  const getActiveConditionPill = () => {
    if (step >= 9) return 'Condition: Circular Wait (Coffman #4)';
    if (step >= 7) return 'Condition: Hold & Wait / No Preemption';
    if (step >= 2) return 'Condition: Mutual Exclusion (Coffman #1)';
    if (step === 1) return 'Condition: Contention Starting';
    return 'Condition: None';
  };

  // State-derived "What's happening?" explanation
  const getWhatsHappeningText = () => {
    let base = '';
    switch (step) {
      case 0:
        base = 'The system is currently READY. All 5 philosophers are thinking quietly, and all 5 forks are free on the table. Click Run Scenario or Step to initiate resource acquisition.';
        break;
      case 1:
        base = 'All 5 philosophers are hungry and attempting to acquire their required forks.';
        break;
      case 2:
        base = 'P1 acquired Fork #1 and is now holding one resource.';
        break;
      case 3:
        base = 'P2 acquired Fork #2. Multiple philosophers now hold one fork.';
        break;
      case 4:
        base = 'P3 acquired Fork #3. Three philosophers now hold their first fork.';
        break;
      case 5:
        base = 'P4 acquired Fork #4. Four philosophers now hold their first fork.';
        break;
      case 6:
        base = 'P5 acquired Fork #5. Every philosopher now holds exactly one fork.';
        break;
      case 7:
        base = 'All philosophers requested their second fork. Since each second fork is held by a neighbor, all philosophers enter the WAITING state.';
        break;
      case 8:
        base = 'The Wait-For Graph (WFG) is constructed from active resource requests: P1→P5, P2→P1, P3→P2, P4→P3, P5→P4.';
        break;
      case 9:
        base = 'Cycle-detection algorithm detected a closed circular wait chain in the graph: P1→P5→P4→P3→P2→P1.';
        break;
      case 10:
        base = 'DEADLOCK DETECTED! All Coffman conditions are satisfied simultaneously. No thread can proceed; simulation stopped.';
        break;
      default:
        base = '';
    }

    if (phase === 'PAUSED' && step > 0 && step < 10) {
      return `${base} (Simulation is currently PAUSED. Click Resume or Step to proceed.)`;
    }
    return base;
  };

  const neededForkMap = { 1: 5, 2: 1, 3: 2, 4: 3, 5: 4 };

  // Run/Pause/Resume/Replay button content
  const renderRunButton = () => {
    if (phase === 'DEADLOCK' || step === 10) {
      return (
        <>
          <RotateCcw size={15} />
          <span>↻ Replay</span>
        </>
      );
    }
    if (phase === 'RUNNING') {
      return (
        <>
          <Pause size={15} />
          <span>Pause</span>
        </>
      );
    }
    if (phase === 'PAUSED') {
      return (
        <>
          <Play size={15} fill="currentColor" />
          <span>Resume</span>
        </>
      );
    }
    return (
      <>
        <Play size={15} fill="currentColor" />
        <span>Run Scenario</span>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-grow w-full space-y-6">
        
        {/* Lab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <AlertCircle style={{ color: 'var(--accent)' }} />
              Deadlock Lab
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              Explore the Coffman conditions that lead to system deadlocks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className={`font-mono text-xs font-bold px-3 py-1 rounded-full border ${
                phase === 'DEADLOCK'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse'
                  : phase === 'RUNNING'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  : phase === 'PAUSED'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'border'
              }`}
              style={{
                background: phase === 'READY' ? 'var(--bg-muted)' : undefined,
                color: phase === 'READY' ? 'var(--text-primary)' : undefined,
                borderColor: phase === 'READY' ? 'var(--border-subtle)' : undefined,
              }}
            >
              STATUS: {phase}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Coffman Conditions Cards */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="card-surface p-5 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Coffman Conditions
                </h2>
                <p className="text-[11px] mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  All four conditions must hold simultaneously for a deadlock to occur:
                </p>
                <div className="space-y-2.5">
                  {CONDITIONS.map((cond) => {
                    const isActive = step >= cond.activeAtStep;
                    const isCircularWait = cond.id === 'circular_wait';

                    let stateClass = '';
                    let badgeClasses = '';

                    if (isActive) {
                      if (isCircularWait) {
                        stateClass = 'active-circular';
                        badgeClasses = 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200 border-red-200 dark:border-red-800';
                      } else {
                        stateClass = 'active-subtle';
                        badgeClasses = 'border';
                      }
                    }

                    return (
                      <div
                        key={cond.id}
                        className={`coffman-card w-full text-left p-3 rounded-lg text-xs transition-all ${stateClass} ${!isActive ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-xs font-bold">
                            {cond.name}
                          </h3>
                          {isActive && (
                            <span 
                              className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold border flex items-center gap-1 ${badgeClasses}`}
                              style={{
                                background: !isCircularWait ? 'var(--bg-surface)' : undefined,
                                color: !isCircularWait ? 'var(--text-primary)' : undefined,
                                borderColor: !isCircularWait ? 'var(--border-subtle)' : undefined,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] leading-relaxed line-clamp-3">
                          {cond.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t text-[11px] leading-relaxed" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>OS Principle:</span> Eliminating any single Coffman condition prevents deadlocks from forming.
              </div>
            </div>
          </div>

          {/* Center Column: Simulation Canvas, Scrubber & Controls */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            
            {/* Simulation Canvas Card */}
            <div className="card-surface p-6 flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Dynamic Active Condition Pill & Step Counter */}
              <div className="w-full flex items-center justify-between mb-3">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border"
                  style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      step >= 9 ? 'bg-red-500 animate-ping' : step >= 2 ? 'bg-amber-500' : 'bg-gray-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      step >= 9 ? 'bg-red-600' : step >= 2 ? 'bg-amber-600' : 'bg-gray-500'
                    }`}></span>
                  </span>
                  {getActiveConditionPill()}
                </div>
                <div className="font-mono text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  Step {step} of 10
                </div>
              </div>

              {/* Interactive Step Scrubber / Progress Bar */}
              <div 
                className="w-full px-2 py-2 mb-3 rounded-xl border"
                style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-medium mb-1.5 px-1" style={{ color: 'var(--text-secondary)' }}>
                  <span>Interactive Step Scrubber</span>
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>
                    {step === 0 ? 'Step 0 (Ready)' : step === 10 ? 'Step 10 (Deadlock)' : `Step ${step}`}
                  </span>
                </div>
                <div className="relative flex items-center justify-between w-full h-7">
                  <div 
                    className="absolute left-2 right-2 h-1 rounded-full z-0 opacity-40"
                    style={{ background: 'var(--text-secondary)' }}
                  ></div>
                  <div 
                    className="absolute left-2 h-1 rounded-full z-0 transition-all duration-200"
                    style={{ width: `calc(${(step / 10) * 100}% - 8px)`, background: 'var(--accent)' }}
                  ></div>
                  
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => {
                    const isPassed = t <= step;
                    const isCurrent = t === step;
                    return (
                      <button
                        key={`tick-${t}`}
                        onClick={() => jumpToStep(t)}
                        title={`Jump to Step ${t}`}
                        aria-label={`Jump to Step ${t}`}
                        className={`relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-mono text-[9px] sm:text-[10px] transition-all transform cursor-pointer border ${
                          isCurrent
                            ? 'font-bold scale-110 shadow-sm ring-2'
                            : isPassed
                            ? 'hover:scale-105'
                            : 'hover:opacity-80'
                        }`}
                        style={{
                          background: isCurrent || isPassed ? 'var(--accent)' : 'var(--bg-surface)',
                          color: isCurrent || isPassed ? 'var(--on-accent)' : 'var(--text-secondary)',
                          borderColor: 'var(--border-subtle)',
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dining Table Simulation Component */}
              <div className="w-full flex items-center justify-center min-h-[380px]">
                <DiningTable 
                  philosophers={philosophers}
                  forks={forks}
                  step={step}
                  phase={phase}
                  cycle={cycle}
                  hoveredDep={hoveredDep}
                />
              </div>

              {/* Real Interactive Control Buttons */}
              <div className="w-full mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleRun}
                    className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-bold text-xs transition-colors cursor-pointer shadow-xs hover:opacity-90"
                    style={{
                      background: phase === 'RUNNING' ? '#d97706' : phase === 'PAUSED' ? '#059669' : 'var(--accent)',
                      color: 'var(--on-accent)',
                    }}
                    aria-label={
                      phase === 'DEADLOCK' || step === 10
                        ? 'Replay simulation from Step 0'
                        : phase === 'RUNNING'
                        ? 'Pause simulation'
                        : phase === 'PAUSED'
                        ? 'Resume simulation'
                        : 'Run scenario simulation'
                    }
                  >
                    {renderRunButton()}
                  </button>
                  
                  <button 
                    onClick={stepForward}
                    disabled={step >= 10}
                    className="p-2 border rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:opacity-80"
                    style={{
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-subtle)',
                    }}
                    title="Step forward (+1 step)"
                    aria-label="Step forward one step"
                  >
                    <StepForward size={16} />
                  </button>

                  <button 
                    onClick={reset}
                    className="p-2 border rounded-lg transition-colors cursor-pointer hover:opacity-80"
                    style={{
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-subtle)',
                    }}
                    title="Reset simulation to Step 0"
                    aria-label="Reset simulation"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                
                {/* Speed Controls: 0.5x, 1x, 1.5x, 2x */}
                <div className="speed-toggle flex items-center gap-1 rounded-lg p-1 text-xs">
                  {[0.5, 1, 1.5, 2].map((s) => (
                    <button 
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2.5 py-1 rounded-md font-mono font-medium transition-colors cursor-pointer ${
                        speed === s 
                          ? 'active shadow-xs font-bold' 
                          : 'hover:opacity-80'
                      }`}
                      aria-label={`Set speed to ${s}x`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Event Timeline (Step-by-step canonical log) */}
            <div className="card-surface p-5">
              <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Simulation Event Timeline
                  </h2>
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Click any event to scrub
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {SIMULATION_EVENTS.map((item) => {
                  const isCompleted = item.step < step;
                  const isCurrent = item.step === step;

                  return (
                    <div
                      key={`timeline-step-${item.step}`}
                      ref={isCurrent ? currentTimelineRef : null}
                      onClick={() => jumpToStep(item.step)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'font-medium shadow-xs scale-[1.01]'
                          : isCompleted
                          ? 'hover:opacity-80'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                      style={{
                        background: isCurrent || isCompleted ? 'var(--bg-muted)' : 'transparent',
                        borderColor: isCurrent ? 'var(--accent)' : isCompleted ? 'var(--border-subtle)' : 'transparent',
                        color: isCurrent || isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                      title={`Jump to Step ${item.step}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[11px] font-bold w-4 text-center">
                          {isCompleted ? (
                            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                          ) : isCurrent ? (
                            <span style={{ color: 'var(--accent)' }} className="font-bold">→</span>
                          ) : (
                            <span>○</span>
                          )}
                        </span>
                        <span className="text-sm">{item.icon}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">
                            Step {item.step}: {item.title}
                          </div>
                          <div className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <span 
                        className="text-[9.5px] font-mono px-2 py-0.5 rounded font-semibold shrink-0"
                        style={{
                          background: isCurrent ? 'var(--accent)' : isCompleted ? 'var(--bg-surface)' : 'transparent',
                          color: isCurrent ? 'var(--on-accent)' : isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                          border: isCompleted ? '1px solid var(--border-subtle)' : undefined,
                        }}
                      >
                        {isCurrent ? 'ACTIVE' : isCompleted ? 'DONE' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: "What's happening?" & Dependency Chain */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* "What's happening?" Panel with aria-live="polite" */}
            <div className="card-surface p-5">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Info size={16} style={{ color: 'var(--accent)' }} />
                What's happening?
              </h2>
              <div 
                aria-live="polite" 
                className="text-xs leading-relaxed space-y-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                <p>{getWhatsHappeningText()}</p>
                {step === 10 && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg p-3 text-red-900 dark:text-red-200 font-mono text-xs mt-2">
                    <strong className="text-red-700 dark:text-red-400 block mb-1">Deadlock Verified!</strong>
                    Circular wait detected: P1→P5→P4→P3→P2→P1.<br />
                    No process can make progress.
                  </div>
                )}
              </div>
            </div>

            {/* Dependency Chain Panel with Visual Cycle Ring Diagram */}
            <div className="card-surface p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Dependency Chain
                </h2>
                {step >= 9 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 font-bold border border-red-200 dark:border-red-800">
                    Cycle Detected
                  </span>
                ) : step >= 7 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-800">
                    WFG Active
                  </span>
                ) : null}
              </div>

              {/* Circular Cycle SVG Diagram (active at steps 7-10) */}
              {step >= 7 ? (
                <div 
                  className="mb-3 rounded-xl p-3 border flex flex-col items-center"
                  style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="text-[10px] font-mono font-bold tracking-tight mb-1 text-center" style={{ color: 'var(--text-secondary)' }}>
                    {step >= 9 ? '⚠️ CLOSED WAIT-FOR CYCLE' : 'WAIT-FOR GRAPH TOPOLOGY'}
                  </div>
                  <svg 
                    viewBox="0 0 200 166" 
                    className="w-44 h-36 select-none overflow-visible"
                  >
                    <defs>
                      <marker 
                        id="cycle-diag-arrow" 
                        markerWidth="6" 
                        markerHeight="6" 
                        refX="5" 
                        refY="3" 
                        orient="auto"
                      >
                        <path d="M 0 0 L 6 3 L 0 6 z" fill={step >= 9 ? '#ef4444' : '#f59e0b'} />
                      </marker>
                    </defs>

                    {/* Cycle Directed Edges */}
                    {CYCLE_EDGES.map((edge) => {
                      const isHovered = hoveredDep && hoveredDep.from === edge.from && hoveredDep.to === edge.to;
                      return (
                        <path 
                          key={`cycle-svg-${edge.from}-${edge.to}`}
                          d={edge.d}
                          fill="none"
                          stroke={
                            isHovered 
                              ? '#3b82f6' 
                              : step >= 9 
                              ? '#ef4444' 
                              : '#f59e0b'
                          }
                          strokeWidth={isHovered ? '2.5' : step >= 9 ? '2' : '1.5'}
                          strokeDasharray={step >= 9 ? '5 3' : 'none'}
                          className={step >= 9 ? 'animate-cycle-march' : ''}
                          markerEnd="url(#cycle-diag-arrow)"
                        />
                      );
                    })}

                    {/* Center Ring Cycle Badge */}
                    <circle cx="100" cy="88" r="22" style={{ fill: 'var(--bg-surface)' }} />
                    <text 
                      x="100" 
                      y="85" 
                      textAnchor="middle" 
                      fontSize="9" 
                      fontWeight="bold" 
                      fill={step >= 9 ? '#dc2626' : '#d97706'}
                      className="font-mono"
                    >
                      {step >= 9 ? 'CYCLE' : 'WFG'}
                    </text>
                    <text 
                      x="100" 
                      y="96" 
                      textAnchor="middle" 
                      fontSize="7.5" 
                      fill={step >= 9 ? '#ef4444' : '#64748b'}
                      className="font-mono"
                    >
                      {step >= 9 ? 'DETECTED' : '5 NODES'}
                    </text>

                    {/* 5 Philosopher Nodes on the Cycle Ring */}
                    {CYCLE_NODES.map((n) => {
                      const isHovered = hoveredDep && (hoveredDep.from === n.id || hoveredDep.to === n.id);
                      return (
                        <g key={`cycle-node-${n.id}`}>
                          <circle 
                            cx={n.x} 
                            cy={n.y} 
                            r="11" 
                            className={`transition-colors ${
                              isHovered 
                                ? 'fill-blue-100 stroke-blue-600' 
                                : step >= 9 
                                ? 'fill-red-50 dark:fill-stone-850 stroke-red-500' 
                                : 'stroke-stone-400 dark:stroke-stone-600'
                            }`}
                            style={{
                              fill: !isHovered && step < 9 ? 'var(--bg-surface)' : undefined,
                            }}
                            strokeWidth={isHovered ? '2' : '1.5'}
                          />
                          <text 
                            x={n.x} 
                            y={n.y + 3.5} 
                            textAnchor="middle" 
                            fontSize="8.5" 
                            fontWeight="bold" 
                            className="font-mono"
                            style={{ fill: 'var(--text-primary)' }}
                          >
                            {n.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : null}

              {/* Dependency Rows List */}
              <div 
                className="border rounded-lg p-2.5 font-mono text-xs"
                style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}
              >
                {step < 7 ? (
                  <div className="italic text-xs py-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                    No dependencies yet
                    <div className="text-[10px] mt-1 not-italic opacity-80">
                      Philosophers are thinking or acquiring initial forks without blocking.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {philosophers
                      .filter((p) => p.status === 'WAITING' || p.status === 'DEADLOCKED')
                      .map((p) => {
                        const neededFork = neededForkMap[p.id];
                        const targetFork = forks.find((f) => f.id === neededFork);
                        const holderId = targetFork?.holder;
                        const isHovered = hoveredDep && hoveredDep.from === p.id && hoveredDep.to === holderId;

                        return (
                          <div
                            key={`dep-${p.id}`}
                            onMouseEnter={() => setHoveredDep({ from: p.id, to: holderId, fork: neededFork })}
                            onMouseLeave={() => setHoveredDep(null)}
                            className={`flex items-center justify-between p-2 rounded-md transition-all cursor-pointer border ${
                              isHovered
                                ? 'bg-blue-100/90 dark:bg-blue-950/70 border-blue-400 text-blue-950 dark:text-blue-200 shadow-xs'
                                : step >= 9
                                ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200'
                                : ''
                            }`}
                            style={{
                              background: !isHovered && step < 9 ? 'var(--bg-surface)' : undefined,
                              borderColor: !isHovered && step < 9 ? 'var(--border-subtle)' : undefined,
                              color: !isHovered && step < 9 ? 'var(--text-primary)' : undefined,
                            }}
                          >
                            <span className="font-bold" style={{ color: 'var(--accent)' }}>
                              P{p.id}
                            </span>
                            <span className="text-[10.5px]" style={{ color: 'var(--text-secondary)' }}>
                              waits for F{neededFork} →
                            </span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {holderId ? `P${holderId}` : 'None'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="mt-3 text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Hover over a row to inspect the corresponding wait-for dependency on the dining table.
              </div>
            </div>
            
            {/* Explore Solutions Button (Disabled before step 10) */}
            <button
              onClick={() => navigate('/solution')}
              disabled={step < 10}
              className={`btn-explore w-full py-2.5 px-4 rounded-xl font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
                step >= 10
                  ? 'cursor-pointer hover:opacity-90'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              title={step >= 10 ? 'Navigate to Solution Lab' : 'Disabled until Deadlock is detected'}
            >
              <span>Explore Solutions</span>
              <ArrowRight size={14} />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
