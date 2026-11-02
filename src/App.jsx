import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import LabView from './components/LabView';
import { FIRST_LAB } from './data/catalog';

function AndroidBackButtonHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let listener;

    import('@capacitor/app')
      .then(({ App: CapApp }) => {
        CapApp.addListener('backButton', () => {
          if (location.pathname !== FIRST_LAB && location.pathname !== '/') {
            navigate(-1);
          } else {
            CapApp.exitApp();
          }
        }).then((handle) => {
          listener = handle;
        });
      })
      .catch(() => {
        // Fallback in web browser where Capacitor App plugin is not active
      });

    return () => {
      listener?.remove?.();
    };
  }, [location.pathname, navigate]);

  return null;
}

function NativeAppLifecycle() {
  useEffect(() => {
    // Hide splash screen smoothly on mount
    import('@capacitor/splash-screen')
      .then(({ SplashScreen }) => {
        SplashScreen.hide();
      })
      .catch(() => {});

    // Sync status bar with theme
    const updateStatusBar = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      import('@capacitor/status-bar')
        .then(({ StatusBar, Style }) => {
          StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
          StatusBar.setBackgroundColor({ color: isDark ? '#14100e' : '#faf6f2' }).catch(() => {});
        })
        .catch(() => {});
    };

    updateStatusBar();
    const observer = new MutationObserver(updateStatusBar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <AndroidBackButtonHandler />
      <NativeAppLifecycle />
      <div className="flex min-h-screen min-h-[100dvh] flex-col bg-bg text-ink">
        <header className="pt-safe pl-safe pr-safe flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
          <span className="text-lg font-extrabold tracking-tight">🍝 Dining Philosophers</span>
          <ThemeToggle />
        </header>
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-safe">
            <Routes>
              <Route path="/" element={<Navigate to={FIRST_LAB} replace />} />
              <Route path="/:problem/:lab" element={<LabView />} />
              <Route path="*" element={<Navigate to={FIRST_LAB} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}

