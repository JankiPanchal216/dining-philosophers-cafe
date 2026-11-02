import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('cafe_theme', theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);
  const dark = theme === 'dark';
  return (
    <button onClick={() => setTheme(dark ? 'light' : 'dark')} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold active:scale-95 transition-transform hover:bg-muted" aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
      <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
