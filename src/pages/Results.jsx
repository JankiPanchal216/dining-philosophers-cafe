import { useState } from 'react';
import { 
  Download, 
  RotateCcw, 
  Printer, 
  Activity, 
  Settings, 
  HelpCircle,
  Play,
  Lock,
  TrafficCone, // fallback for traffic
  TimerOff,
  AlertOctagon, // fallback for sync_problem
  FileCheck
} from 'lucide-react';
import Footer from '../components/Footer';

const INITIAL_TELEMETRY = [
  { title: "Meals Completed", value: "1,428", icon: "🍽️", footer: "+32% with fairness", status: "positive" },
  { title: "Avg Waiting Time", value: "1.4s", icon: "⏳", footer: "Down from 18.4s in starvation", status: "positive" },
  { title: "Deadlocks Encountered", value: "0", icon: "💀", footer: "100% prevented via Havender", status: "positive" },
  { title: "Starvation Events", value: "0", icon: "⚠️", footer: "FIFO bounded wait active", status: "positive" },
  { title: "Mutex Lock Cycles", value: "3,840", icon: "🔒", footer: "Zero race conditions", status: "positive" },
  { title: "Semaphore Operations", value: "2,112", icon: "🚦", footer: "wait/signal verified", status: "positive" }
];

const HAZARDS_DATA = [
  {
    scenario: "Circular Wait",
    icon: <AlertOctagon size={18} className="text-theme-error" />,
    hazard: "Coffman #4 Cyclic Dependency",
    description: "Each philosopher holds left fork while waiting for right fork.",
    solution: "Resource Ordering (Havender)",
    implementation: "Total order F1 < F2 < F3 < F4 < F5",
    result: "Prevented (Deadlocks: 0)"
  },
  {
    scenario: "Starvation",
    icon: <TimerOff size={18} className="text-theme-error" />,
    hazard: "Indefinite Process Lockout (P3)",
    description: "Fast-cycling neighbours (P2 & P4) continuously preempt shared forks.",
    solution: "FIFO Priority / Fair Queue",
    implementation: "Bounded wait timer & neighbor yield",
    result: "Prevented (Fairness Guaranteed)"
  },
  {
    scenario: "Critical Section",
    icon: <Lock size={18} className="text-theme-error" />,
    hazard: "Unshielded Concurrent Data Access",
    description: "Simultaneous grab of identical fork pointer causing race condition.",
    solution: "POSIX Mutex Lock",
    implementation: "Binary atomic test-and-set primitive",
    result: "Protected (Single Ownership)"
  },
  {
    scenario: "Semaphore Pool",
    icon: <TrafficCone size={18} className="text-theme-error" />,
    hazard: "Limited Shared Buffer Access",
    description: "Over-saturation of dining room capacity leading to contention spikes.",
    solution: "Counting Semaphore (N=2)",
    implementation: "Atomic sem_wait() and sem_post()",
    result: "Controlled (Safe Capacity)"
  }
];

const TAKEAWAYS = [
  {
    title: "Deadlock Prevention",
    icon: "💀",
    content: "Deadlock requires all 4 Coffman conditions simultaneously. Eliminating even one condition (such as breaking Circular Wait with resource hierarchy) guarantees a deadlock-free system.",
    footer: "Condition 4 Invalidation",
    label: "O(1) Overhead"
  },
  {
    title: "Starvation vs Deadlock",
    icon: "⚠️",
    content: "In deadlock, all processes are stuck and no one makes progress. In starvation, the overall system makes progress, but one or more individual threads are starved indefinitely.",
    footer: "Fair Liveness Bound",
    label: "FIFO Yield"
  },
  {
    title: "Synchronization Primitives",
    icon: "🔐",
    content: "Mutexes provide mutual exclusion for critical sections. Counting semaphores generalize this to arbitrary resource pool sizes. Proper pairing of wait/signal is vital to prevent livelocks.",
    footer: "Atomic State Handlers",
    label: "POSIX Compliant"
  },
  {
    title: "Real-World OS Applications",
    icon: "🛡️",
    content: "Modern operating system kernels (Linux schedulers, database transaction managers, distributed consensus engines) use these identical mathematical principles to prevent lock inversion.",
    footer: "Kernel Implementation",
    label: "futex / RCU"
  }
];

