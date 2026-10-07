import { leftFork } from '../sim/engine';
import { PHIL_COLORS } from '../data/colors';


const VB = 660;
const C = VB / 2;
const R_PLATE = 135; // plates and forks
const R_LABEL = 176; // fork labels
const R_SEAT = 262;

const rad = (d) => (d * Math.PI) / 180;
const polar = (r, deg) => [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))];
const seatAngle = (i, n) => -90 + (360 / n) * i;
const norm = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

function forkPose(f, snap) {
  const n = snap.n;
  const step = 360 / n;
  const slot = seatAngle(f, n) - step / 2; // between philosopher f-1 and f
  const holder = snap.forks[f].holder;
  if (holder === null) return { ang: slot, held: false };
  const p = snap.phils[holder];
  const side = f === leftFork(holder, n) ? 1 : -1;
  const reach = p.state === 'eating' ? 19 : 24;
  const target = seatAngle(holder, n) + side * reach;
  return { ang: slot + norm(target - slot), held: true, holder };
}

function ForkGlyph({ color }) {
  return (
    <g stroke={color} strokeWidth="3.6" strokeLinecap="round" fill="none">
      <path d="M-7 -27 V-9 M0 -27 V-9 M7 -27 V-9" />
      <path d="M-7 -9 Q-7 3 0 3 Q7 3 7 -9" />
      <path d="M0 3 V27" />
    </g>
  );
}

export default function Table({ snap, showClean, paused }) {
  const n = snap.n;
  const poses = snap.forks.map((f) => forkPose(f.i, snap));
  const forkXY = poses.map((p) => polar(R_PLATE, p.ang));
  const deadSet = new Set(snap.deadlock ? snap.deadlock.cycle : []);

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className="block h-auto w-full" role="img" aria-label="Dining table with philosophers and forks">
      <circle cx={C} cy={C} r="212" style={{ fill: 'var(--table)', stroke: 'var(--plate-stroke)' }} strokeWidth="2" />

      {/* plates */}
      {snap.phils.map((p) => {
        const [x, y] = polar(R_PLATE, seatAngle(p.i, n));
        const eating = p.state === 'eating';
        return (
          <g key={`plate${p.i}`}>
            <circle cx={x} cy={y} r="38" style={{ fill: 'var(--plate)', stroke: eating ? 'var(--tone-eating)' : 'var(--plate-stroke)' }} strokeWidth={eating ? 4 : 2} />
            {eating && (
              <text x={x} y={y + 12} textAnchor="middle" fontSize="34">
                🍝
              </text>
            )}
          </g>
        );
      })}

      {/* centre info */}
      {snap.center && (
        <g textAnchor="middle" style={{ fill: 'var(--text)' }}>
          <text x={C} y={C - 12} fontSize="17" fontWeight="700">
            {snap.center.title}
          </text>
          {snap.center.lines.map((l, k) => (
            <text key={k} x={C} y={C + 10 + k * 18} fontSize="13.5" style={{ fill: 'var(--sub)' }}>
              {l}
            </text>
          ))}
          {snap.center.dots && (
            <g>
              {Array.from({ length: snap.center.dots.total }).map((_, k) => {
                const total = snap.center.dots.total;
                const x = C - ((total - 1) * 22) / 2 + k * 22;
                const filled = k < snap.center.dots.filled;
                return <circle key={k} cx={x} cy={C + 48} r="7" style={{ fill: filled ? 'var(--tone-eating)' : 'transparent', stroke: 'var(--tone-eating)' }} strokeWidth="2" />;
              })}
            </g>
          )}
        </g>
      )}

      {/* ownership lines (fork -> holder) and wait lines (waiter -> fork) */}
      {snap.forks.map((f) => {
        const pose = poses[f.i];
        if (!pose.held) return null;
        const [sx, sy] = polar(R_SEAT, seatAngle(pose.holder, n));
        return <line key={`own${f.i}`} x1={sx} y1={sy} x2={forkXY[f.i][0]} y2={forkXY[f.i][1]} stroke={PHIL_COLORS[pose.holder]} strokeWidth="4" opacity="0.5" className="fork-move" />;
      })}
      {snap.phils.map((p) =>
        p.waits.map((w) => {
          const [sx, sy] = polar(R_SEAT, seatAngle(p.i, n));
          const [fx, fy] = forkXY[w.fork];
          const bad = p.tone === 'bad';
          return <line key={`wait${p.i}-${w.fork}`} x1={sx} y1={sy} x2={fx} y2={fy} strokeWidth="3" strokeDasharray="7 7" strokeLinecap="round" style={{ stroke: bad ? 'var(--tone-bad)' : PHIL_COLORS[p.i] }} opacity="0.95" />;
        })
      )}

      {/* forks */}
      {snap.forks.map((f) => {
        const pose = poses[f.i];
        const color = pose.held ? PHIL_COLORS[pose.holder] : 'var(--fork-free)';
        const [x, y] = polar(R_PLATE, pose.ang);
        const [lx, ly] = polar(R_LABEL, pose.ang);
        const text = pose.held ? `F${f.i + 1} · P${pose.holder + 1}` : `F${f.i + 1}`;
        const w = 14 + text.length * 7.6;
        return (
          <g key={`fork${f.i}`}>
            <g className="fork-move" style={{ transform: `translate(${x}px, ${y}px) rotate(${pose.ang - 90}deg)` }}>
              <ForkGlyph color={color} />
              {showClean && pose.held && <circle cx="13" cy="0" r="4.5" style={{ fill: f.dirty ? '#7c4a1d' : '#38bdf8', stroke: 'var(--surface)' }} strokeWidth="1.5" />}
            </g>
            <g className="fork-move" style={{ transform: `translate(${lx}px, ${ly}px)` }}>
              <rect x={-w / 2} y="-12" width={w} height="24" rx="12" style={{ fill: pose.held ? color : 'var(--pill)', stroke: pose.held ? color : 'var(--plate-stroke)' }} strokeWidth="1.5" />
              <text textAnchor="middle" y="4.5" fontSize="13" fontWeight="700" style={{ fill: pose.held ? '#fff' : 'var(--text)' }}>
                {text}
              </text>
            </g>
          </g>
        );
      })}

      {/* philosophers */}
      {snap.phils.map((p) => {
        const [x, y] = polar(R_SEAT, seatAngle(p.i, n));
        return (
          <g key={`seat${p.i}`}>
            {deadSet.has(p.i) || p.label === 'STARVING' ? <circle cx={x} cy={y} r="58" fill="none" strokeWidth="4" className="pulse" style={{ stroke: 'var(--tone-bad)' }} /> : null}
            <circle cx={x} cy={y} r="46" style={{ fill: `var(--tone-${p.tone})` }} stroke={PHIL_COLORS[p.i]} strokeWidth="7" />
            <text x={x} y={y - 3} textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">
              P{p.i + 1}
            </text>
            <text x={x} y={y + 16} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff" letterSpacing="0.3">
              {p.label}
            </text>
          </g>
        );
      })}

      {paused && (
        <g>
          <rect x={C - 74} y={C - 74} width="148" height="34" rx="17" style={{ fill: 'var(--text)' }} opacity="0.88" />
          <text x={C} y={C - 51} textAnchor="middle" fontSize="15" fontWeight="800" letterSpacing="2" style={{ fill: 'var(--bg)' }}>
            PAUSED
          </text>
        </g>
      )}
    </svg>
  );
}
