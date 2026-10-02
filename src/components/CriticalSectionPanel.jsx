import { Play, RotateCcw, CheckCircle2, Circle } from 'lucide-react';

export default function CriticalSectionPanel({ runSuite, suiteRunning, suiteResults, telemetry, onGlobalReset }) {
  
  const getStatus = (title) => {
    const res = suiteResults.find(r => r.title === title);
    if (res) return res.status;
    return suiteRunning ? 'TESTING...' : 'PENDING';
  };

  const getStatusColor = (status) => {
    if (status.includes('VERIFIED') || status.includes('PASSED') || status.includes('ENFORCED')) return 'text-theme-success';
    if (status === 'TESTING...') return 'text-blue-500 animate-pulse';
    return 'text-theme-textMuted';
  };

  return (
    <div className="card-surface mt-8 overflow-hidden">
      <div className="p-6 border-b border-theme-border flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            🛡️ 3. Critical Section Invariant Matrix & POSIX Implementation
          </h2>
          <p className="text-theme-textMuted">
            Mathematical formalization of synchronization correctness under concurrent interleaving.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button 
            onClick={onGlobalReset}
            className="px-4 py-2 bg-gray-100 border border-theme-border rounded-lg text-theme-text font-semibold flex items-center gap-2 hover:bg-gray-200 transition-colors text-sm"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={runSuite}
            disabled={suiteRunning}
            className="px-4 py-2 bg-theme-primary text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-theme-primaryContainer transition-colors text-sm shadow-sm disabled:opacity-50"
          >
            <Play size={16} /> Run Synchronization Suite
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 divide-x divide-theme-border">
        {/* Code Panel */}
        <div className="p-6 bg-[#1d1b19] text-gray-300 font-mono text-sm relative">
          <div className="absolute top-0 right-0 bg-theme-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            philosopher_sync.c (POSIX Thread Routine)
          </div>
          <pre className="overflow-x-auto pt-4 pb-8 custom-scrollbar">
            <code>
{`// Philosopher i Worker Thread
void* philosopher_routine(void* arg) {
    int id = *(int*)arg;

    while (lab_active) {

        // Non-Critical Section: Contemplation
        think_in_cafe(id);

        // Entry Section: Contend for Shared Plate
        pthread_mutex_lock(&plate_lock);

        /* CRITICAL SECTION BEGIN */
        consume_dish(plate_buffer, id);
        record_invariant_telemetry(id);
        /* CRITICAL SECTION END */

        // Exit Section: Atomic Unlock & Broadcast
        pthread_mutex_unlock(&plate_lock);

        // Remainder Section
        rest_between_courses();
    }

    return NULL;
}`}
            </code>
          </pre>
          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-xs text-gray-400">
            <div>Compiler: gcc -pthread -O2</div>
            <div className="text-green-400 font-bold">Static Analysis: Clean (0 Race Hazards)</div>
          </div>
        </div>

        {/* Invariant & Telemetry */}
        <div className="flex flex-col">
          <div className="p-6 border-b border-theme-border">
            <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-theme-textMuted">
              Dijkstra’s Critical Section Invariant Criteria
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="text-sm pr-4">
                  <div className="font-bold mb-1">1. Mutual Exclusion</div>
                  <div className="text-theme-textMuted">At most one thread executes inside the critical plate buffer at any instant.</div>
                </div>
                <div className={`font-mono text-xs font-bold whitespace-nowrap mt-1 ${getStatusColor(getStatus('Dijkstra Invariant 1: Mutual Exclusion'))}`}>
                  {getStatus('Dijkstra Invariant 1: Mutual Exclusion')}
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="text-sm pr-4">
                  <div className="font-bold mb-1">2. Progress</div>
                  <div className="text-theme-textMuted">If no thread is in the critical section, waiting threads decide entry without postponement.</div>
                </div>
                <div className={`font-mono text-xs font-bold whitespace-nowrap mt-1 ${getStatusColor(getStatus('Dijkstra Invariant 2: Deadlock Freedom / Progress'))}`}>
                  {getStatus('Dijkstra Invariant 2: Deadlock Freedom / Progress')}
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="text-sm pr-4">
                  <div className="font-bold mb-1">3. Bounded Waiting</div>
                  <div className="text-theme-textMuted">Strict bound on thread bypass counts before its entry request is granted.</div>
                </div>
                <div className={`font-mono text-xs font-bold whitespace-nowrap mt-1 ${getStatusColor(getStatus('Dijkstra Invariant 3: Bounded Waiting Queue'))}`}>
                  {getStatus('Dijkstra Invariant 3: Bounded Waiting Queue')}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex-grow flex flex-col">
            <div className="flex justify-between items-end mb-3">
              <h3 className="font-bold uppercase text-xs tracking-widest text-theme-textMuted">
                📊 Live Contention Telemetry Track
              </h3>
              <div className="text-[10px] font-mono text-theme-textMuted font-bold">Sampling: 100 Hz</div>
            </div>
            
            <div className="flex-grow bg-white border border-theme-border rounded-lg p-3 overflow-y-auto max-h-[250px] font-mono text-xs custom-scrollbar">
              <div className="space-y-2">
                {telemetry.map((t, i) => (
                  <div key={i} className={`flex gap-3 ${
                    t.type === 'error' ? 'text-theme-error' : 
                    t.type === 'success' ? 'text-theme-success' : 'text-gray-600'
                  }`}>
                    <span className="opacity-70 whitespace-nowrap">[{t.time}]</span>
                    <span>{t.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
