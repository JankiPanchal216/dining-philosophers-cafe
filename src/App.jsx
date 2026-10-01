import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DeadlockLab from './pages/DeadlockLab';
import SolutionLab from './pages/SolutionLab';
import StarvationLab from './pages/StarvationLab';
import SynchronizationLab from './pages/SynchronizationLab';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/deadlock" element={<DeadlockLab />} />
            <Route path="/solution" element={<SolutionLab />} />
            <Route path="/starvation" element={<StarvationLab />} />
            <Route path="/synchronization" element={<SynchronizationLab />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
