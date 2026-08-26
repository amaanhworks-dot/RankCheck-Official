import { useNavigate } from 'react-router-dom';
import { Crosshair, Move, Zap, RotateCcw, Chrome as Home, Trophy, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTest } from '@/context/TestContext';

type TestResult = {
  icon: typeof Crosshair;
  label: string;
  score: number;
  unit: string;
};

function rankFromScore(total: number): { label: string; color: string; glow: string } {
  if (total >= 270) return { label: 'Radiant', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' };
  if (total >= 220) return { label: 'Immortal', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)' };
  if (total >= 170) return { label: 'Diamond', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)' };
  if (total >= 120) return { label: 'Platinum', color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)' };
  if (total >= 70) return { label: 'Gold', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' };
  return { label: 'Bronze', color: '#d97706', glow: 'rgba(217, 119, 6, 0.6)' };
}

const DUMMY_SCORES = { aim: 92, movement: 78, reflex: 85 };

export default function Results() {
  const navigate = useNavigate();
  const { gamertag } = useTest();

  const results: TestResult[] = [
    { icon: Crosshair, label: 'Aim', score: DUMMY_SCORES.aim, unit: 'pts' },
    { icon: Move, label: 'Movement', score: DUMMY_SCORES.movement, unit: 'pts' },
    { icon: Zap, label: 'Reflex', score: DUMMY_SCORES.reflex, unit: 'pts' },
  ];

  const total = results.reduce((sum, r) => sum + r.score, 0);
  const rank = rankFromScore(total);

  return (
    <Layout>
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Rank glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${rank.glow} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full animate-fade-in-up">
          {/* Header */}
          <p className="text-sm sm:text-base text-text-secondary tracking-wide">
            {gamertag ? `${gamertag}'s result` : 'Your result'}
          </p>

          {/* Rank badge */}
          <div className="mt-6 flex flex-col items-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all duration-500"
              style={{
                borderColor: rank.color,
                boxShadow: `0 0 30px ${rank.glow}`,
                backgroundColor: `${rank.color}10`,
              }}
            >
              <Trophy
                className="h-10 w-10 transition-colors duration-500"
                style={{ color: rank.color }}
              />
            </div>
            <h1
              className="mt-5 font-heading text-4xl sm:text-5xl font-extrabold tracking-wider transition-colors duration-500"
              style={{
                color: rank.color,
                textShadow: `0 0 20px ${rank.glow}`,
              }}
            >
              {rank.label}
            </h1>
            <p className="mt-2 font-heading text-xl text-text-secondary tracking-widest">
              {total} <span className="text-sm">total points</span>
            </p>
          </div>

          {/* Score breakdown */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            {results.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.label}
                  className="rounded-2xl bg-surface border border-border p-5 transition-all duration-200 hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary-glow">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-white">
                      {r.label}
                    </h3>
                  </div>
                  <p className="mt-3 font-heading text-3xl font-bold text-white">
                    {r.score}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{r.unit}</p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-lg">
            <button
              type="button"
              onClick={() => navigate('/play/aim')}
              className="flex-1 rounded-xl border border-primary px-6 py-3.5 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retry
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/flex-card')}
              className="flex-1 rounded-xl border border-primary px-6 py-3.5 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download card
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
