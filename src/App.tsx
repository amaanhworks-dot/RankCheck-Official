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
// ⭐ New pages
import About from '@/pages/About';
import HowItWorks from '@/pages/HowItWorks';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

function App() {
  return (
    <TestProvider>
      <BrowserRouter>
        <Routes>
          {/* Core routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/play/aim" element={<AimTest />} />
          <Route path="/play/movement" element={<MovementTest />} />
          <Route path="/play/keybind" element={<KeybindTest />} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flex-card" element={<FlexCardPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* ⭐ New content pages */}
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Legal pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </BrowserRouter>
    </TestProvider>
  );
}

export default App;