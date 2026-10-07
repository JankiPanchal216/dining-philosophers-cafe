import { PHIL_COLORS } from '../data/colors';

function detail(p) {
  const forks = (arr) => arr.map((f) => `F${f + 1}`).join(' + ');
  if (p.state === 'eating') return `Eating with ${forks([p.right, p.left].sort((a, b) => a - b))}`;
  if (p.state === 'thinking') return p.held.length ? `Thinking · keeps ${forks(p.held)}` : 'Thinking';
  const holds = p.held.length ? `holds ${forks(p.held)}` : 'holds nothing';
  if (p.label === 'BACK-OFF') return `Backing off · ${holds}`;
  if (p.waitKind === 'room') return 'Waiting for a free seat';
  if (p.waits.length) {
    const who = p.waits.map((w) => `F${w.fork + 1}${w.holder !== null ? ` (held by P${w.holder + 1})` : ''}`).join(', ');
    return `${p.held.length ? `Holds ${forks(p.held)} · ` : ''}waiting for ${who}`;
  }
  if (p.waitKind === 'arbiter') return 'In the queue for both forks';
  return `Reaching for a fork · ${holds}`;
}

export default function PhilosopherList({ snap }) {
  return (
    <ul className="grid gap-2">
      {snap.phils.map((p) => (
        <li key={p.i} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3" style={{ borderLeft: `6px solid ${PHIL_COLORS[p.i]}` }}>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-base font-bold">P{p.i + 1}</span>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide text-white" style={{ background: `var(--tone-${p.tone})` }}>
                {p.label}
              </span>
            </div>
            <p className="mt-1 text-sm leading-snug text-sub">{detail(p)}</p>
          </div>
          <div className="shrink-0 text-right text-sm tabular-nums">
            <div className="font-bold">{p.meals} <span className="font-normal text-sub">{p.meals === 1 ? 'meal' : 'meals'}</span></div>
            {p.state === 'hungry' && <div className={p.tone === 'bad' ? 'font-bold text-tone-bad' : 'text-sub'}>{(p.waitMs / 1000).toFixed(1)}s hungry</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}
