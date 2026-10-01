export default function ProofPanel() {
  return (
    <div className="card-surface p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span>🧠</span> The Mathematical Proof
      </h3>
      
      <div className="bg-theme-bg p-4 rounded-xl border border-theme-border text-sm font-mono text-theme-textMuted mb-4">
        By establishing a strict total order relation<br/><br/>
        <span className="font-bold text-theme-text">R = {'{(F_i, F_j) | i < j}'}</span><br/><br/>
        a circular dependency would require that for some cycle,<br/><br/>
        <span className="font-bold text-theme-error">F_max &lt; F_min</span><br/><br/>
        which violates the properties of strict inequality.
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-theme-border rounded-lg p-3 text-center shadow-sm">
          <div className="text-[10px] uppercase text-theme-textMuted font-bold mb-1">Contention Index</div>
          <div className="font-mono text-sm font-bold text-theme-success">0.00 Cont/s</div>
        </div>
        <div className="flex-1 bg-white border border-theme-border rounded-lg p-3 text-center shadow-sm">
          <div className="text-[10px] uppercase text-theme-textMuted font-bold mb-1">POSIX Lock Latency</div>
          <div className="font-mono text-sm font-bold text-theme-text">0.02ms</div>
        </div>
      </div>
    </div>
  );
}
