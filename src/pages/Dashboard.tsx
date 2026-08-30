import { useNavigate } from 'react-router-dom';
import { Crosshair, Move, Zap, RotateCcw, Trophy, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useTest } from '@/context/TestContext';
import { useEffect, useState } from 'react';
import { formatPercentile, fetchUserScoresWithPercentiles, ScoreWithPercentiles } from '@/lib/supabase';

type BestScores = {
  bestAim: number;
  bestMovement: number;
  bestReflex: number;
  bestComposite: number;
};

type Rank = {
  label: string;
  color: string;
  minScore: number;
};

const RANKS: Rank[] = [
  { label: 'Radiant', color: '#fbbf24', minScore: 85 },
  { label: 'Immortal', color: '#c084fc', minScore: 70 },
  { label: 'Diamond', color: '#60a5fa', minScore: 55 },
  { label: 'Platinum', color: '#34d399', minScore: 40 },
  { label: 'Gold', color: '#f59e0b', minScore: 25 },
  { label: 'Bronze', color: '#d97706', minScore: 0 },
];

function getRank(score: number): Rank {
  for (const rank of RANKS) {
    if (score >= rank.minScore) return rank;
  }
  return RANKS[RANKS.length - 1];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ⭐ Normalize functions
const normalizeAim = (score: number) => Math.min(Math.round((score / 1000) * 100), 100);
const normalizeMovement = (score: number) => Math.min(Math.round((score / 60) * 100), 100);
const normalizeReflex = (score: number) => Math.min(Math.round((score / 1000) * 100), 100);

export default function Dashboard() {
  const navigate = useNavigate();
  const { gamertag, anonId } = useTest();
  const [history, setHistory] = useState<ScoreWithPercentiles[]>([]);
  const [bestScores, setBestScores] = useState<BestScores>({
    bestAim: 0,
    bestMovement: 0,
    bestReflex: 0,
    bestComposite: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!anonId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const scoresWithPercentiles = await fetchUserScoresWithPercentiles(anonId);

        if (scoresWithPercentiles.length > 0) {
          setHistory(scoresWithPercentiles);

          const bestAim = Math.max(...scoresWithPercentiles.map((row: ScoreWithPercentiles) => row.aim_score));
          const bestMovement = Math.max(...scoresWithPercentiles.map((row: ScoreWithPercentiles) => row.dex_score));
          const bestReflex = Math.max(...scoresWithPercentiles.map((row: ScoreWithPercentiles) => row.reax_score));
          const bestComposite = Math.max(...scoresWithPercentiles.map((row: ScoreWithPercentiles) => row.composite_score));

          setBestScores({
            bestAim,
            bestMovement,
            bestReflex,
            bestComposite,
          });
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load history. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [anonId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-text-secondary">Loading your history...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center text-center max-w-md w-full">
            <p className="text-red-400 text-lg font-semibold">⚠️ {error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (history.length === 0) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center text-center max-w-md w-full animate-fade-in-up">
            <Trophy className="h-16 w-16 text-text-secondary/30" />
            <h1 className="mt-4 font-heading text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
              No attempts yet
            </h1>
            <p className="mt-3 text-sm sm:text-base text-text-secondary">
              {gamertag ? `${gamertag}, take the gauntlet to see your stats here.` : 'Take the gauntlet to see your stats here.'}
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

  const currentRank = getRank(bestScores.bestComposite);

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-4xl w-full mx-auto animate-fade-in">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-wide text-white">
              {gamertag ? `${gamertag}'s Dashboard` : 'Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {history.length} attempt{history.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
              style={{
                borderColor: currentRank.color,
                color: currentRank.color,
                backgroundColor: `${currentRank.color}10`,
              }}
            >
              <Trophy className="h-4 w-4" />
              {currentRank.label}
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake test
              </span>
            </button>
          </div>
        </div>

        {/* Best scores summary cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-surface border border-border p-4 transition-all duration-200 hover:border-primary/50">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Best Aim</p>
            <p className="mt-1 font-heading text-2xl font-bold text-white">{normalizeAim(bestScores.bestAim)}</p>
          </div>
          <div className="rounded-2xl bg-surface border border-border p-4 transition-all duration-200 hover:border-primary/50">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Best Movement</p>
            <p className="mt-1 font-heading text-2xl font-bold text-white">{normalizeMovement(bestScores.bestMovement)}</p>
          </div>
          <div className="rounded-2xl bg-surface border border-border p-4 transition-all duration-200 hover:border-primary/50">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Best Reflex</p>
            <p className="mt-1 font-heading text-2xl font-bold text-white">{normalizeReflex(bestScores.bestReflex)}</p>
          </div>
          <div className="rounded-2xl bg-surface border border-border p-4 transition-all duration-200 hover:border-primary/50">
            <p className="text-xs text-text-secondary uppercase tracking-wider">Best Composite</p>
            <p className="mt-1 font-heading text-2xl font-bold text-white">{bestScores.bestComposite}</p>
          </div>
        </div>

        {/* History section */}
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-white tracking-wide">
            Attempt history
          </h2>

          <div className="mt-4 rounded-2xl border border-border overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-6 gap-2 bg-surface/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <span>Date</span>
                <span className="text-center">Aim</span>
                <span className="text-center">Movement</span>
                <span className="text-center">Reflex</span>
                <span className="text-center">Composite</span>
                <span className="text-right">Rank</span>
              </div>

              {history.map((entry: ScoreWithPercentiles, i: number) => {
                const rank = getRank(entry.composite_score);
                // ⭐ Normalize scores for display
                const displayAim = normalizeAim(entry.aim_score);
                const displayMovement = normalizeMovement(entry.dex_score);
                const displayReflex = normalizeReflex(entry.reax_score);

                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-6 gap-2 px-4 py-3.5 text-sm transition-colors duration-150 hover:bg-primary/5"
                    style={{
                      backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    }}
                  >
                    <span className="text-text-secondary">{formatDate(entry.created_at)}</span>
                    
                    <div className="text-center">
                      <span className="font-heading font-semibold text-white">{displayAim}</span>
                      {entry.aim_percentile !== undefined && (
                        <p className="text-[10px] text-primary-glow/70">
                          {formatPercentile(entry.aim_percentile)}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <span className="font-heading font-semibold text-white">{displayMovement}</span>
                      {entry.movement_percentile !== undefined && (
                        <p className="text-[10px] text-primary-glow/70">
                          {formatPercentile(entry.movement_percentile)}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <span className="font-heading font-semibold text-white">{displayReflex}</span>
                      {entry.reflex_percentile !== undefined && (
                        <p className="text-[10px] text-primary-glow/70">
                          {formatPercentile(entry.reflex_percentile)}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <span className="font-heading font-bold text-primary-glow">{entry.composite_score}</span>
                      {entry.composite_percentile !== undefined && (
                        <p className="text-[10px] font-bold text-primary-glow">
                          {formatPercentile(entry.composite_percentile)}
                        </p>
                      )}
                    </div>
                    
                    <span
                      className="text-right font-heading font-bold"
                      style={{ color: rank.color }}
                    >
                      {rank.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/flex-card')}
            className="rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
          >
            View your Flex Card
          </button>
          <button
            type="button"
            onClick={() => navigate('/leaderboard')}
            className="rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
          >
            <span className="inline-flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Take the gauntlet again
          </button>
        </div>
      </div>
    </Layout>
  );
}