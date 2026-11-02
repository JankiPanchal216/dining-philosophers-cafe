import { Pause, Play, RotateCcw } from 'lucide-react';
import { fmtTime } from '../sim/engine';

export default function Controls({ running, toggle, reset, speed, setSpeed, time }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={toggle} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-sm active:scale-95 transition-transform hover:opacity-90" title="Space">
        {running ? <Pause size={18} /> : <Play size={18} />}
        {running ? 'Pause' : 'Resume'}
      </button>
      <button onClick={reset} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold active:scale-95 transition-transform hover:bg-muted">
        <RotateCcw size={16} /> Restart
      </button>
      <div className="inline-flex overflow-hidden rounded-lg border border-line" role="group" aria-label="Speed">
        {[0.5, 1, 2].map((s) => (
          <button key={s} onClick={() => setSpeed(s)} aria-pressed={speed === s} className={`min-h-[44px] min-w-[42px] px-3 py-2 text-sm font-semibold active:opacity-80 transition-colors ${speed === s ? 'bg-ink text-bg font-bold' : 'bg-surface hover:bg-muted'}`}>
            {s}×
          </button>
        ))}
      </div>
      <span className="ml-auto font-mono text-sm tabular-nums text-sub pl-2">{fmtTime(time)}</span>
      <kbd className="hidden rounded border border-line bg-muted px-1.5 py-0.5 text-xs text-sub sm:inline">Space</kbd>
    </div>
  );
}
