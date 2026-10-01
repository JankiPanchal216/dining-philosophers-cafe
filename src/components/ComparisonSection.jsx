export default function ComparisonSection() {
  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Before & After System Comparison</h2>
        <p className="text-theme-textMuted">Systemic deadlock breakdown vs. guaranteed concurrency progression</p>
        <span className="inline-block mt-3 px-3 py-1 bg-gray-100 border border-theme-border rounded-full text-xs font-bold text-theme-textMuted uppercase tracking-widest">
          Telemetry Split Matrix
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        
        {/* BEFORE */}
        <div className="card-surface border-theme-error/30 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="bg-theme-error text-white p-4">
            <h3 className="font-bold text-lg">✕ BEFORE: Naive Symmetrical Acquisition</h3>
            <div className="text-xs font-mono font-bold opacity-80 mt-1 uppercase">Livelock / Deadlock</div>
          </div>
          <div className="p-6">
            <p className="text-sm mb-4">Circular wait active → All 5 hold left fork → Wait for right fork → Fatal Deadlock.</p>
            <ul className="space-y-2 text-sm font-mono text-theme-error">
              <li className="flex gap-2"><span>✕</span> P1 holds F1, blocks on F2</li>
              <li className="flex gap-2"><span>✕</span> P5 holds F5, blocks on F1</li>
              <li className="flex gap-2 font-bold"><span>✕</span> Zero thread progression</li>
            </ul>
          </div>
        </div>

        {/* AFTER */}
        <div className="card-surface border-theme-success/30 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="bg-theme-success text-white p-4">
            <h3 className="font-bold text-lg">✓ AFTER: Resource Ordering Enforced</h3>
            <div className="text-xs font-mono font-bold opacity-80 mt-1 uppercase">Liveness Guarantee</div>
          </div>
          <div className="p-6">
            <p className="text-sm mb-4">Resource ordering enforced → P5 picks F1 before F5 → P4 acquires F5 & eats → Chain completes smoothly.</p>
            <ul className="space-y-2 text-sm font-mono text-theme-success">
              <li className="flex gap-2"><span>✓</span> Total Resource Hierarchy holds invariant</li>
              <li className="flex gap-2"><span>✓</span> F5 never sequestered when P5 cannot eat</li>
              <li className="flex gap-2 font-bold"><span>✓</span> Continuous bounded wait</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quantitative Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface p-6 text-center">
          <div className="text-3xl font-bold text-theme-success mb-1">+100%</div>
          <div className="text-sm text-theme-textMuted font-medium uppercase tracking-wider">Throughput Gain</div>
        </div>
        <div className="card-surface p-6 text-center">
          <div className="text-3xl font-bold text-theme-success mb-1">0%</div>
          <div className="text-sm text-theme-textMuted font-medium uppercase tracking-wider">Deadlock Risk</div>
        </div>
        <div className="card-surface p-6 text-center">
          <div className="text-3xl font-bold text-theme-primary mb-1">2 Threads</div>
          <div className="text-sm text-theme-textMuted font-medium uppercase tracking-wider">Simultaneous Eating</div>
        </div>
      </div>
    </div>
  );
}
