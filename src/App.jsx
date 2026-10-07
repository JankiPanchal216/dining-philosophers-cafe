import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import LabView from './components/LabView';
import { FIRST_LAB } from './data/catalog';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-full flex-col bg-bg text-ink">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
          <span className="text-lg font-extrabold">🍝 Dining Philosophers</span>
          <ThemeToggle />
        </header>
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <Routes>
              <Route path="/" element={<Navigate to={FIRST_LAB} replace />} />
              <Route path="/:problem/:lab" element={<LabView />} />
              <Route path="*" element={<Navigate to={FIRST_LAB} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