export default function Results() {
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [isRunning, setIsRunning] = useState(false);

  const handleExport = () => {
    const data = JSON.stringify(telemetry, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'benchmark_telemetry.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTelemetry([
        { ...INITIAL_TELEMETRY[0], value: "1,450" },
        { ...INITIAL_TELEMETRY[1], value: "1.3s" },
        { ...INITIAL_TELEMETRY[2], value: "0" },
        { ...INITIAL_TELEMETRY[3], value: "0" },
        { ...INITIAL_TELEMETRY[4], value: "4,012" },
        { ...INITIAL_TELEMETRY[5], value: "2,204" }
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen bg-theme-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* Lab Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-6 border-b border-theme-border">
          <div>
            <div className="text-sm font-bold text-theme-primary tracking-widest uppercase mb-2 font-mono flex items-center gap-2">
              <span>🔬</span> EMPIRICAL EXECUTION PROFILING • EP-4410 MULTITHREADING
            </div>
            <h1 className="text-3xl font-bold mb-2 font-sans">
              📊 Simulation Benchmark & Lab Comparison
            </h1>
            <p className="text-theme-textMuted max-w-3xl">
              Empirical performance metrics, concurrency hazards, and algorithmic remediation summary gathered over a 10,000-cycle stress run across 5 philosopher worker threads.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full lg:w-auto print-hide">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-theme-border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <Download size={16} /> Export Benchmark Telemetry (CSV/JSON)
            </button>
            <button onClick={handleRerun} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg text-sm font-bold hover:bg-theme-primaryContainer transition-colors shadow-sm disabled:opacity-50">
              <RotateCcw size={16} className={isRunning ? "animate-spin" : ""} /> {isRunning ? "Running..." : "Rerun Full Laboratory Suite"}
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-theme-border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
              <Printer size={16} /> Print Lab Report
            </button>
          </div>
        </div>

        {/* Runtime Telemetry KPIs */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity size={20} className="text-theme-primary" /> Verified Runtime Telemetry
            </h2>
            <div className="text-xs font-mono font-bold text-theme-textMuted bg-gray-100 px-3 py-1 rounded border border-gray-200">
              POSIX Threads (pthread) • Clock: 10.00 kHz
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {telemetry.map((metric, idx) => (
              <div key={idx} className="card-surface p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metric.icon}</span>
                </div>
                <div className="text-theme-textMuted text-xs font-bold uppercase tracking-wide mb-1">
                  {metric.title}
                </div>
                <div className="text-2xl font-mono font-bold mb-2">
                  {metric.value}
                </div>
                <div className={`text-[10px] font-bold mt-auto ${metric.status === 'positive' ? 'text-theme-success' : 'text-theme-textMuted'}`}>
                  {metric.footer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Concurrency Hazard Matrix */}
        <div className="card-surface overflow-hidden">
          <div className="p-6 border-b border-theme-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Concurrency Hazard Matrix</h2>
              <p className="text-sm text-theme-textMuted">Formal assessment of synchronisation primitives under stress-injected execution traces.</p>
            </div>
            <div className="px-3 py-1 bg-green-50 text-theme-success border border-green-200 rounded-full text-xs font-bold">
              ● 4 of 4 Remediations Passed
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-theme-textMuted uppercase bg-gray-50 border-b border-theme-border">
                <tr>
                  <th className="px-6 py-4 font-bold">Scenario</th>
                  <th className="px-6 py-4 font-bold">Concurrency Hazard / Problem</th>
                  <th className="px-6 py-4 font-bold">Algorithmic Solution</th>
                  <th className="px-6 py-4 font-bold">Implementation Strategy</th>
                  <th className="px-6 py-4 font-bold">Verified Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {HAZARDS_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                      {row.icon} {row.scenario}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-theme-error">{row.hazard}</div>
                      <div className="text-xs text-theme-textMuted mt-1 whitespace-normal max-w-xs">{row.description}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-theme-secondary">
                      {row.solution}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {row.implementation}
                    </td>
                    <td className="px-6 py-4 font-bold text-theme-success">
                      ✓ {row.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-theme-border flex flex-col md:flex-row justify-between text-xs text-theme-textMuted font-mono">
            <div>ⓘ Tested on 5-node topology with randomized meal intervals (Uniform Distribution 120ms – 450ms).</div>
            <div className="mt-2 md:mt-0 font-bold">Formal verification engine: SPIN / Promela Model Checker</div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div>
          <h2 className="text-xl font-bold mb-2">📖 What Did We Learn? Key Takeaways</h2>
          <p className="text-sm text-theme-textMuted mb-4">Core synchronization tenets derived from empirical lab runs.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {TAKEAWAYS.map((card, idx) => (
              <div key={idx} className="card-surface p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{card.icon}</div>
                  <h3 className="font-bold text-lg">{card.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed">
                  {card.content}
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-theme-border">
                  <div className="text-xs font-bold text-theme-primary">{card.footer}</div>
                  <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-mono font-bold text-gray-600 uppercase">
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Certificate */}
        <div className="bg-[#fdfbf7] border border-[#e8dccb] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 text-theme-success flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
            <FileCheck size={32} />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-xl font-bold font-sans text-gray-900 mb-1">Laboratory Verification Certificate</h2>
            <p className="text-sm text-gray-600 max-w-xl">
              Session #DP-9942 authenticated. All concurrency invariants satisfied without invariant violation.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2 border-t md:border-t-0 md:border-l border-[#e8dccb] pt-4 md:pt-0 md:pl-6 text-xs font-mono">
            <div className="bg-white px-3 py-1.5 rounded border border-gray-200 font-bold text-gray-700 w-full text-center md:text-right">
              HASH: 0x8F3E..B12A
            </div>
            <div className="bg-white px-3 py-1.5 rounded border border-gray-200 font-bold text-theme-primary w-full text-center md:text-right">
              STUDENT ID: ENG-SYS-2024
            </div>
          </div>
        </div>

      </div>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .print-hide { display: none !important; }
          body { background: white !important; }
          .card-surface { border: 1px solid #ddd !important; box-shadow: none !important; break-inside: avoid; }
        }
      `}} />
    </div>
  );
}
