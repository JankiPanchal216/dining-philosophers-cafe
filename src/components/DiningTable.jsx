import { useEffect } from 'react';

export default function DiningTable({ condition, simulationState, setSimulationState }) {
  // Simple mock simulation
  
  useEffect(() => {
    let timeout;
    if (simulationState === 'running' && condition === 'circular_wait') {
      timeout = setTimeout(() => {
        setSimulationState('deadlock');
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [simulationState, condition, setSimulationState]);

  // Table coordinates and positions
  const tableRadius = 100;
  const philosopherRadius = 140;
  const forkRadius = 80;

  const positions = [0, 1, 2, 3, 4].map(i => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    return {
      p: { x: Math.cos(angle) * philosopherRadius, y: Math.sin(angle) * philosopherRadius },
      f: { x: Math.cos(angle + Math.PI/5) * forkRadius, y: Math.sin(angle + Math.PI/5) * forkRadius }
    };
  });

  const pStates = [
    simulationState === 'deadlock' ? 'DEADLOCK' : 'WAITING',
    simulationState === 'deadlock' ? 'DEADLOCK' : 'WAITING',
    simulationState === 'deadlock' ? 'DEADLOCK' : 'WAITING',
    simulationState === 'deadlock' ? 'DEADLOCK' : 'WAITING',
    simulationState === 'deadlock' ? 'DEADLOCK' : 'WAITING',
  ];

  const getPColor = (state) => {
    switch (state) {
      case 'THINKING': return 'border-blue-500 bg-blue-500/20 text-blue-300';
      case 'WAITING': return 'border-orange-500 bg-orange-500/20 text-orange-300';
      case 'DEADLOCK': return 'border-red-500 bg-red-500/20 text-red-300';
      default: return 'border-slate-500 bg-slate-500/20';
    }
  };

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      
      {/* The Table */}
      <div className="absolute w-40 h-40 rounded-full border-4 border-slate-700 bg-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <span className="text-slate-500 font-bold tracking-widest opacity-50">TABLE</span>
      </div>

      {/* Dependency Arrows Overlay (Circular Wait) */}
      {simulationState === 'deadlock' && condition === 'circular_wait' && (
        <svg className="absolute w-full h-full inset-0 pointer-events-none z-10" viewBox="-160 -160 320 320">
          <circle cx="0" cy="0" r="140" fill="none" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="4" strokeDasharray="10, 10" className="animate-spin-slow" />
        </svg>
      )}

      {/* Philosophers */}
      {positions.map((pos, i) => (
        <div 
          key={`p-${i}`}
          className={`absolute w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold shadow-lg transition-colors ${getPColor(pStates[i])}`}
          style={{ transform: `translate(${pos.p.x}px, ${pos.p.y}px)` }}
        >
          P{i+1}
          
          {/* Status bubble */}
          <div className="absolute -top-6 whitespace-nowrap text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded-md opacity-80">
            {pStates[i]}
          </div>
        </div>
      ))}

      {/* Forks */}
      {positions.map((pos, i) => (
        <div 
          key={`f-${i}`}
          className={`absolute w-8 h-8 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center text-xs font-mono shadow-inner ${
            simulationState === 'deadlock' ? 'text-red-400 border-red-500/50' : 'text-slate-400'
          }`}
          style={{ transform: `translate(${pos.f.x}px, ${pos.f.y}px)` }}
        >
          F{i+1}
        </div>
      ))}
      
    </div>
  );
}
