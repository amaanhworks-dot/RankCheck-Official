import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import neonGrid from '@/assets/neon-grid.png';

type TestLayoutProps = {
  step: 1 | 2 | 3;
  children: ReactNode;
  onContinue?: () => void;
};

const TOTAL_STEPS = 3;

export default function TestLayout({
  step,
  children,
  onContinue,
}: TestLayoutProps) {
  const navigate = useNavigate();
  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background text-[#f5f5f7] flex flex-col relative overflow-hidden">
      {/* ⭐ Background Image — neon-grid.png (CLEAR, NO BLUR) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={neonGrid}
          alt="Background"
          className="w-full h-full object-cover"
          style={{
            opacity: 0.2,
            // ⭐ REMOVED filter: 'blur(1px)'
          }}
        />
        {/* Dark overlay — keeps it readable */}
        <div className="absolute inset-0 bg-background/20" />
      </div>

      <Navbar />

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors duration-200"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <span className="font-heading text-sm sm:text-base font-semibold text-white tracking-wide">
            Test {step} of {TOTAL_STEPS}
          </span>

          <div className="w-16" />
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
            }}
          />
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {children}
      </main>

      {/* Bottom bar */}
      <footer className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={onContinue ?? (() => {})}
            className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </footer>
    </div>
  );
}