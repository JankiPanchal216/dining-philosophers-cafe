import { ArrowRight, Play, RotateCcw, Pause, StepForward } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import PhilosopherStatus from './PhilosopherStatus';

export default function Hero() {
  const { 
    philosophers, 
    status, 
    runScenario, 
    pauseSimulation, 
    resetSimulation, 
    stepScenario,
    isRunning,
    step,
    totalSteps,
    activeScenario,
    switchScenario
  } = useSimulation();

  const getStatusBadge = () => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Simulation Status: READY
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            RUNNING (Step {step}/{totalSteps})
          </span>
        );
      case 'WAITING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            WAITING (Resource Contention)
          </span>
        );
      case 'DEADLOCK_DETECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            DEADLOCK DETECTED (Cycle)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            COMPLETED (Safe Execution)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card-surface p-6 sm:p-8 md:p-10 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-bg border border-theme-border rounded-full text-xs font-semibold text-theme-textMuted">
            <span>🎓</span>
            <span>University CS 301 · Systems & Concurrency Workbench</span>
          </div>
          {getStatusBadge()}
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-theme-text">
          <span className="mr-3">🍽️</span> 
          Dining Philosophers Café
        </h2>
        
        <p className="text-lg sm:text-xl md:text-2xl text-theme-primary font-medium mb-4">
          Interactive Operating Systems Lab
        </p>
        
        <p className="text-theme-textMuted max-w-2xl leading-relaxed mb-6 text-sm sm:text-base">
          Explore synchronization problems through mathematically modeled simulations. Observe thread scheduling anomalies, mutex contention, race windows, and algorithmic deadlock resolutions in real time.
        </p>

        {/* Scenario selector */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold font-mono text-theme-textMuted uppercase tracking-wider">
            Active Scenario:
          </span>
          <div className="inline-flex p-1 bg-gray-100/90 rounded-lg border border-theme-border/60 text-xs font-semibold">
            <button
              onClick={() => switchScenario('circular_wait')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeScenario === 'circular_wait'
                  ? 'bg-white text-theme-primary shadow-xs font-bold'
                  : 'text-theme-textMuted hover:text-theme-text'
              }`}
            >
              💀 Circular Wait (Deadlock)
            </button>
            <button
              onClick={() => switchScenario('havender_safe')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeScenario === 'havender_safe'
                  ? 'bg-white text-theme-success shadow-xs font-bold'
                  : 'text-theme-textMuted hover:text-theme-text'
              }`}
            >
              🛡️ Havender Ordering (Safe)
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => isRunning ? pauseSimulation() : runScenario()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white transition-all shadow-sm ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-theme-primary hover:bg-theme-primaryContainer'
            }`}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            {isRunning ? 'Pause Scenario' : 'Run Scenario'}
          </button>

          <button
            onClick={stepScenario}
            disabled={isRunning || step >= totalSteps}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-theme-text hover:bg-theme-bg border border-theme-border transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            title="Advance one simulation step"
          >
            <StepForward size={16} />
            Step
          </button>

          <button 
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-theme-text hover:bg-theme-bg border border-theme-border transition-colors text-sm shadow-2xs"
            title="Reset system to clean initial state"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <Link 
            to="/deadlock" 
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-theme-primary hover:bg-theme-bg border border-transparent hover:border-theme-border transition-colors text-sm ml-auto"
          >
            Explore Labs <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Derived Active Threads & 5 Philosophers Status Chips */}
      <div className="mt-8 pt-6 border-t border-theme-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {philosophers.map((p) => (
            <PhilosopherStatus 
              key={p.id}
              id={p.id}
              name={p.name}
              state={p.state}
              size="sm"
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-theme-textMuted bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{philosophers.length} Active Threads</span>
        </div>
      </div>
    </div>
  );
}
