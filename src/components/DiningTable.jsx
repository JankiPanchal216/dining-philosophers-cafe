import { useMemo } from 'react';

const PHILOSOPHER_AVATARS = {
  1: { emoji: '🧓', role: 'Scholar' },
  2: { emoji: '👨‍🍳', role: 'Chef' },
  3: { emoji: '👩‍🔬', role: 'Scientist' },
  4: { emoji: '🧑‍🏫', role: 'Teacher' },
  5: { emoji: '🧑‍🍳', role: 'Baker' },
};

const STATUS_ICONS = {
  THINKING: '💭',
  HUNGRY: '🍽️',
  HOLDING: '🔒',
  WAITING: '⏳',
  DEADLOCKED: '⚠️',
};

export default function DiningTable({ 
  philosophers = [], 
  forks = [], 
  step = 0,
  phase = 'READY',
  cycle = [],
  hoveredDep = null, // e.g. { from: 1, to: 5 }
}) {
  const philosopherRadius = 145;
  const forkRadius = 85;

  // Geometry: 5 items evenly spaced around 360 degrees
  // Index 0: P1 at top (-PI/2)
  // Index 1: P2 at top-right
  // Index 2: P3 at bottom-right
  // Index 3: P4 at bottom-left
  // Index 4: P5 at top-left
  const positions = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => {
      const pAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      // Forks are located exactly between Pi and Pi+1
      const fAngle = pAngle + Math.PI / 5;
      return {
        p: { 
          x: Math.cos(pAngle) * philosopherRadius, 
          y: Math.sin(pAngle) * philosopherRadius 
        },
        f: { 
          x: Math.cos(fAngle) * forkRadius, 
          y: Math.sin(fAngle) * forkRadius 
        },
        pAngle,
        fAngle,
      };
    });
  }, [philosopherRadius, forkRadius]);

  const getPVisualClass = (status, isHighlighted) => {
    let base = 'transition-all duration-300 ';
    if (isHighlighted) {
      base += 'ring-4 ring-red-500 scale-105 ';
    }
    switch (status) {
      case 'HUNGRY':
        return base + 'border-amber-400 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200';
      case 'HOLDING':
        return base + 'border-blue-500 bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200';
      case 'WAITING':
        return base + 'border-orange-500 bg-orange-50 dark:bg-orange-950/80 text-orange-900 dark:text-orange-200';
      case 'DEADLOCKED':
        return base + 'border-red-600 bg-red-50 dark:bg-red-950/80 text-red-900 dark:text-red-200 ring-2 ring-red-400';
      case 'THINKING':
      default:
        return base + 'border-gray-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-gray-700 dark:text-stone-300';
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'HUNGRY':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700';
      case 'HOLDING':
        return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700';
      case 'WAITING':
        return 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-700';
      case 'DEADLOCKED':
        return 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-700 font-bold';
      case 'THINKING':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600';
    }
  };

  const getForkVisualClass = (fork, isHighlighted) => {
    let base = 'transition-all duration-300 ';
    if (isHighlighted) {
      base += 'ring-4 ring-amber-400 scale-110 ';
    }
    if (!fork || fork.holder === null) {
      return base + 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-500';
    }
    const holderPhil = philosophers.find(p => p.id === fork.holder);
    const status = holderPhil ? holderPhil.status : 'HOLDING';
    switch (status) {
      case 'DEADLOCKED':
        return base + 'border-red-500 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold shadow-xs';
      case 'WAITING':
        return base + 'border-orange-500 bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold shadow-xs';
      case 'HOLDING':
        return base + 'border-blue-500 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold shadow-xs';
      default:
        return base + 'border-amber-500 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold shadow-xs';
    }
  };

  const getForkLineColor = (status) => {
    switch (status) {
      case 'DEADLOCKED':
        return '#dc2626'; // red
      case 'WAITING':
        return '#ea580c'; // orange
      case 'HOLDING':
        return '#2563eb'; // blue
      default:
        return '#f59e0b'; // amber
    }
  };

  // Center table status content derived from state and phase
  const getTableCenterInfo = () => {
    if (phase === 'DEADLOCK' || step === 10) {
      return { 
        icon: '🔒', 
        statusText: 'DEADLOCK', 
        subText: 'Step 10 / 10', 
        colorClass: 'text-red-500 dark:text-red-400 font-bold',
        glowClass: 'shadow-[0_0_35px_rgba(239,68,68,0.4)] border-red-500/80 animate-deadlock-shake'
      };
    }
    if (phase === 'PAUSED') {
      return { 
        icon: '⏸️', 
        statusText: 'PAUSED', 
        subText: `Step ${step} / 10`, 
        colorClass: 'text-amber-500 dark:text-amber-400 font-bold',
        glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/50'
      };
    }
    if (step === 9) {
      return { 
        icon: '🔄', 
        statusText: 'CYCLE DETECTED', 
        subText: 'Step 9 / 10', 
        colorClass: 'text-red-500 dark:text-red-400 font-bold',
        glowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.3)] border-red-500/60'
      };
    }
    if (step === 7 || step === 8) {
      return { 
        icon: '🔒', 
        statusText: 'CONTENTION', 
        subText: `Step ${step} / 10`, 
        colorClass: 'text-orange-500 dark:text-orange-400 font-bold',
        glowClass: 'shadow-[0_0_20px_rgba(234,88,12,0.2)] border-orange-500/50'
      };
    }
    if (step >= 2 && step <= 6) {
      return { 
        icon: '⏳', 
        statusText: 'RUNNING', 
        subText: `Step ${step} / 10`, 
        colorClass: 'text-blue-500 dark:text-blue-400 font-bold',
        glowClass: 'shadow-[0_0_20px_rgba(59,130,246,0.2)] border-blue-500/50'
      };
    }
    if (step === 1) {
      return { 
        icon: '🍽️', 
        statusText: 'RUNNING', 
        subText: 'Step 1 / 10', 
        colorClass: 'text-amber-500 dark:text-amber-400 font-bold',
        glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/50'
      };
    }
    return { 
      icon: '🍽️', 
      statusText: 'READY', 
      subText: 'Step 0 / 10', 
      colorClass: 'text-stone-400 dark:text-stone-500',
      glowClass: 'border-slate-700 bg-slate-800 dark:bg-stone-900 shadow-[0_0_30px_rgba(0,0,0,0.35)]'
    };
  };

  const tableCenterInfo = getTableCenterInfo();

  // Generate curved paths from philosopher to held forks (Ownership arcs)
  const heldPaths = [];
  philosophers.forEach((p, pIndex) => {
    const pPos = positions[pIndex]?.p;
    if (pPos && p.held && p.held.length > 0) {
      p.held.forEach((forkId) => {
        const fIndex = forkId - 1;
        const fPos = positions[fIndex]?.f;
        if (fPos) {
          // Quadratic bezier control point pulled toward center table
          const cx = (pPos.x + fPos.x) * 0.45;
          const cy = (pPos.y + fPos.y) * 0.45;
          const d = `M ${pPos.x} ${pPos.y} Q ${cx} ${cy} ${fPos.x} ${fPos.y}`;
          heldPaths.push({
            key: `held-path-${p.id}-${forkId}`,
            d,
            color: getForkLineColor(p.status),
          });
        }
      });
    }
  });

  // Generate curved dependency paths between waiting philosophers (Pi -> Pj where Pj holds fork Pi needs)
  // Active at steps 7, 8, 9, 10
  // Topology: P1->P5, P5->P4, P4->P3, P3->P2, P2->P1
  const dependencyArcs = useMemo(() => {
    if (step < 7) return [];

    const deps = [
      { from: 1, to: 5, fromIdx: 0, toIdx: 4 },
      { from: 5, to: 4, fromIdx: 4, toIdx: 3 },
      { from: 4, to: 3, fromIdx: 3, toIdx: 2 },
      { from: 3, to: 2, fromIdx: 2, toIdx: 1 },
      { from: 2, to: 1, fromIdx: 1, toIdx: 0 },
    ];

    return deps.map((dep) => {
      const p1 = positions[dep.fromIdx]?.p;
      const p2 = positions[dep.toIdx]?.p;
      if (!p1 || !p2) return null;

      // Curve bowing inward toward the table
      const cx = (p1.x + p2.x) * 0.48;
      const cy = (p1.y + p2.y) * 0.48;
      const d = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
      
      const isHovered = hoveredDep && hoveredDep.from === dep.from && hoveredDep.to === dep.to;

      return {
        key: `dep-arc-${dep.from}-${dep.to}`,
        from: dep.from,
        to: dep.to,
        d,
        isHovered,
      };
    }).filter(Boolean);
  }, [step, positions, hoveredDep]);

  return (
    <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center select-none overflow-visible">
      
      {/* LAYER 1: Background Decorative Table Ring */}
      <div className="absolute w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] rounded-full border border-stone-200/80 dark:border-stone-800/80 pointer-events-none z-0"></div>

      {/* LAYER 2: Central Shared Table Plate */}
      <div 
        className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 bg-slate-800 dark:bg-stone-900 flex flex-col items-center justify-center z-10 transition-all duration-300 ${tableCenterInfo.glowClass}`}
      >
        <span className="text-xl sm:text-2xl mb-1 select-none" role="img" aria-label={tableCenterInfo.statusText}>
          {tableCenterInfo.icon}
        </span>
        <span className={`text-[11px] sm:text-xs font-mono tracking-wider ${tableCenterInfo.colorClass}`}>
          {tableCenterInfo.statusText}
        </span>
        <span className="text-[10px] font-mono text-stone-400 mt-0.5">
          {tableCenterInfo.subText}
        </span>
      </div>

      {/* LAYER 3: SVG Connection & Dependency Paths */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" 
        viewBox="-210 -210 420 420"
      >
        <defs>
          {/* Arrowhead marker for normal dependency arrows */}
          <marker 
            id="dep-arrow" 
            viewBox="0 0 10 10" 
            refX="7" 
            refY="5" 
            markerWidth="5" 
            markerHeight="5" 
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ea580c" />
          </marker>
          {/* Arrowhead marker for detected cycle arrows */}
          <marker 
            id="cycle-arrow" 
            viewBox="0 0 10 10" 
            refX="7" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#dc2626" />
          </marker>
          {/* Glow filter for highlighted cycle */}
          <filter id="cycle-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* 3a. Curved Paths from Philosophers to Held Forks (Ownership Paths) */}
        {heldPaths.map((hp) => (
          <path
            key={hp.key}
            d={hp.d}
            fill="none"
            stroke={hp.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        ))}

        {/* 3b. Curved Dependency Arcs with Small Arrowheads (Steps 7+) */}
        {dependencyArcs.map((arc) => {
          const isCycleActive = step >= 9;
          const strokeColor = arc.isHovered 
            ? '#ef4444' 
            : isCycleActive 
            ? '#dc2626' 
            : '#ea580c';
          
          const strokeWidth = arc.isHovered ? '3.5' : isCycleActive ? '2.5' : '1.8';
          const markerUrl = isCycleActive ? 'url(#cycle-arrow)' : 'url(#dep-arrow)';

          return (
            <path
              key={arc.key}
              d={arc.d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={isCycleActive ? '6 4' : 'none'}
              markerEnd={markerUrl}
              filter={isCycleActive ? 'url(#cycle-glow)' : 'none'}
              className={`transition-all duration-300 ${isCycleActive ? 'animate-cycle-march' : ''}`}
            />
          );
        })}
      </svg>

      {/* LAYER 4: Forks (Placed between philosophers around outer table edge) */}
      {positions.map((pos, i) => {
        const forkId = i + 1;
        const f = forks[i] || { id: forkId, holder: null };
        const isHeld = f.holder !== null;
        const isHovered = hoveredDep && hoveredDep.fork === forkId;

        return (
          <div 
            key={`fork-node-${forkId}`}
            className={`absolute w-8 h-8 sm:w-9 sm:h-9 -ml-4 sm:-ml-4.5 -mt-4 sm:-mt-4.5 rounded-full border-2 flex flex-col items-center justify-center font-mono font-bold shadow-xs z-30 ${getForkVisualClass(f, isHovered)}`}
            style={{ 
              left: `calc(50% + ${pos.f.x}px)`, 
              top: `calc(50% + ${pos.f.y}px)` 
            }}
            title={`Fork #${forkId}${isHeld ? ` (Held by P${f.holder})` : ' (Available)'}`}
          >
            {/* Cutlery Fork Icon */}
            <span className="text-xs select-none leading-none" role="img" aria-label="Fork">
              🍴
            </span>
            <span className="text-[7.5px] tracking-tighter opacity-90 leading-none mt-0.5">
              {isHeld ? `P${f.holder}` : `F${forkId}`}
            </span>
          </div>
        );
      })}

      {/* LAYER 5 & 6: Subtle Plates, Philosopher Nodes & Directly Attached Status Badges */}
      {positions.map((pos, i) => {
        const philId = i + 1;
        const p = philosophers[i] || { id: philId, status: 'THINKING', held: [] };
        const avatar = PHILOSOPHER_AVATARS[philId] || { emoji: '🧓', role: 'Philosopher' };
        const isHovered = hoveredDep && (hoveredDep.from === philId || hoveredDep.to === philId);

        return (
          <div 
            key={`phil-composite-${philId}`}
            className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `calc(50% + ${pos.p.x}px)`, 
              top: `calc(50% + ${pos.p.y}px)` 
            }}
          >
            {/* 5a. Subtle Dining Porcelain Charger Plate underneath node */}
            <div 
              className="absolute inset-0 -m-2 sm:-m-2.5 rounded-full bg-stone-100/90 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 shadow-xs pointer-events-none z-0"
              title={`${avatar.role} plate`}
            >
              <div className="absolute inset-1 rounded-full border border-dashed border-stone-200 dark:border-stone-700/60"></div>
            </div>

            {/* 5b. Philosopher Status Badge - Directly Attached Atop Node (Physically moves with node) */}
            <div className="absolute -top-6.5 sm:-top-7 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
              <div 
                className={`px-1.5 sm:px-2 py-0.5 rounded-md border text-[8.5px] sm:text-[9.5px] font-mono font-semibold tracking-tight whitespace-nowrap shadow-xs flex items-center gap-1 ${getBadgeStyle(p.status)}`}
              >
                <span>{STATUS_ICONS[p.status] || '💭'}</span>
                <span>{p.status}</span>
              </div>
            </div>

            {/* 5c. Philosopher Solid Circle Node */}
            <div 
              className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex flex-col items-center justify-center font-bold shadow-md cursor-default z-10 ${getPVisualClass(p.status, isHovered)}`}
              title={`P${philId} (${avatar.role}) • Status: ${p.status}`}
            >
              <span className="text-base sm:text-lg select-none leading-none" role="img" aria-label={avatar.role}>
                {avatar.emoji}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-tight leading-none mt-0.5">
                P{philId}
              </span>
            </div>
          </div>
        );
      })}
      
    </div>
  );
}
