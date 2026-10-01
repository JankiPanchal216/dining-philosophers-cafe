import Hero from '../components/Hero';
import StatusPanel from '../components/StatusPanel';
import ModuleCard from '../components/ModuleCard';
import Methodology from '../components/Methodology';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-grow w-full">
        
        {/* Top Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          <div className="lg:col-span-2">
            <Hero />
          </div>
          <div className="lg:col-span-1">
            <StatusPanel />
          </div>
        </div>

        {/* Modules Section */}
        <div id="modules-section" className="mb-16">
          <div className="mb-8">
            <p className="text-sm font-bold text-theme-primary tracking-widest uppercase mb-2">
              Laboratory Experiments
            </p>
            <h2 className="text-3xl font-bold">
              Explore Primary Concurrency Phenomena
            </h2>
            <p className="text-theme-textMuted mt-2">
              Interactive scenarios based on POSIX & Academic OS Syllabi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Deadlock Module */}
            <ModuleCard 
              moduleNumber="MOD 01"
              badge="● Resource Competition & Circular Wait"
              title="💀 Deadlock"
              description="Understand Coffman's four necessary conditions and explore deadlock prevention through resource ordering and controlled resource acquisition."
              to="/deadlock"
              linkText="Explore Deadlock Lab"
            >
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute text-xl">🔒</div>
                <div className="absolute inset-0 border-2 border-theme-error border-dashed rounded-full animate-[spin_10s_linear_infinite] opacity-50"></div>
                {[1,2,3,4,5].map((i) => {
                  const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                  const x = Math.cos(angle) * 70;
                  const y = Math.sin(angle) * 70;
                  return (
                    <div 
                      key={i} 
                      className="absolute w-8 h-8 bg-theme-surface border border-theme-error rounded-full flex items-center justify-center text-xs font-bold text-theme-error shadow-sm"
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                    >
                      P{i}
                    </div>
                  );
                })}
                <div className="absolute -bottom-8 left-0 right-0 text-center font-mono text-[10px] text-theme-error whitespace-nowrap">
                  Cycles: 1 Found<br/>Coffman Confirmed
                </div>
              </div>
            </ModuleCard>

            {/* Starvation Module */}
            <ModuleCard 
              moduleNumber="MOD 02"
              badge="● Scheduling & Fairness"
              title="⚠️ Starvation"
              description="See how unfair resource allocation can cause indefinite waiting for a philosopher while neighbouring philosophers continue executing."
              to="/starvation"
              linkText="Explore Starvation Lab"
            >
              <div className="w-full font-mono text-xs space-y-2">
                <div className="flex justify-between items-center p-2 bg-theme-surface border border-theme-border rounded">
                  <span className="font-bold">P1</span>
                  <span className="text-theme-success">EATING</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-theme-surface border border-theme-border rounded">
                  <span className="font-bold">P2</span>
                  <span className="text-theme-success">EATING</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <span className="font-bold">P3</span>
                  <span className="text-yellow-700 animate-pulse">WAITING</span>
                </div>
                <div className="text-center text-[10px] text-theme-error mt-4 pt-4 border-t border-theme-border">
                  P3 Starvation Threshold<br/>
                  <span className="font-bold text-sm">92% Critical</span>
                </div>
              </div>
            </ModuleCard>

            {/* Synchronization Module */}
            <ModuleCard 
              moduleNumber="MOD 03"
              badge="● Concurrency Primitives"
              title="🔐 Synchronization"
              description="Explore mutexes, semaphores, critical sections, and wait/signal coordination through state transitions."
              to="/synchronization"
              linkText="Explore Sync Lab"
            >
              <div className="w-full font-mono text-xs flex flex-col items-center">
                <div className="flex justify-between w-full mb-4">
                  <div>P1: Thread Acquire</div>
                  <div className="text-lg">🔑</div>
                </div>
                <div className="flex justify-between w-full mb-6 opacity-50">
                  <div>P2: Blocked</div>
                </div>
                
                <div className="w-full border-2 border-theme-secondary border-dashed p-3 rounded text-center relative mb-6">
                  <div className="font-bold text-theme-secondary mb-1">CRITICAL ZONE</div>
                  <div className="text-[10px] text-theme-textMuted">Atomic mutex lock active</div>
                  <div className="absolute -bottom-2 right-2 bg-theme-bg px-1 text-[10px] font-bold text-theme-secondary">1 OWNER</div>
                </div>
                
                <div className="w-full text-left text-[10px]">
                  <div className="text-theme-primary">Primitive: sem_wait()</div>
                  <div className="text-theme-success font-bold">Barrier Intact</div>
                </div>
              </div>
            </ModuleCard>
          </div>
        </div>

        <Methodology />
        
      </div>
      <Footer />
    </div>
  );
}
