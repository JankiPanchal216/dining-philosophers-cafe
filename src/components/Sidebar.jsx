import { NavLink } from 'react-router-dom';
import { AlertTriangle, Check } from 'lucide-react';
import { CATALOG } from '../data/catalog';

export default function Sidebar() {
  return (
    <nav aria-label="Labs" className="flex gap-6 overflow-x-auto border-b border-line bg-surface p-3 lg:block lg:w-72 lg:shrink-0 lg:space-y-6 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">
      {CATALOG.map((problem) => (
        <div key={problem.id} className="shrink-0">
          <h2 className="mb-1 px-2 text-xs font-bold uppercase tracking-widest text-sub">{problem.title}</h2>
          <ul className="flex gap-1 lg:block lg:space-y-1">
            {problem.labs.map((lab) => (
              <li key={lab.id}>
                <NavLink to={`/${problem.id}/${lab.id}`} className={({ isActive }) => `flex items-start gap-2 rounded-lg border-l-4 px-2 py-2 ${isActive ? 'border-accent bg-muted' : 'border-transparent hover:bg-muted'}`}>
                  <span className={`mt-0.5 shrink-0 ${lab.kind === 'problem' ? 'text-tone-bad' : 'text-tone-eating'}`}>{lab.kind === 'problem' ? <AlertTriangle size={16} /> : <Check size={16} />}</span>
                  <span className="whitespace-nowrap lg:whitespace-normal">
                    <span className="block text-sm font-semibold leading-tight">{lab.title}</span>
                    <span className="hidden text-xs text-sub lg:block">{lab.short}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
