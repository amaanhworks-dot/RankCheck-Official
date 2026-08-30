import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, ChevronLeft, Loader2, User, RefreshCw } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useTest } from '@/context/TestContext';

type LeaderboardEntry = {
  id: string;
  user_id: string;
  gamer_tag: string;
  aim_score: number;
  dex_score: number;
  reax_score: number;
  composite_score: number;
  created_at: string;
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

function getShortUserId(userId: string): string {
  const match = userId.match(/usr_([a-f0-9]{4})/);
  return match ? match[1] : userId.slice(-4);
}

function getMedal(position: number): string {
  if (position === 1) return '👑';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return '';
}

const normalizeAim = (score: number) => Math.min(Math.round((score / 1000) * 100), 100);
const normalizeMovement = (score: number) => Math.min(Math.round((score / 60) * 100), 100);
const normalizeReflex = (score: number) => Math.min(Math.round((score / 1000) * 100), 100);

export default function Leaderboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { anonId } = useTest();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      setIsLoading(true);
      setError(null);

      // ⭐ Query: Get the BEST score per user, but with the LATEST gamertag
      // Step 1: Get the best composite score per user_id
      // Step 2: Get the latest gamertag for that user_id
      const { data, error: supabaseError } = await supabase
        .from('user_scores')
        .select('id, user_id, gamer_tag, aim_score, dex_score, reax_score, composite_score, created_at')
        .not('composite_score', 'is', null)
        .order('composite_score', { ascending: false })
        .limit(100);

      if (supabaseError) {
        throw supabaseError;
      }

      // ⭐ Deduplicate: Keep only the highest composite score per user_id
      // But for gamertag, use the MOST RECENT one for that user
      const userMap = new Map<string, LeaderboardEntry>();
      const userLatestGamertag = new Map<string, { gamertag: string; created_at: string }>();

      // First pass: Find the latest gamertag for each user
      for (const entry of data || []) {
        const existing = userLatestGamertag.get(entry.user_id);
        if (!existing || new Date(entry.created_at) > new Date(existing.created_at)) {
          userLatestGamertag.set(entry.user_id, {
            gamertag: entry.gamer_tag,
            created_at: entry.created_at,
          });
        }
      }

      // Second pass: Keep the best score per user, but use the latest gamertag
      for (const entry of data || []) {
        const existing = userMap.get(entry.user_id);
        if (!existing || entry.composite_score > existing.composite_score) {
          const latestGamertag = userLatestGamertag.get(entry.user_id)?.gamertag || entry.gamer_tag;
          userMap.set(entry.user_id, {
            ...entry,
            gamer_tag: latestGamertag, // ⭐ Use latest gamertag
          });
        }
      }

      const uniqueEntries = Array.from(userMap.values());
      // Sort by composite score descending
      uniqueEntries.sort((a, b) => b.composite_score - a.composite_score);

      setEntries(uniqueEntries);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please refresh and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [location.key]);

  const handleRefresh = () => {
    fetchLeaderboard(true);
  };

  if (isLoading && !isRefreshing) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-text-secondary">Loading leaderboard...</p>
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
              onClick={handleRefresh}
              className="mt-4 rounded-xl border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (entries.length === 0) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center text-center max-w-md w-full">
            <Trophy className="h-16 w-16 text-text-secondary/30" />
            <h1 className="mt-4 font-heading text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
              No players yet
            </h1>
            <p className="mt-3 text-sm sm:text-base text-text-secondary">
              Be the first to claim a spot on the leaderboard!
            </p>
            <button
              type="button"
              onClick={() => navigate('/play/aim')}
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
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-5xl w-full mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-wide text-white">
                Leaderboard
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Top {entries.length} players by composite score
              </p>
              <p className="mt-0.5 text-xs text-text-secondary/60">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 rounded-xl border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98] ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-border overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-12 gap-2 bg-surface/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <span className="col-span-2 text-center">Position</span>
              <span className="col-span-3">Player</span>
              <span className="col-span-2 text-center">Aim</span>
              <span className="col-span-1 text-center">Movement</span>
              <span className="col-span-2 text-center">Reflex</span>
              <span className="col-span-2 text-center">Composite</span>
            </div>

            {entries.map((entry, index) => {
              const rank = getRank(entry.composite_score);
              const isCurrentUser = entry.user_id === anonId;
              const rankNumber = index + 1;
              const shortId = getShortUserId(entry.user_id);
              const medal = getMedal(rankNumber);
              const displayAim = normalizeAim(entry.aim_score);
              const displayMovement = normalizeMovement(entry.dex_score);
              const displayReflex = normalizeReflex(entry.reax_score);

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 gap-2 px-4 py-3.5 text-sm transition-colors duration-150 ${
                    isCurrentUser
                      ? 'bg-primary/10 border-l-2 border-primary'
                      : index % 2 === 1
                      ? 'bg-white/5'
                      : 'bg-transparent'
                  } hover:bg-primary/5`}
                >
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    {medal && <span className="text-base">{medal}</span>}
                    <span className="font-heading font-bold text-text-secondary">
                      #{rankNumber}
                    </span>
                    <span
                      className="font-heading font-bold text-xs"
                      style={{ color: rank.color }}
                    >
                      {rank.label}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center gap-2 truncate">
                    {isCurrentUser && <User className="h-3 w-3 text-primary" />}
                    <span className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                      {entry.gamer_tag || 'Anonymous'}
                    </span>
                    <span className="text-xs text-text-secondary/60 font-mono">
                      ({shortId})
                    </span>
                  </div>

                  <div className="col-span-2 text-center font-heading font-semibold text-white">
                    {displayAim}
                  </div>
                  <div className="col-span-1 text-center font-heading font-semibold text-white">
                    {displayMovement}
                  </div>
                  <div className="col-span-2 text-center font-heading font-semibold text-white">
                    {displayReflex}
                  </div>

                  <div
                    className="col-span-2 text-center font-heading font-bold"
                    style={{ color: rank.color }}
                  >
                    {entry.composite_score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-text-secondary">
          Only the best attempt per player is shown
        </div>
      </div>
    </Layout>
  );
}