import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

export default function DiningTableSimulation({ 
  mode = 'with-fix',
  onModeChange,
  step = 0,
  maxStep = 6,
  isRunning = false,
  isFinished = false,
  philosophers = [], 
  forks = [], 
  onPrimaryAction,
  onStepForward,
  onReset, 
  simulationState = 'safe',
}) {
  
  const getPhilosopherColor = (state) => {
    switch(state) {
      case 'THINKING': return 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200';
      case 'HUNGRY': return 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300';
      case 'EATING': return 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-300 dark:ring-emerald-700';
      case 'WAITING': return 'bg-sky-100 dark:bg-sky-950/70 border-sky-400 dark:border-sky-600 text-sky-800 dark:text-sky-300';
      case 'DEADLOCKED': 
      case 'BLOCKED': return 'bg-red-100 dark:bg-red-950/70 border-red-500 dark:border-red-600 text-red-800 dark:text-red-300 ring-2 ring-red-300 dark:ring-red-700';
      default: return 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300';
    }
  };

  const getForkColor = (owner) => {
    return owner !== null 
      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-500 text-amber-800 dark:text-amber-300 font-bold' 
      : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300';
  };

  // Primary action button state (Play | Pause | Resume | Replay)
  const getPrimaryButtonContent = () => {
    if (isFinished) {
      return (
        <>
          <RotateCcw size={18} />
          <span>Replay</span>
        </>
      );
    }
    if (isRunning) {
      return (
        <>
          <Pause size={18} fill="currentColor" />
          <span>Pause</span>
        </>
      );
    }
    if (step > 0) {
      return (
        <>
          <Play size={18} fill="currentColor" />
          <span>Resume</span>
        </>
      );
    }
    return (
      <>
        <Play size={18} fill="currentColor" />
        <span>Play</span>
      </>
    );
  };

  return (
    <div className="card-surface p-6 flex flex-col h-full justify-between">
      
      {/* Top Header: Scenario Segmented Control & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => onModeChange('without-fix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'without-fix'
                ? 'shadow-xs font-bold'
                : 'hover:opacity-80'
            }`}
            style={{
              background: mode === 'without-fix' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'without-fix' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: mode === 'without-fix' ? '1px solid var(--border-subtle)' : '1px solid transparent',
            }}
          >
            Without Fix
          </button>
          <button
            onClick={() => onModeChange('with-fix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'with-fix'
                ? 'shadow-xs font-bold'
                : 'hover:opacity-80'
            }`}
            style={{
              background: mode === 'with-fix' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'with-fix' ? 'var(--accent)' : 'var(--text-secondary)',
              border: mode === 'with-fix' ? '1px solid var(--border-subtle)' : '1px solid transparent',
            }}
          >
            With Havender Ordering
          </button>
        </div>

        <div className="font-mono text-xs font-bold px-2.5 py-1 rounded border self-start sm:self-auto" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
          Step {step} / {maxStep}
        </div>
      </div>

      {/* Main Table Visualization Canvas */}
      <div className="flex-grow relative min-h-[420px] flex items-center justify-center select-none py-4">
        
        {/* Table Ring (420px diameter with responsive scaling) */}
        <div className="table-ring relative flex items-center justify-center select-none">
          
          {/* Decorative Outer Boundary */}
          <div 
            className="absolute w-[360px] h-[360px] rounded-full border border-dashed pointer-events-none opacity-40 z-0"
            style={{ borderColor: 'var(--border-subtle)' }}
          ></div>

          {/* Table Center (Havender Engine Label) - Sized so it never overlaps forks */}
          <div 
            className="absolute w-36 h-36 rounded-full border-2 flex items-center justify-center z-0 shadow-inner overflow-hidden"
            style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="engine-label font-mono text-xs font-bold leading-tight select-none">
              <span className="tracking-wider text-[11px]" style={{ color: 'var(--text-primary)' }}>HAVENDER ENGINE</span>
              <span className="text-[9.5px] opacity-75 mt-0.5" style={{ color: 'var(--text-secondary)' }}>TOTAL ORDER</span>
              {simulationState === 'deadlock' ? (
                <span className="text-red-500 font-bold mt-1 text-[10.5px] block">🔴 CYCLE DETECTED</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-[10.5px] block">🛡 NO CIRCULAR WAIT</span>
              )}
            </div>
          </div>

          {/* Circular Dependency Ring (Show when Cycle Detected in Deadlock) */}
          {simulationState === 'deadlock' && (
            <svg className="absolute w-full h-full inset-0 pointer-events-none z-10" viewBox="-210 -210 420 420">
              <circle cx="0" cy="0" r="126" fill="none" stroke="rgba(186, 26, 26, 0.45)" strokeWidth="3" strokeDasharray="8, 6" className="animate-spin-slow" />
            </svg>
          )}

          {/* Philosophers & Forks Layout */}
          <div className="absolute inset-0 z-20">
            {[0, 1, 2, 3, 4].map((i) => {
              const p = philosophers[i] || { id: i + 1, state: 'THINKING', forks: [] };
              const f = forks[i] || { id: i + 1, owner: null };
              
              // 5 items symmetrically placed
              const pAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const fAngle = pAngle + Math.PI / 5;
              
              // Outer rim radius for philosophers & forks
              const pRadius = 152;
              const fRadius = 98;

              const px = Math.cos(pAngle) * pRadius;
              const py = Math.sin(pAngle) * pRadius;

              const fx = Math.cos(fAngle) * fRadius;
              const fy = Math.sin(fAngle) * fRadius;

              return (
                <div key={i}>
                  {/* Philosopher Node */}
                  <div 
                    className={`absolute w-13 h-13 -ml-6.5 -mt-6.5 rounded-full border-2 flex flex-col items-center justify-center shadow-sm font-bold text-xs transition-colors duration-300 z-30 ${getPhilosopherColor(p.state)}`}
                    style={{ left: `calc(50% + ${px}px)`, top: `calc(50% + ${py}px)` }}
                    title={`Philosopher P${p.id} • Status: ${p.state}`}
                  >
                    <span className="text-sm font-mono leading-none">P{p.id}</span>
                  </div>

                  {/* State Tag directly attached to philosopher */}
                  <div 
                    className="absolute text-[8.5px] font-mono whitespace-nowrap border px-1.5 py-0.5 rounded shadow-xs text-center transform -translate-x-1/2 mt-7.5 z-40"
                    style={{ 
                      left: `calc(50% + ${px}px)`, 
                      top: `calc(50% + ${py}px)`,
                      background: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div className="font-bold">{p.state}</div>
                    <div className="text-[7.5px]" style={{ color: 'var(--text-secondary)' }}>
                      {p.state === 'EATING' ? `F${p.forks.join(' + F')}` : 
                       p.waitsFor ? `Waits F${p.waitsFor}` : 'Idle'}
                    </div>
                  </div>

                  {/* Fork Node with .fork and .fork-holder (non-overlapping) */}
                  <div 
                    className={`fork absolute w-9 h-9 -ml-4.5 -mt-4.5 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold shadow-xs transition-colors duration-300 ${getForkColor(f.owner)}`}
                    style={{ left: `calc(50% + ${fx}px)`, top: `calc(50% + ${fy}px)` }}
                    title={`Fork #${f.id}${f.owner ? ` (Held by P${f.owner})` : ' (Available)'}`}
                  >
                    <span>F{f.id}</span>
                    <div className="fork-holder font-sans font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {f.owner ? `(P${f.owner})` : '(FREE)'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Bottom Transport Bar & Resolution Text */}
      <div className="border-t pt-4 mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="resolution-text font-mono text-xs px-2.5 py-1 rounded-md border" style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}>
            Resolution: Resource Hierarchy Invalidation
          </div>
          
          {/* Transport Bar Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onPrimaryAction}
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs transition-all shadow-xs cursor-pointer hover:opacity-90"
              style={{
                background: 'var(--accent)',
                color: 'var(--on-accent)',
              }}
              aria-label="Transport Playback Action"
            >
              {getPrimaryButtonContent()}
            </button>

            <button 
              onClick={onStepForward}
              disabled={isFinished}
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
              onClick={onReset}
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
        </div>
      </div>

    </div>
  );
}
