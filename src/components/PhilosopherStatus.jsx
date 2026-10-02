/**
 * PhilosopherStatus - Reusable component mapping semantic states to appropriate colors
 * 
 * Thinking: Neutral/gray (P1 • THINKING)
 * Hungry: Amber/yellow (P2 • HUNGRY)
 * Holding: Blue (P3 • HOLDING)
 * Waiting: Orange (P4 • WAITING)
 * Deadlocked: Red (P5 • DEADLOCKED)
 */

export default function PhilosopherStatus({ 
  id, 
  name, 
  state = 'THINKING', 
  size = 'md', // 'sm' | 'md' | 'lg'
  showNameOnly = false,
  showDotOnly = false,
  className = ''
}) {
  const philName = name || `P${id}`;
  const normalizedState = (state || 'THINKING').toUpperCase();

  // Style configurations for each semantic state
  const stateStyles = {
    THINKING: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-700',
      dot: 'bg-gray-400',
      badgeBg: 'bg-gray-200/80 text-gray-700',
      label: 'THINKING',
    },
    HUNGRY: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-800',
      dot: 'bg-amber-500 animate-pulse',
      badgeBg: 'bg-amber-100 text-amber-900 border border-amber-300',
      label: 'HUNGRY',
    },
    HOLDING: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
      badgeBg: 'bg-blue-100 text-blue-900 border border-blue-300',
      label: 'HOLDING',
    },
    EATING: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      label: 'EATING',
    },
    WAITING: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-800',
      dot: 'bg-orange-500 animate-pulse',
      badgeBg: 'bg-orange-100 text-orange-900 border border-orange-300',
      label: 'WAITING',
    },
    DEADLOCKED: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-800',
      dot: 'bg-red-600 animate-ping',
      badgeBg: 'bg-red-100 text-red-900 border border-red-300',
      label: 'DEADLOCKED',
    },
  };

  const currentStyle = stateStyles[normalizedState] || stateStyles.THINKING;

  if (showNameOnly) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs border ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} ${className}`}>
        {philName}
      </span>
    );
  }

  if (showDotOnly) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs" title={`${philName} • ${currentStyle.label}`}>
        <span className={`w-2 h-2 rounded-full ${currentStyle.dot}`}></span>
        <span className="font-bold">{philName}</span>
      </span>
    );
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <div 
      className={`inline-flex items-center rounded-md font-mono font-medium border transition-colors shadow-xs ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} ${sizeClasses} ${className}`}
      title={`${philName} is currently ${currentStyle.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`}></span>
      <span className="font-bold">{philName}</span>
      <span className="opacity-50">•</span>
      <span className="font-semibold text-[10px] tracking-wide uppercase">{currentStyle.label}</span>
    </div>
  );
}
