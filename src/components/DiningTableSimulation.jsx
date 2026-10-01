import { Play, RotateCcw, Pause, SkipForward } from 'lucide-react';

export default function DiningTableSimulation({ strategy, philosophers, forks, onPlay, onReset, simulationState }) {
  
  const getPhilosopherColor = (state) => {
    switch(state) {
      case 'THINKING': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'EATING': return 'bg-green-100 border-green-500 text-green-800';
      case 'WAITING': return 'bg-orange-100 border-orange-400 text-orange-800';
      case 'BLOCKED': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getForkColor = (owner) => {
    return owner !== null ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-100 border-gray-400 text-gray-500';
  };

  return (
    <div className="card-surface p-6 flex flex-col h-full">
      <div className="flex-grow relative min-h-[400px] flex items-center justify-center">
        
        {/* Table Center */}
        <div className="absolute w-48 h-48 rounded-full bg-theme-bg border border-theme-border flex flex-col items-center justify-center shadow-inner z-0">
          <div className="font-mono text-sm font-bold text-theme-textMuted text-center">
            HAVENDER KERNEL<br/>
            CYCLE 18<br/>
            {simulationState === 'deadlock' 
              ? <span className="text-theme-error">🔴 CYCLE DETECTED</span>
              : <span className="text-theme-success">🛡 NO CYCLE</span>
            }
          </div>
        </div>

        {/* Circular Dependency Arrows (Show on Deadlock) */}
        {simulationState === 'deadlock' && (
          <svg className="absolute w-full h-full inset-0 pointer-events-none z-10" viewBox="-160 -160 320 320">
            <circle cx="0" cy="0" r="110" fill="none" stroke="rgba(186, 26, 26, 0.4)" strokeWidth="4" strokeDasharray="10, 10" className="animate-spin-slow" />
          </svg>
        )}

        {/* Philosophers & Forks layout */}
        <div className="relative w-80 h-80 z-20">
          {[0, 1, 2, 3, 4].map((i) => {
            const p = philosophers[i];
            const f = forks[i];
            
            // Angles for 5 items
            const pAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const fAngle = pAngle + Math.PI / 5;
            
            const pRadius = 140;
            const fRadius = 80;

            const px = Math.cos(pAngle) * pRadius;
            const py = Math.sin(pAngle) * pRadius;

            const fx = Math.cos(fAngle) * fRadius;
            const fy = Math.sin(fAngle) * fRadius;

            return (
              <div key={i}>
                {/* Philosopher Node */}
                <div 
                  className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-2 flex flex-col items-center justify-center shadow-sm font-bold text-xs transition-colors duration-500 ${getPhilosopherColor(p.state)}`}
                  style={{ left: `calc(50% + ${px}px)`, top: `calc(50% + ${py}px)` }}
                >
                  <span className="text-sm">P{p.id}</span>
                </div>
                {/* State Tag */}
                <div 
                  className="absolute text-[10px] font-mono whitespace-nowrap bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-center transform -translate-x-1/2 mt-9"
                  style={{ left: `calc(50% + ${px}px)`, top: `calc(50% + ${py}px)` }}
                >
                  <div className="font-bold">{p.state}</div>
                  <div className="text-theme-textMuted text-[8px]">
                    {p.state === 'EATING' ? `F${p.forks.join(' + F')}` : 
                     p.waitsFor ? `Waits F${p.waitsFor}` : 'Idle'}
                  </div>
                </div>

                {/* Fork Node */}
                <div 
                  className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold shadow-sm transition-colors duration-500 ${getForkColor(f.owner)}`}
                  style={{ left: `calc(50% + ${fx}px)`, top: `calc(50% + ${fy}px)` }}
                >
                  F{f.id}
                  <div className="absolute -bottom-4 text-[9px] whitespace-nowrap">
                    {f.owner ? `(P${f.owner})` : '(FREE)'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-theme-border pt-4 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="font-mono text-sm text-theme-textMuted">
            Step Control | Clock: 00:04:12.84
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onReset}
              className="px-4 py-2 bg-theme-bg border border-theme-border rounded-lg text-theme-text font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors text-sm"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button 
              onClick={onPlay}
              className="px-4 py-2 bg-theme-primary text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-theme-primaryContainer transition-colors text-sm shadow-sm"
            >
              <Play size={16} /> Apply Solution / Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
