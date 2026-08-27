import { useNavigate } from 'react-router-dom';
import { Crosshair, Move, Zap, RotateCcw, Chrome as Home, Trophy, Download, LayoutDashboard, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTest } from '@/context/TestContext';
import { useEffect, useState } from 'react';

type TestResult = {
  icon: typeof Crosshair;
  label: string;
  score: number;
  unit: string;
  key: 'aim' | 'movement' | 'reflex';
};

type Rank = {
  label: string;
  color: string;
  glow: string;
  bg: string;
  minScore: number;
};

const RANKS: Rank[] = [
  { label: 'Radiant', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)', bg: 'rgba(251, 191, 36, 0.15)', minScore: 270 },
  { label: 'Immortal', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', bg: 'rgba(192, 132, 252, 0.15)', minScore: 220 },
  { label: 'Diamond', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.6)', bg: 'rgba(96, 165, 250, 0.15)', minScore: 170 },
  { label: 'Platinum', color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)', bg: 'rgba(52, 211, 153, 0.15)', minScore: 120 },
  { label: 'Gold', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', bg: 'rgba(245, 158, 11, 0.15)', minScore: 70 },
  { label: 'Bronze', color: '#d97706', glow: 'rgba(217, 119, 6, 0.6)', bg: 'rgba(217, 119, 6, 0.15)', minScore: 0 },
];

function getRank(score: number): Rank {
  for (const rank of RANKS) {
    if (score >= rank.minScore) return rank;
  }
  return RANKS[RANKS.length - 1];
}

export default function Results() {
  const navigate = useNavigate();
  const { gamertag, aimScore, dexScore, reaxScore, compositeScore } = useTest();
  const [isLoading, setIsLoading] = useState(true);

  // Check if all scores are present
  useEffect(() => {
    // Allow a moment for the save to complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Check if we have all scores
  const hasAllScores = aimScore !== null && dexScore !== null && reaxScore !== null && compositeScore !== null;

  // If no scores, show a message
  if (!hasAllScores && !isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center text-center max-w-md w-full animate-fade-in-up">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
              No results yet
            </h1>
            <p className="mt-3 text-sm sm:text-base text-text-secondary">
              Complete all 3 tests to see your results.
            </p>
            <button
              type="button"
              onClick={() => navigate('/play/aim')}
              className="mt-8 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Start the gauntlet
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Build results array from real data
  const results: TestResult[] = [
    { icon: Crosshair, label: 'Aim', score: aimScore ?? 0, unit: 'pts', key: 'aim' },
    { icon: Move, label: 'Movement', score: dexScore ?? 0, unit: 'pts', key: 'movement' },
    { icon: Zap, label: 'Reflex', score: reaxScore ?? 0, unit: 'pts', key: 'reflex' },
  ];

  const total = compositeScore ?? 0;
  const rank = getRank(total);

  return (
    <Layout>
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-text-secondary text-sm">Saving your scores...</p>
            </div>
          </div>
        )}

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
                backgroundColor: rank.bg,
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
              {total} <span className="text-sm">composite score</span>
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
          <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-2xl flex-wrap justify-center">
            <button
              type="button"
              onClick={() => navigate('/play/aim')}
              className="flex-1 min-w-[120px] rounded-xl border border-primary px-6 py-3.5 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retry
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/flex-card')}
              className="flex-1 min-w-[120px] rounded-xl border border-primary px-6 py-3.5 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download card
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 min-w-[120px] rounded-xl border border-primary px-6 py-3.5 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 min-w-[120px] rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}