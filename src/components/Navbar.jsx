import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, RotateCcw, Settings, HelpCircle, Activity, Menu, X, Pause, Moon, Sun } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', shortLabel: 'Dashboard' },
  { to: '/deadlock', label: 'Deadlock Lab', shortLabel: 'Deadlock' },
  { to: '/solution', label: 'Solution Lab', shortLabel: 'Solution' },
  { to: '/starvation', label: 'Starvation Lab', shortLabel: 'Starvation' },
  { to: '/synchronization', label: 'Sync Lab', shortLabel: 'Sync Lab' },
  { to: '/results', label: 'Results / Comparison', shortLabel: 'Results' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cafe_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const { runScenario, pauseSimulation, resetSimulation, isRunning, deadlockSim } = useSimulation();

  const isDeadlockPage = location.pathname === '/deadlock';
  const deadlockPhase = deadlockSim.phase; // 'READY' | 'RUNNING' | 'PAUSED' | 'DEADLOCK'

  // Sync dark mode class and data-theme attribute on html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('cafe_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('cafe_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleRunClick = () => {
    if (isDeadlockPage) {
      deadlockSim.toggleRun();
    } else {
      if (isRunning) {
        pauseSimulation();
      } else {
        runScenario();
      }
    }
  };

  const handleResetClick = () => {
    if (isDeadlockPage) {
      deadlockSim.reset();
    } else {
      resetSimulation();
    }
  };

  // Compute Run button appearance based on actual phase
  const renderRunButtonContent = () => {
    if (isDeadlockPage) {
      switch (deadlockPhase) {
        case 'DEADLOCK':
          return (
            <>
              <RotateCcw size={13} />
              <span>Replay</span>
            </>
          );
        case 'RUNNING':
          return (
            <>
              <Pause size={13} fill="currentColor" />
              <span>Pause</span>
            </>
          );
        case 'PAUSED':
          return (
            <>
              <Play size={13} fill="currentColor" />
              <span>Resume</span>
            </>
          );
        case 'READY':
        default:
          return (
            <>
              <Play size={13} fill="currentColor" />
              <span>Run Scenario</span>
            </>
          );
      }
    }

    if (isRunning) {
      return (
        <>
          <Pause size={13} fill="currentColor" />
          <span>Pause</span>
        </>
      );
    }
    return (
      <>
        <Play size={13} fill="currentColor" />
        <span>Run Scenario</span>
      </>
    );
  };

  const getRunButtonClasses = () => {
    if (isDeadlockPage) {
      if (deadlockPhase === 'DEADLOCK') return 'bg-theme-primary hover:bg-theme-primaryContainer';
      if (deadlockPhase === 'RUNNING') return 'bg-amber-600 hover:bg-amber-700';
      if (deadlockPhase === 'PAUSED') return 'bg-emerald-600 hover:bg-emerald-700';
      return 'bg-theme-primary hover:bg-theme-primaryContainer';
    }
    return isRunning 
      ? 'bg-amber-600 hover:bg-amber-700' 
      : 'bg-theme-primary hover:bg-theme-primaryContainer';
  };

  return (
    <nav className="bg-theme-surface border-b border-theme-border sticky top-0 z-50 px-3 sm:px-6 py-2.5 shadow-xs w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        
        {/* Logo and Branding (Always flex-shrink: 0) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link 
            to="/" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-theme-primaryContainer text-white flex items-center justify-center text-lg sm:text-xl shadow-xs hover:opacity-90 transition-opacity"
            title="Dining Philosophers Café Dashboard"
          >
            🍽️
          </Link>
          <div className="min-w-0">
            <Link to="/">
              <h1 className="text-base sm:text-lg font-bold text-theme-text leading-tight hover:text-theme-primary transition-colors whitespace-nowrap">
                Dining Philosophers Café
              </h1>
            </Link>
            <p className="text-[9px] sm:text-[10px] text-theme-textMuted font-bold tracking-wider truncate whitespace-nowrap">
              CONCURRENCY & SYNCHRONIZATION WORKBENCH
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links (Can scroll horizontally if space is tight below 1280px) */}
        <div 
          className="nav hidden xl:flex items-center gap-1 p-1 rounded-lg border shrink min-w-0 overflow-x-auto no-scrollbar"
          style={{ background: 'var(--nav-bg)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-tab px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                  isActive ? 'active shadow-xs font-bold' : 'hover:opacity-90'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Medium Screen Navigation (Compact labels) */}
        <div 
          className="nav hidden md:flex xl:hidden items-center gap-1 p-1 rounded-lg border shrink min-w-0 overflow-x-auto no-scrollbar"
          style={{ background: 'var(--nav-bg)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-tab px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                  isActive ? 'active shadow-xs font-bold' : 'hover:opacity-90'
                }`}
              >
                {item.shortLabel}
              </Link>
            );
          })}
        </div>

        {/* Right Actions & Controls (Strictly shrink-0 so NEVER gets pushed or cut off) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-theme-textMuted">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 hover:text-theme-text rounded hover:bg-theme-bg transition-colors"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Dark Mode Theme"
            >
              {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            <button className="p-1.5 hover:text-theme-text rounded hover:bg-theme-bg transition-colors" title="Speed & Diagnostics" aria-label="Speed & Diagnostics">
              <Activity size={16} />
            </button>
            <button className="p-1.5 hover:text-theme-text rounded hover:bg-theme-bg transition-colors" title="Documentation & Help" aria-label="Documentation & Help">
              <HelpCircle size={16} />
            </button>
            <button className="p-1.5 hover:text-theme-text rounded hover:bg-theme-bg transition-colors" title="Tuning Options" aria-label="Tuning Options">
              <Settings size={16} />
            </button>
          </div>
          
          <div className="hidden sm:block w-px h-5 bg-theme-border/80 mx-0.5"></div>
          
          <button 
            id="nav-reset-btn" 
            onClick={handleResetClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border border-theme-border text-theme-text hover:bg-theme-bg transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Reset simulation to initial READY state"
          >
            <RotateCcw size={13} />
            <span className="hidden xs:inline">Reset</span>
          </button>

          <button 
            id="nav-run-btn" 
            onClick={handleRunClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white transition-all shadow-xs whitespace-nowrap shrink-0 ${getRunButtonClasses()}`}
            title={
              isDeadlockPage
                ? deadlockPhase === 'RUNNING'
                  ? 'Pause simulation'
                  : deadlockPhase === 'PAUSED'
                  ? 'Resume simulation'
                  : deadlockPhase === 'DEADLOCK'
                  ? 'Replay simulation from start'
                  : 'Run scenario simulation'
                : isRunning
                ? 'Pause simulation'
                : 'Run scenario simulation'
            }
          >
            {renderRunButtonContent()}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-1.5 rounded-md text-theme-textMuted hover:text-theme-text hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden mt-2 pt-2 border-t flex flex-col gap-1 p-2 rounded-lg"
          style={{ background: 'var(--nav-bg)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-tab px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  isActive ? 'active font-bold' : 'hover:opacity-90'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-theme-textMuted hover:text-theme-text hover:bg-theme-bg"
          >
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      )}
    </nav>
  );
}
