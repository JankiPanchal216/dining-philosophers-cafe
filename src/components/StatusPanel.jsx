export default function StatusPanel() {
  return (
    <div className="card-surface p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-sm tracking-widest text-theme-textMuted uppercase">
          Mutex Table Dispatcher
        </h3>
        <div className="flex items-center gap-2 text-xs font-bold text-theme-error animate-pulse">
          <div className="w-2 h-2 rounded-full bg-theme-error"></div>
          LIVE
        </div>
      </div>

      <div className="font-mono text-sm space-y-3 flex-grow">
        <div className="flex justify-between items-center border-b border-theme-border pb-2">
          <span className="text-theme-textMuted">Fork #1 (Mutex A)</span>
          <span className="text-theme-error font-medium">LOCKED [P1]</span>
        </div>
        <div className="flex justify-between items-center border-b border-theme-border pb-2">
          <span className="text-theme-textMuted">Fork #2 (Mutex B)</span>
          <span className="text-theme-error font-medium">LOCKED [P2]</span>
        </div>
        <div className="flex justify-between items-center border-b border-theme-border pb-2">
          <span className="text-theme-textMuted">Fork #3 (Mutex C)</span>
          <span className="text-yellow-600 font-medium">WAIT-CYCLE [P3]</span>
        </div>
      </div>

      <div className="mt-6 bg-[#1d1b19] text-[#dfc0b7] p-4 rounded-lg font-mono text-xs">
        <div className="opacity-50 mb-1">LOG:</div>
        <div className="text-theme-error">
          &gt; Coffman condition #4 (Circular Wait) detected.
        </div>
      </div>
    </div>
  );
}
