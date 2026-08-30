import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TestProvider } from '@/context/TestContext';
import Landing from '@/pages/Landing';
import AimTest from '@/pages/AimTest';
import MovementTest from '@/pages/MovementTest';
import KeybindTest from '@/pages/KeybindTest';
import Results from '@/pages/Results';
import Dashboard from '@/pages/Dashboard';
import FlexCardPage from '@/pages/FlexCardPage';
import Leaderboard from '@/pages/leaderboard';

function App() {
  return (
    <TestProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/play/aim" element={<AimTest />} />
          <Route path="/play/movement" element={<MovementTest />} />
          <Route path="/play/keybind" element={<KeybindTest />} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flex-card" element={<FlexCardPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </BrowserRouter>
    </TestProvider>
  );
}

export default App;