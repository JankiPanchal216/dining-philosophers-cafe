import { useEffect, useRef } from 'react';
import { fmtTime } from '../sim/engine';
import { PHIL_COLORS } from '../data/colors';

export default function EventLog({ log }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log]);
  return (
    <div ref={ref} className="h-40 overflow-y-auto rounded-xl border border-line bg-surface p-3 font-mono text-[13px] leading-6" aria-label="Event log">
      {log.map((e) => (
        <div key={e.id} className="flex gap-2">
          <span className="shrink-0 text-sub">[{fmtTime(e.t)}]</span>
          <span style={e.kind === 'bad' ? { color: 'var(--tone-bad)', fontWeight: 700 } : e.who !== null ? { color: PHIL_COLORS[e.who] } : undefined}>{e.text}</span>
        </div>
      ))}
    </div>
  );
}
