import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="card-surface p-8 md:p-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-bg border border-theme-border rounded-full text-xs font-semibold text-theme-textMuted mb-6">
        <span>🎓</span>
        <span>University CS 301 · Systems & Concurrency Workbench</span>
      </div>
      
      <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
        <span className="mr-3">🍽️</span> 
        Dining Philosophers Café
      </h2>
      
      <p className="text-xl md:text-2xl text-theme-primary font-medium mb-6">
        Interactive Operating Systems Lab
      </p>
      
      <p className="text-theme-textMuted max-w-2xl leading-relaxed mb-8">
        Explore synchronization problems through live simulations. Observe thread scheduling anomalies, mutex contention, race windows, and algorithmic deadlock resolutions in real time.
      </p>
      
      <div className="flex flex-wrap items-center gap-4">
        <Link 
          to="/deadlock" 
          className="flex items-center gap-2 bg-theme-primary hover:bg-theme-primaryContainer text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
        >
          Launch Deadlock Lab <ArrowRight size={18} />
        </Link>
        <button 
          onClick={() => {
            document.getElementById('modules-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-6 py-3 rounded-lg font-semibold text-theme-text hover:bg-theme-bg border border-transparent hover:border-theme-border transition-colors"
        >
          View All Modules
        </button>
      </div>

      <div className="mt-8 flex items-center gap-3 text-sm font-mono text-theme-textMuted">
        <div className="flex gap-1">
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">P1</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">P2</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">P3</span>
        </div>
        <span>5 Active Threads</span>
      </div>
    </div>
  );
}
