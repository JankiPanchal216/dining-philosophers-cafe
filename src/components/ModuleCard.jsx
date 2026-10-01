import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ModuleCard({ moduleNumber, badge, title, description, children, to, linkText }) {
  return (
    <div className="card-surface p-6 flex flex-col hover:border-theme-primary/30 transition-colors">
      <div className="inline-flex px-3 py-1 rounded-full bg-theme-bg border border-theme-border text-xs font-semibold mb-6 self-start text-theme-textMuted">
        {badge}
      </div>
      
      <div className="text-xs font-bold text-theme-primary tracking-widest mb-2">
        {moduleNumber}
      </div>
      
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      
      <p className="text-theme-textMuted text-sm mb-8 flex-grow">
        {description}
      </p>

      <div className="bg-theme-bg rounded-lg border border-theme-border p-6 mb-8 flex items-center justify-center min-h-[200px]">
        {children}
      </div>

      <Link 
        to={to} 
        className="mt-auto flex items-center justify-between p-3 rounded-lg border border-theme-border hover:bg-theme-primary hover:text-white transition-colors group font-semibold"
      >
        {linkText}
        <ArrowRight size={18} className="text-theme-textMuted group-hover:text-white group-hover:translate-x-1 transition-all" />
      </Link>
    </div>
  );
}
