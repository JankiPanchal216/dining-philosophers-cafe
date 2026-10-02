import { Check } from 'lucide-react';

export default function ThreadMutexMatrix({ philosophers = [], strategy = 'resource-ordering' }) {
  
  const getStatusBadge = (state) => {
    switch(state) {
      case 'EATING': 
        return <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">EATING</span>;
      case 'WAITING': 
        return <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold text-xs">WAITING</span>;
      case 'HUNGRY':
        return <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs">HUNGRY</span>;
      case 'DEADLOCKED': 
      case 'BLOCKED': 
        return <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-xs">DEADLOCKED</span>;
      default: 
        return <span className="px-2 py-0.5 rounded border font-medium text-xs" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}>THINKING</span>;
    }
  };

  // Standard topology neighboring forks for each philosopher
  const neighborForks = {
    1: [1, 5],
    2: [2, 1],
    3: [3, 2],
    4: [4, 3],
    5: [5, 4],
  };

  return (
    <div className="card-surface p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Thread Mutex Matrix</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Resource acquisition protocol per philosopher thread</p>
        </div>
        <div 
          className="text-[11px] font-mono font-bold px-2.5 py-1 rounded border self-start sm:self-auto shrink-0"
          style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          Order: {strategy === 'resource-ordering' ? 'Havender Total Order (Flow < Fhigh)' : 'Greedy Left-First'}
        </div>
      </div>
      
      {/* Contained horizontal scrolling only if needed, never page-level */}
      <div className="overflow-x-auto no-scrollbar w-full">
        <table className="mutex-table w-full text-sm text-left">
          <thead 
            className="text-[11px] uppercase tracking-wider border-b"
            style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <tr>
              <th className="rounded-tl-lg" style={{ width: '18%' }}>Thread</th>
              <th style={{ width: '38%' }}>Acquisition Order</th>
              <th style={{ width: '22%' }}>Status</th>
              <th className="rounded-tr-lg" style={{ width: '22%' }}>Held Mutex</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {philosophers.map((p) => {
              const neighbors = neighborForks[p.id] || [p.id, p.id === 1 ? 5 : p.id - 1];
              
              let order = '';
              let isOrdered = false;

              if (strategy === 'resource-ordering') {
                // Havender: lower fork index always requested first
                const [fA, fB] = neighbors;
                const lower = Math.min(fA, fB);
                const higher = Math.max(fA, fB);
                order = `F${lower} → F${higher}`;
                isOrdered = true;
              } else {
                // Naive greedy: left fork (p.id) then right fork
                const left = p.id;
                const right = p.id === 1 ? 5 : p.id - 1;
                order = `F${left} → F${right}`;
              }

              return (
                <tr 
                  key={p.id} 
                  className="border-b transition-colors hover:opacity-90"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <td className="font-bold" style={{ color: 'var(--text-primary)' }}>P{p.id}</td>
                  <td>
                    <div className="order-cell">
                      <span className="font-semibold" style={{ color: 'var(--accent)' }}>{order}</span>
                      {isOrdered && (p.id === 2 || p.id === 5) && (
                        <span 
                          className="inline-flex items-center text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-0.5 rounded border border-emerald-200 dark:border-emerald-800"
                          title="Resource order satisfied"
                          aria-label="Resource order satisfied"
                        >
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="font-bold">
                    {getStatusBadge(p.state)}
                  </td>
                  <td>
                    {p.forks && p.forks.length > 0 
                      ? <span className="text-emerald-700 dark:text-emerald-300 font-bold whitespace-nowrap">F{p.forks.join(', F')}</span>
                      : (p.waitsFor ? <span className="text-sky-700 dark:text-sky-300 whitespace-nowrap">Waits F{p.waitsFor}</span> : <span style={{ color: 'var(--text-secondary)' }}>None</span>)
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
