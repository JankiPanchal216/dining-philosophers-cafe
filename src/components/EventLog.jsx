import { useEffect, useRef } from 'react';

export default function EventLog({ events = [] }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="card-surface p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1 pb-1 border-b border-theme-border/40">
        <h3 className="font-bold text-xs uppercase tracking-widest text-theme-textMuted font-mono">
          EVENT LOG
        </h3>
        <span className="text-[10px] font-mono text-theme-textMuted">
          {events.length} records
        </span>
      </div>
      
      <div 
        ref={scrollRef}
        className="max-h-44 overflow-y-auto font-mono text-xs bg-[#1d1b19] text-gray-200 rounded-lg p-3 border border-gray-700/80 custom-scrollbar shadow-inner"
      >
        <div className="space-y-1.5 leading-relaxed">
          {events.length === 0 ? (
            <div className="text-gray-400 italic">No events logged yet.</div>
          ) : (
            events.map((ev, i) => {
              const isError = ev.type === 'error';
              const isSuccess = ev.type === 'success';

              return (
                <div 
                  key={ev.id || i} 
                  className={`flex items-start gap-2 ${
                    isError 
                      ? 'text-red-400 font-semibold bg-red-950/40 px-1 py-0.5 rounded' 
                      : isSuccess 
                      ? 'text-emerald-400 font-medium' 
                      : 'text-gray-200'
                  }`}
                >
                  <span className="text-gray-400 select-none shrink-0 font-medium">
                    {ev.time ? `[${ev.time}]` : ''}
                  </span>
                  <span className="break-words">
                    {ev.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
