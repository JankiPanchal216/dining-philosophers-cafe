export default function Methodology() {
  const steps = [
    { num: '01', title: 'Select a Problem', desc: 'Choose from classic concurrency hazards: Deadlock, Starvation, or Race Conditions.' },
    { num: '02', title: 'Run Scenario', desc: 'Launch the interactive dining table with live process states.' },
    { num: '03', title: 'Understand What Happened', desc: 'Inspect dependency graphs, resource states, and contention logs.' },
    { num: '04', title: 'Apply a Solution', desc: 'Test proven synchronization and deadlock prevention strategies.' },
  ];

  return (
    <div className="my-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold text-theme-primary tracking-widest uppercase mb-2">
          Laboratory Methodology
        </p>
        <h2 className="text-3xl font-bold">
          How the Interactive Workbench Operates
        </h2>
        <p className="text-theme-textMuted mt-4 max-w-2xl mx-auto">
          A 4-step workflow for understanding classical Dining Philosophers algorithms and concurrency problems.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div key={step.num} className="card-surface p-6 relative overflow-hidden group hover:border-theme-primary transition-colors">
            <div className="text-6xl font-bold text-theme-border opacity-20 absolute -top-4 -right-2 font-mono group-hover:text-theme-primary/10 transition-colors">
              {step.num}
            </div>
            <div className="text-xl font-bold font-mono text-theme-primary mb-4">
              {step.num}
            </div>
            <h3 className="font-bold text-lg mb-2">{step.title}</h3>
            <p className="text-theme-textMuted text-sm">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
