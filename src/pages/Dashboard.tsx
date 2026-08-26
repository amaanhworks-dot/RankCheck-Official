import { useNavigate } from 'react-router-dom';
import { Crosshair, Move, Zap, RotateCcw } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTest } from '@/context/TestContext';

type SummaryCard = {
  icon: typeof Crosshair;
  label: string;
  score: number;
};

type HistoryEntry = {
  date: string;
  aim: number;
  movement: number;
  reflex: number;
  percentile: string;
};

const summaryCards: SummaryCard[] = [
  { icon: Crosshair, label: 'Best Aim', score: 94 },
  { icon: Move, label: 'Best Movement', score: 82 },
  { icon: Zap, label: 'Best Reflex', score: 88 },
];

const history: HistoryEntry[] = [
  { date: 'Aug 16, 2026', aim: 92, movement: 78, reflex: 85, percentile: 'Top 5%' },
  { date: 'Aug 10, 2026', aim: 88, movement: 71, reflex: 80, percentile: 'Top 12%' },
  { date: 'Aug 2, 2026', aim: 79, movement: 65, reflex: 74, percentile: 'Top 23%' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { gamertag } = useTest();
  const hasHistory = true;

  if (!hasHistory) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center text-center max-w-md w-full animate-fade-in-up">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
              No attempts yet
            </h1>
            <p className="mt-3 text-sm sm:text-base text-text-secondary">
              Take the gauntlet to see your stats here.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-8 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Take the gauntlet
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-4xl w-full mx-auto animate-fade-in">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Welcome back, {gamertag || 'Player'}
          </h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-xl border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
          >
            <span className="inline-flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake test
            </span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl bg-surface border border-border p-5 transition-all duration-200 hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary-glow">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-heading text-base font-semibold text-white">
                    {card.label}
                  </h3>
                </div>
                <p className="mt-3 font-heading text-3xl font-bold text-white">
                  {card.score}
                </p>
                <p className="mt-1 text-xs text-text-secondary">pts</p>
              </div>
            );
          })}
        </div>

        {/* History section */}
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-white tracking-wide">
            Your history
          </h2>

          <div className="mt-4 rounded-2xl border border-border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-2 bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <span>Date</span>
              <span className="text-center">Aim</span>
              <span className="text-center">Movement</span>
              <span className="text-center">Reflex</span>
              <span className="text-right">Percentile</span>
            </div>

            {/* History rows */}
            {history.map((entry, i) => (
              <div
                key={entry.date}
                className="grid grid-cols-5 gap-2 px-4 py-3.5 text-sm transition-colors duration-150 hover:bg-primary/5"
                style={{
                  backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                }}
              >
                <span className="text-text-secondary">{entry.date}</span>
                <span className="text-center font-heading font-semibold text-white">{entry.aim}</span>
                <span className="text-center font-heading font-semibold text-white">{entry.movement}</span>
                <span className="text-center font-heading font-semibold text-white">{entry.reflex}</span>
                <span className="text-right font-heading font-bold text-primary-glow">{entry.percentile}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
