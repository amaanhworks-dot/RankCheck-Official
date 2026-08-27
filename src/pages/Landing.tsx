import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Move, Zap, LayoutDashboard, CreditCard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTest } from '@/context/TestContext';

const tests: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Crosshair,
    title: 'Aim',
    desc: 'Track and flick to targets with pinpoint precision.',
  },
  {
    icon: Move,
    title: 'Movement',
    desc: 'Dodge, strafe, and navigate with fluid WASD control.',
  },
  {
    icon: Zap,
    title: 'Reflex',
    desc: 'React and bind keys faster than the competition.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { setGamertag } = useTest();
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    const trimmed = tag.trim();
    if (!trimmed) {
      setError('Enter a gamer tag to start the gauntlet.');
      return;
    }
    setError('');
    setGamertag(trimmed);
    navigate('/play/aim');
  };

  return (
    <Layout>
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
        {/* Radial purple glow behind logo */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.05) 40%, transparent 70%)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full animate-fade-in-up">
          <h1
            className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-wider text-white"
            style={{
              textShadow:
                '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.4)',
            }}
          >
            RankCheck
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-text-secondary font-body tracking-wide">
            Do your RankCheck
          </p>

          {/* Gamertag input */}
          <div className="mt-10 w-full max-w-md">
            <input
              type="text"
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your gamer tag"
              className="w-full rounded-xl bg-surface border px-5 py-3.5 text-base text-white placeholder:text-text-secondary/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:shadow-primary-glow"
              style={{
                borderColor: error ? '#f59e0b' : undefined,
              }}
            />
            {error && (
              <p className="mt-2 text-sm text-amber-400 text-left">
                {error}
              </p>
            )}
          </div>

          {/* CTA button */}
          <button
            type="button"
            onClick={handleStart}
            className="mt-5 w-full max-w-md rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Start the gauntlet
          </button>

          {/* Navigation links */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors duration-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/flex-card')}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors duration-200"
            >
              <CreditCard className="h-4 w-4" />
              Flex Card
            </button>
          </div>

          {/* Test cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            {tests.map((test) => {
              const Icon = test.icon;
              return (
                <div
                  key={test.title}
                  className="group rounded-2xl bg-surface border border-border p-5 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-primary-glow"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary-glow transition-colors duration-200 group-hover:bg-primary/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-white">
                      {test.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                    {test.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-5 text-center">
        <p className="text-xs sm:text-sm text-text-secondary tracking-wide">
          3 tests. 90 seconds. Know where you stand.
        </p>
      </footer>
    </Layout>
  );
}