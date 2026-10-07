import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { findLab, FIRST_LAB } from '../data/catalog';
import { useSimulation } from '../hooks/useSimulation';
import Table from './Table';
import PhilosopherList from './PhilosopherList';
import EventLog from './EventLog';
import Controls from './Controls';

function Banner({ snap, lab }) {
  const starving = snap.phils.filter((p) => p.label === 'STARVING');
  let tone = 'eating';
  let text = `No deadlock · ${snap.totalMeals} ${snap.totalMeals === 1 ? "meal" : "meals"} eaten so far`;
  if (snap.deadlock) {
    tone = 'bad';
    const c = snap.deadlock.cycle.map((i) => `P${i + 1}`);
    text = `DEADLOCK: ${[...c, c[0]].join(' → ')}. Everyone holds a fork and waits for the next one, so nothing can move.`;
  } else if (starving.length) {
    tone = 'bad';
    const p = starving[0];
    text = `P${p.i + 1} has been hungry for ${(p.waitMs / 1000).toFixed(0)}s with ${p.meals} meals, while the others keep eating.`;
  } else if (lab.kind === 'problem') {
    tone = 'waiting';
    text = lab.id === 'naive' ? 'Running… watch each philosopher grab a fork.' : 'Running… watch P1’s hunger timer.';
  }
  return (
    <div role="status" className="rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: `var(--tone-${tone})` }}>
      {text}
    </div>
  );
}

export default function LabView() {
  const { problem: problemId, lab: labId } = useParams();
  const found = findLab(problemId, labId);
  if (!found) return <Navigate to={FIRST_LAB} replace />;
  return <Lab key={`${problemId}/${labId}`} {...found} />;
}

function Lab({ lab }) {
  const { snap, running, speed, setSpeed, toggle, reset } = useSimulation(lab.strategy);

  useEffect(() => {
    const typing = (e) => e.target.closest?.('input, select, textarea');
    const onDown = (e) => {
      if (e.code !== 'Space' || typing(e)) return;
      e.preventDefault();
      if (!e.repeat) toggle();
    };
    // buttons activate on key-up; stop that so Space never clicks the focused button
    const onUp = (e) => {
      if (e.code === 'Space' && !typing(e)) e.preventDefault();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [toggle]);

  if (!snap) return null;
  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6">
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold">{lab.title}</h1>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white" style={{ background: lab.kind === 'problem' ? 'var(--tone-bad)' : 'var(--tone-eating)' }}>
            {lab.kind}
          </span>
          {lab.breaks && <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold">Breaks: {lab.breaks}</span>}
          {lab.uses && <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold">{lab.uses}</span>}
        </div>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-sub">{lab.summary}</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-3">
          <Banner snap={snap} lab={lab} />
          <Controls running={running} toggle={toggle} reset={reset} speed={speed} setSpeed={setSpeed} time={snap.t} />
          <div className="rounded-2xl border border-line bg-surface p-2 sm:p-3">
            <div className="mx-auto" style={{ width: 'min(100%, max(380px, calc(100vh - 350px)))' }}>
              <Table snap={snap} showClean={lab.strategy === 'chandy'} paused={!running} />
            </div>
          </div>
        </section>
        <aside className="min-w-0 space-y-3">
          <PhilosopherList snap={snap} />
          <EventLog log={snap.log} />
        </aside>
      </div>
    </div>
  );
}
