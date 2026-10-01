export default function Footer() {
  return (
    <footer className="bg-white border-t border-theme-border mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row justify-between gap-8">
        
        <div className="max-w-sm">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            🏛️ Dining Philosophers Café
          </h3>
          <p className="text-sm text-theme-textMuted">
            © Systems Architecture Lab —<br/>
            Classical Concurrency & Synchronization Workbench
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-theme-secondary font-medium">
          <a href="#" className="hover:underline">Petri Net Reference</a>
          <a href="#" className="hover:underline">POSIX Threads Manual</a>
          <a href="#" className="hover:underline">Course Syllabus</a>
          <a href="#" className="hover:underline">Export Telemetry</a>
        </div>
        
      </div>
    </footer>
  );
}
