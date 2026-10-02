import { Lock, Navigation, Shield } from 'lucide-react';

export default function LabHeader({ activeTab, onTabClick }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-theme-border pb-6">
      <div>
        <div className="text-sm font-bold text-theme-primary tracking-widest uppercase mb-2 font-mono">
          LABORATORY EXPERIMENT 05 <span className="ml-4 text-theme-textMuted">pthread_sync_arch_t</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          🔐 Synchronization Primitives Lab
        </h1>
        <p className="text-theme-textMuted text-lg">
          Exploring Mutex Locks, Counting Semaphores, and Critical Section Protection
        </p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg border border-theme-border self-start lg:self-end text-sm font-bold">
        <button 
          onClick={() => onTabClick('mutex')}
          className={`px-4 py-2 flex items-center gap-2 rounded-md transition-all ${
            activeTab === 'mutex' ? 'bg-white shadow-sm text-theme-primary' : 'text-theme-textMuted hover:text-theme-text'
          }`}
        >
          <Lock size={16} /> Mutex
        </button>
        <button 
          onClick={() => onTabClick('semaphore')}
          className={`px-4 py-2 flex items-center gap-2 rounded-md transition-all ${
            activeTab === 'semaphore' ? 'bg-white shadow-sm text-theme-primary' : 'text-theme-textMuted hover:text-theme-text'
          }`}
        >
          <span className="text-base">🚦</span> Counting Semaphore
        </button>
        <button 
          onClick={() => onTabClick('critical-section')}
          className={`px-4 py-2 flex items-center gap-2 rounded-md transition-all ${
            activeTab === 'critical-section' ? 'bg-white shadow-sm text-theme-primary' : 'text-theme-textMuted hover:text-theme-text'
          }`}
        >
          <Shield size={16} /> Critical Section
        </button>
      </div>
    </div>
  );
}
