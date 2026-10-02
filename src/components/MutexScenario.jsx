export default function MutexScenario({ mutexOwner, waitTime, onSimulate, onReset }) {
  const isP1Owner = mutexOwner === 'P1';

  return (
    <div className="card-surface p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            🔒 1. Binary Mutex Scenario: Plate Mutex In Action
          </h2>
          <p className="text-theme-textMuted">
            Two philosophical threads contending for exclusive charger plate access.
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${isP1Owner ? 'bg-theme-error/10 text-theme-error border-theme-error/20' : 'bg-theme-success/10 text-theme-success border-theme-success/20'}`}>
          ● MUTEX_{isP1Owner ? 'LOCKED' : 'HELD_BY_P2'}
        </div>
      </div>

      <div className="bg-gray-50 border border-theme-border rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-theme-textMuted uppercase mb-1">Shared Physical Resource</div>
          <div className="font-bold">Shared Dining Buffer / Table Plate</div>
        </div>
        <div className="text-right font-mono text-sm text-theme-textMuted">
          <div>Resource ID: <span className="font-bold text-theme-text">0xCAFE</span></div>
          <div>Mutex Variable: <span className="font-bold text-theme-text">plate_lock</span></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* P1 */}
        <div className={`border rounded-xl p-4 transition-colors ${isP1Owner ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between mb-4">
            <div>
              <div className="font-bold text-lg">P1</div>
              <div className="text-xs text-theme-textMuted">Philosopher 1</div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded ${isP1Owner ? 'bg-theme-success text-white' : 'bg-gray-200 text-gray-600'}`}>
              {isP1Owner ? 'EATING / ACCESSING' : 'THINKING / RELEASED'}
            </div>
          </div>
          
          <div className="font-mono text-sm space-y-2">
            <div className="font-bold">Lock Holder: {isP1Owner ? 'YES [0xCAFE]' : 'NO'}</div>
            {isP1Owner ? (
              <>
                <div className="text-theme-success">🔓 Inside Critical Section</div>
                <div className="bg-white p-2 border rounded">pthread_mutex_lock(&plate_lock);</div>
                <div className="text-xs text-theme-textMuted">Operating on shared memory</div>
              </>
            ) : (
              <div className="text-theme-textMuted italic">Released mutex</div>
            )}
          </div>
        </div>

        {/* P2 */}
        <div className={`border rounded-xl p-4 transition-colors ${!isP1Owner ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between mb-4">
            <div>
              <div className="font-bold text-lg">P2</div>
              <div className="text-xs text-theme-textMuted">Philosopher 2</div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded ${!isP1Owner ? 'bg-theme-success text-white' : 'bg-theme-error text-white'}`}>
              {!isP1Owner ? 'EATING / ACCESSING' : 'BLOCKED IN SLEEP QUEUE'}
            </div>
          </div>
          
          <div className="font-mono text-sm space-y-2">
            <div className="font-bold">Lock Holder: {!isP1Owner ? 'YES [0xCAFE]' : 'NO (Blocked)'}</div>
            {!isP1Owner ? (
              <>
                <div className="text-theme-success">🔓 Inside Critical Section</div>
                <div className="bg-white p-2 border rounded">lock acquired successfully</div>
              </>
            ) : (
              <>
                <div className="text-theme-error">⌛ Sleeping on Wait Queue</div>
                <div className="bg-white p-2 border rounded opacity-70">pthread_mutex_lock(&plate_lock); // Stall</div>
                <div className="text-xs text-theme-error font-bold">Wait time: {waitTime.toLocaleString()} ms</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-theme-bg border border-theme-border rounded-xl p-4 mb-6 text-center">
        <div className="text-xs font-bold text-theme-textMuted uppercase mb-3">Atomic State Handoff</div>
        {isP1Owner ? (
          <p className="text-sm mb-4">P1 holds lock → P2 waits → Trigger release to wake P2.</p>
        ) : (
          <p className="text-sm mb-4 text-theme-success font-bold">P1 unlocked & signaled futex!<br/>P2 successfully acquired 0xCAFE.</p>
        )}
        
        <div className="flex justify-center gap-2">
          {isP1Owner ? (
            <button 
              onClick={onSimulate}
              className="px-6 py-2 bg-theme-primary text-white font-bold rounded-lg hover:bg-theme-primaryContainer transition-colors shadow-sm"
            >
              Simulate: P1 Unlock → Signal P2
            </button>
          ) : (
            <button 
              onClick={onReset}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
            >
              Reset Scenario
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-theme-border text-sm flex gap-4">
        <div className="font-bold text-theme-primary">Theoretical Principle:</div>
        <div className="text-theme-textMuted">
          A binary mutex ensures mutual exclusion: exactly one thread accesses the protected critical section at any given instant. Other threads wait until the lock owner executes: <code className="bg-gray-100 px-1 rounded font-mono text-theme-text">pthread_mutex_unlock()</code>
        </div>
      </div>
    </div>
  );
}
