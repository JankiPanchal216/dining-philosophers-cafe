import { AlertTriangle } from 'lucide-react';

export default function ProblemRecap() {
  return (
    <div className="bg-red-50 border border-theme-error/20 rounded-2xl p-6 shadow-sm">
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
          Condition IV: Each thread retains one mutex while blocking on the next
        </h3>
        <p className="text-theme-textMuted max-w-3xl">
          In naive greedy acquisition, all philosophers sit down, synchronously seize their left-hand fork, and block indefinitely waiting for their right fork. The circular dependency graph has no sink node.
        </p>
      </div>

      <div className="bg-white border border-theme-error/20 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 font-mono text-sm whitespace-nowrap min-w-max">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-3 py-1 bg-theme-error text-white rounded-full font-bold shadow-sm">P{i}</span>
              <span className="text-theme-error font-bold">→</span>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-bold shadow-sm">F{i === 5 ? 1 : i + 1}</span>
              <span className="text-theme-error font-bold">→</span>
            </div>
          ))}
          <span className="px-3 py-1 bg-theme-error text-white rounded-full font-bold shadow-sm">P1</span>
        </div>
      </div>
    </div>
  );
}
