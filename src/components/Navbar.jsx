import { Link, useLocation } from 'react-router-dom';
import { Play, RotateCcw, Settings, HelpCircle, Activity } from 'lucide-react';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border-b-2 ${
        isActive 
          ? 'bg-theme-bg text-theme-primary border-theme-primary' 
          : 'border-transparent text-theme-textMuted hover:text-theme-text hover:bg-theme-bg'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  return (
    <nav className="bg-theme-surface border-b border-theme-border sticky top-0 z-50 px-4 md:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Logo and Branding */}
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 rounded bg-theme-primaryContainer text-white flex items-center justify-center text-xl shadow-inner hover:opacity-90 transition-opacity">
            🍽️
          </Link>
          <div>
            <Link to="/">
              <h1 className="text-lg font-bold text-theme-text leading-tight hover:text-theme-primary transition-colors">
                Dining Philosophers Café
              </h1>
            </Link>
            <p className="text-xs text-theme-textMuted font-mono">
              v2.4 Kernel Bench
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/deadlock">Deadlock Lab</NavLink>
          <NavLink to="/solution">Solution Lab</NavLink>
          <NavLink to="/starvation">Starvation Lab</NavLink>
          <NavLink to="/synchronization">Synchronization Lab</NavLink>
          <NavLink to="/results">Results / Comparison</NavLink>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 lg:border-l lg:border-theme-border lg:pl-4">
          <button className="text-theme-textMuted hover:text-theme-text transition-colors" title="Speed">
            <Activity size={18} />
          </button>
          <button className="text-theme-textMuted hover:text-theme-text transition-colors" title="Help">
            <HelpCircle size={18} />
          </button>
          <button className="text-theme-textMuted hover:text-theme-text transition-colors" title="Tune">
            <Settings size={18} />
          </button>
          
          <div className="hidden lg:block w-px h-6 bg-theme-border mx-1"></div>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-theme-border text-theme-text hover:bg-theme-bg transition-colors">
            <RotateCcw size={14} />
            Reset
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium bg-theme-primary text-white hover:bg-theme-primaryContainer transition-colors shadow-sm">
            <Play size={14} fill="currentColor" />
            Run Scenario
          </button>
        </div>
      </div>
    </nav>
  );
}
