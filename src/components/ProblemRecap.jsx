import { AlertTriangle } from 'lucide-react';

export default function ProblemRecap() {
  const cycleSteps = [
    { phil: 'P1', waitsForFork: 'F5', heldBy: 'P5' },
    { phil: 'P5', waitsForFork: 'F4', heldBy: 'P4' },
    { phil: 'P4', waitsForFork: 'F3', heldBy: 'P3' },
    { phil: 'P3', waitsForFork: 'F2', heldBy: 'P2' },
    { phil: 'P2', waitsForFork: 'F1', heldBy: 'P1' },
  ];

  return (
    <div className="bg-red-50 border border-theme-error/20 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-3 text-theme-error font-bold mb-4">
        <div className="w-10 h-10 rounded-full bg-theme-error/10 flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-lg">🔴 DEADLOCK: Circular Dependency Lockout</h2>
          <p className="text-sm font-mono opacity-80">Wait-For Graph (WFG) Cycle Detected</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-theme-text mb-2 text-lg">
          Coffman Condition IV: Circular Wait
        </h3>
        <p className="text-theme-textMuted max-w-3xl text-sm leading-relaxed">
          In naive greedy acquisition, all philosophers sit down, synchronously seize their left-hand fork, and block indefinitely waiting for their right fork. The circular dependency graph has no sink node.
        </p>
      </div>

      <div className="bg-white border border-theme-error/20 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 font-mono text-xs whitespace-nowrap min-w-max">
          {cycleSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-theme-error text-white rounded-md font-bold shadow-xs">
                {step.phil}
              </span>
              <span className="text-theme-error font-bold">waits</span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold shadow-xs">
                {step.waitsForFork}
              </span>
              <span className="text-theme-textMuted text-[10px]">held by</span>
              <span className="text-theme-error font-bold">→</span>
            </div>
          ))}
          <span className="px-2.5 py-1 bg-theme-error text-white rounded-md font-bold shadow-xs">
            P1
          </span>
          <span className="text-xs text-red-600 font-bold ml-2">(Closed Cycle)</span>
        </div>
      </div>
    </div>
  );
}
