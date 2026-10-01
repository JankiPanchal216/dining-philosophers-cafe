export default function ThreadMutexMatrix({ philosophers, strategy }) {
  
  const getStatusColor = (state) => {
    switch(state) {
      case 'EATING': return 'text-theme-success';
      case 'WAITING': return 'text-orange-600';
      case 'BLOCKED': return 'text-theme-error';
      default: return 'text-theme-textMuted';
    }
  };

  return (
    <div className="card-surface p-6">
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-bold text-lg">Thread Mutex Matrix</h3>
        <div className="text-xs font-mono font-bold text-theme-textMuted bg-gray-100 px-2 py-1 rounded">
          Priority: F_low &lt; F_high
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-theme-textMuted uppercase bg-gray-50 border-b border-theme-border">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Thread</th>
              <th className="px-4 py-3">Acquisition Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-tr-lg">Held Mutexes</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {philosophers.map((p) => {
              // Resource ordering logic dictates P5 asks for F1 then F5
              let order = `F${p.id} → F${p.id === 5 ? 1 : p.id + 1}`;
              let isSpecial = false;

              if (strategy === 'resource-ordering' && p.id === 5) {
                order = `F1 → F5`;
                isSpecial = true;
              }

              return (
                <tr key={p.id} className="border-b border-theme-border/50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold">P{p.id}</td>
                  <td className="px-4 py-3 text-xs">
                    {order} {isSpecial && <span className="text-theme-primary font-bold">(Inverted)</span>}
                  </td>
                  <td className={`px-4 py-3 font-bold ${getStatusColor(p.state)}`}>
                    {p.state}
                  </td>
                  <td className="px-4 py-3 text-xs text-theme-textMuted">
                    {p.forks.length > 0 
                      ? `F${p.forks.join(', F')}` 
                      : (p.waitsFor ? `Waits F${p.waitsFor}${isSpecial ? '; F5 remains free' : ''}` : 'None')
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
