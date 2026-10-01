import { CheckCircle2, Circle } from 'lucide-react';

export default function StrategySelector({ selectedStrategy, setSelectedStrategy }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Choose a Prevention Strategy</h2>
          <p className="text-theme-textMuted">Select an algorithm to restructure mutex acquisition order and break the cycle.</p>
        </div>
        <div className="text-theme-success font-bold font-mono text-sm flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
          🔓 Strict Asymmetric Protocol
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Strategy 1 */}
        <button 
          onClick={() => setSelectedStrategy('resource-ordering')}
          className={`text-left p-6 rounded-2xl border transition-all ${
            selectedStrategy === 'resource-ordering' 
              ? 'bg-theme-bg border-theme-primary shadow-md' 
              : 'bg-white border-theme-border hover:border-theme-primary/50'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">🔢</span> Resource Ordering (Havender's Algorithm)
            </h3>
            {selectedStrategy === 'resource-ordering' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-theme-primary bg-theme-primary/10 px-2 py-1 rounded">
                <CheckCircle2 size={14} /> ACTIVE ALGORITHM
              </span>
            ) : (
              <Circle size={20} className="text-theme-border" />
            )}
          </div>
          
          <p className="text-theme-textMuted text-sm mb-4">
            Impose a global strict total ordering on all resources: 
            <span className="font-mono font-bold text-theme-text mx-1">F1 &lt; F2 &lt; F3 &lt; F4 &lt; F5</span>. 
            Every philosopher must acquire lower-numbered fork before the higher-numbered fork.
          </p>

          <div className={`p-4 rounded-xl text-sm font-mono ${selectedStrategy === 'resource-ordering' ? 'bg-white border-theme-border border' : 'bg-gray-50'}`}>
            <div className="text-theme-primary font-bold mb-1">💡 Ordering Rule:</div>
            P5 needs F5 and F1 → P5 MUST acquire F1 first!<br/>
            Since P1 holds F1, P5 waits without holding F5,<br/>
            freeing F5 for P4!
          </div>
        </button>

        {/* Strategy 2 */}
        <button 
          onClick={() => setSelectedStrategy('waiter')}
          className={`text-left p-6 rounded-2xl border transition-all ${
            selectedStrategy === 'waiter' 
              ? 'bg-theme-bg border-theme-primary shadow-md' 
              : 'bg-white border-theme-border hover:border-theme-primary/50'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">🧑‍🍳</span> Waiter / Central Arbitrator
            </h3>
            {selectedStrategy === 'waiter' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-theme-primary bg-theme-primary/10 px-2 py-1 rounded">
                <CheckCircle2 size={14} /> ACTIVE ALGORITHM
              </span>
            ) : (
              <span className="text-xs font-bold text-theme-textMuted bg-gray-100 px-2 py-1 rounded border border-theme-border">
                Alternative
              </span>
            )}
          </div>
          
          <p className="text-theme-textMuted text-sm mb-4">
            A centralized monitor / waiter process grants permission to pick up forks only when both are available, preventing partial resource acquisition.
          </p>

          <div className={`p-4 rounded-xl text-sm font-mono ${selectedStrategy === 'waiter' ? 'bg-white border-theme-border border' : 'bg-gray-50'}`}>
            <div className="text-theme-secondary font-bold mb-1">Monitor Invariant:</div>
            Philosophers enter critical section with an arbitrator token.<br/>
            Max concurrent diners = 4 to guarantee liveness.
          </div>
        </button>
      </div>
    </div>
  );
}
