export default function SemaphorePanel({ p3HasPermit, onTrigger, onReset }) {
  const permitsAvailable = p3HasPermit ? 1 : 0;
  
  return (
    <div className="card-surface p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <span className="text-3xl">🚦</span> 2. Counting Semaphore
        </h2>
        <p className="text-theme-textMuted">
          Resource pool with multiple shared permits.
        </p>
      </div>

      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="text-xl font-bold text-blue-900 font-mono">N = 2</div>
        <div className="text-right font-mono text-sm">
          <div className="font-bold text-blue-900">sem_t permits = {permitsAvailable}</div>
          <div className="text-blue-700/70">2 tokens total,<br/>{permitsAvailable} currently available in reserve</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`border-2 rounded-xl p-4 text-center font-bold ${p3HasPermit ? 'bg-gray-50 border-gray-300 text-gray-500' : 'bg-green-50 border-green-400 text-green-800'}`}>
          <div className="text-sm mb-2 opacity-80">Permit #1</div>
          <div>{p3HasPermit ? 'Transferred' : 'Held by P1'}</div>
        </div>
        <div className="border-2 border-green-400 bg-green-50 rounded-xl p-4 text-center font-bold text-green-800">
          <div className="text-sm mb-2 opacity-80">Permit #2</div>
          <div>Held by P2</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm font-mono">
        <div className="border border-theme-border rounded-lg p-3">
          <div className="font-bold text-theme-textMuted mb-2 uppercase text-xs">Permit Holders (Inside Buffer)</div>
          {!p3HasPermit && <div className="text-theme-success mb-1">P1 — Philosopher 1 — Permit 1</div>}
          <div className="text-theme-success mb-1">P2 — Philosopher 2 — Permit 2</div>
          {p3HasPermit && <div className="text-theme-success">P3 — Philosopher 3 — Permit 1</div>}
        </div>
        <div className="border border-theme-border rounded-lg p-3">
          <div className="font-bold text-theme-textMuted mb-2 uppercase text-xs">Waiting Queue (Blocked)</div>
          {!p3HasPermit && <div className="text-theme-error mb-1">P3 — Philosopher 3 — Blocked</div>}
          <div className="text-orange-500">P4 — Philosopher 4 — Waiting</div>
        </div>
      </div>

      <div className="mt-auto bg-theme-bg border border-theme-border rounded-xl p-4 text-center">
        <div className="text-xs font-bold text-theme-textMuted uppercase mb-3">Invoke POSIX Primitive</div>
        {!p3HasPermit ? (
          <p className="text-sm mb-4">Post permit from P1 → Awake P3 immediately</p>
        ) : (
          <p className="text-sm mb-4 text-theme-success font-bold">Permit 1 signaled by P1 and consumed instantly by P3</p>
        )}
        
        <div className="flex justify-center gap-2">
          {!p3HasPermit ? (
            <button 
              onClick={onTrigger}
              className="px-6 py-2 bg-theme-secondary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Trigger sem_post(&permits)
            </button>
          ) : (
            <button 
              onClick={onReset}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
            >
              Reset Semaphore
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
