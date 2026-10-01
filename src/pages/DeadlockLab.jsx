import { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, StepForward, AlertCircle, Info } from 'lucide-react';
import DiningTable from '../components/DiningTable';

const CONDITIONS = [
  { id: 'mutual_exclusion', name: 'Mutual Exclusion', desc: 'Forks cannot be shared; each fork can be held by only one philosopher at a time.' },
  { id: 'hold_and_wait', name: 'Hold & Wait', desc: 'Philosophers hold one fork while waiting for their second required fork.' },
  { id: 'no_preemption', name: 'No Preemption', desc: 'Forks cannot be forcibly taken away from a philosopher holding them.' },
  { id: 'circular_wait', name: 'Circular Wait', desc: 'Each philosopher waits for a resource held by another philosopher, creating a closed dependency cycle.' },
];

export default function DeadlockLab() {
  const [selectedCondition, setSelectedCondition] = useState('circular_wait');
  const [simulationState, setSimulationState] = useState('idle'); // idle, running, paused, deadlock

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <AlertCircle className="text-red-400" />
          Deadlock Lab
        </h1>
        <p className="text-slate-400 mt-2">Explore the Coffman conditions that lead to system deadlocks.</p>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Conditions */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="card-gradient p-5 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Coffman Conditions</h2>
            <div className="space-y-3">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 border ${
                    selectedCondition === cond.id 
                      ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <h3 className={`font-medium mb-1 ${selectedCondition === cond.id ? 'text-blue-300' : 'text-slate-200'}`}>
                    {cond.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{cond.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Simulation */}
        <div className="lg:col-span-6 flex flex-col gap-6 min-h-0">
          <div className="card-gradient flex-grow rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center relative overflow-hidden table-glow">
            {/* Condition Badge */}
            <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur border border-blue-500/30 px-4 py-2 rounded-full text-sm font-medium text-blue-300 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Selected: {CONDITIONS.find(c => c.id === selectedCondition)?.name}
            </div>

            {/* The Simulation Component */}
            <div className="w-full flex-grow flex items-center justify-center min-h-[400px]">
               <DiningTable 
                  condition={selectedCondition} 
                  simulationState={simulationState}
                  setSimulationState={setSimulationState}
               />
            </div>

          </div>

          {/* Controls */}
          <div className="card-gradient rounded-xl border border-slate-700 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSimulationState(simulationState === 'running' ? 'paused' : 'running')}
                className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
                  simulationState === 'running' 
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {simulationState === 'running' ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                onClick={() => setSimulationState('idle')}
                className="p-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              <button className="p-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                <StepForward size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              {['0.5x', '1x', '1.5x', '2x'].map(speed => (
                <button 
                  key={speed}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    speed === '1x' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Explanation */}
        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="card-gradient p-5 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info size={18} className="text-blue-400" />
              What's happening?
            </h2>
            <div className="prose prose-invert prose-sm text-slate-300">
              <p>The simulation is currently {simulationState}.</p>
              {simulationState === 'deadlock' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4 text-red-200">
                  <strong className="text-red-400 block mb-1">Deadlock Detected!</strong>
                  P1 is holding F1 and waiting for F2.<br/>
                  F2 is currently held by P2.<br/>
                  This creates a circular dependency where no progress can be made.
                </div>
              )}
            </div>
          </div>

          <div className="card-gradient p-5 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Dependency Chain</h2>
            <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">P1</span> waits for <span className="text-orange-400">F2</span> → held by <span className="text-blue-400">P2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">P2</span> waits for <span className="text-orange-400">F3</span> → held by <span className="text-blue-400">P3</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">P3</span> waits for <span className="text-orange-400">F4</span> → held by <span className="text-blue-400">P4</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">P4</span> waits for <span className="text-orange-400">F5</span> → held by <span className="text-blue-400">P5</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">P5</span> waits for <span className="text-orange-400">F1</span> → held by <span className="text-blue-400">P1</span>
              </div>
            </div>
          </div>
          
          <button className="mt-auto w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg transition-all hover:-translate-y-0.5">
            Explore Solutions →
          </button>
        </div>

      </div>
    </div>
  );
}
