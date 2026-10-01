import { useEffect, useRef } from 'react';

export default function EventLog({ events }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="card-surface p-4 max-h-48 flex flex-col">
      <h3 className="font-bold text-xs uppercase tracking-widest text-theme-textMuted mb-2 px-2">
        Simulation Event Log
      </h3>
      
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto font-mono text-xs text-theme-text bg-gray-50 rounded p-2 border border-theme-border/50 custom-scrollbar"
      >
        <div className="space-y-1">
          {events.map((ev, i) => (
            <div key={i} className={`
              ${ev.type === 'error' ? 'text-theme-error font-bold' : ''}
              ${ev.type === 'success' ? 'text-theme-success font-bold' : ''}
              ${ev.type === 'normal' ? 'text-theme-text' : ''}
              ${i === 0 ? 'text-gray-400' : ''}
            `}>
              <span className="opacity-70">[{ev.time}]</span> {ev.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
