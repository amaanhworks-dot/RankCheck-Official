import { Download, Share2, ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { snapdom } from '@zumer/snapdom';
import Layout from '@/components/Layout';
import FlexCard from '@/components/FlexCard';
import { useTest } from '@/context/TestContext';
import { fetchUserPercentiles, UserPercentiles, formatPercentile, fetchPreviousBestScore } from '@/lib/supabase';

type Rank = {
  label: string;
  color: string;
  minScore: number;
};

const RANKS: Rank[] = [
  { label: 'Radiant', color: '#fbbf24', minScore: 270 },
  { label: 'Immortal', color: '#c084fc', minScore: 220 },
  { label: 'Diamond', color: '#60a5fa', minScore: 170 },
  { label: 'Platinum', color: '#34d399', minScore: 120 },
  { label: 'Gold', color: '#f59e0b', minScore: 70 },
  { label: 'Bronze', color: '#d97706', minScore: 0 },
];

function getRank(score: number): Rank {
  for (const rank of RANKS) {
    if (score >= rank.minScore) return rank;
  }
  return RANKS[RANKS.length - 1];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

export default function FlexCardPage() {
  const navigate = useNavigate();
  const { gamertag, aimScore, dexScore, reaxScore, compositeScore, anonId } = useTest();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [percentiles, setPercentiles] = useState<UserPercentiles | null>(null);
  const [isLoadingPercentiles, setIsLoadingPercentiles] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!anonId) {
        setIsLoadingPercentiles(false);
        return;
      }

      try {
        const [percentileResult, previousBestResult] = await Promise.all([
          fetchUserPercentiles(anonId),
          fetchPreviousBestScore(anonId),
        ]);

        setPercentiles(percentileResult);
        setPreviousBest(previousBestResult);

        if (previousBestResult !== null && compositeScore !== null) {
          setIsNewBest(compositeScore > previousBestResult);
          if (compositeScore > previousBestResult) {
            console.log(`🎉 NEW BEST! ${previousBestResult} → ${compositeScore}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoadingPercentiles(false);
      }
    };

    loadData();
  }, [anonId, compositeScore]);

  const hasAllScores = aimScore !== null && dexScore !== null && reaxScore !== null && compositeScore !== null;
  const rank = getRank(compositeScore ?? 0);

  const generateCardImage = async (): Promise<string> => {
    if (!cardRef.current) {
      throw new Error('Card ref not available');
    }

    try {
      console.log('📸 Starting Snapdom capture...');
      const result = await snapdom(cardRef.current, {
        width: 400,
        height: 500,
      });
      console.log('✅ Snapdom capture successful');
      const canvas = await result.toCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      console.log('✅ Data URL generated, length:', dataUrl.length);
      return dataUrl;
    } catch (err) {
      console.error('❌ Snapdom capture failed:', err);
      throw err;
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const dataUrl = await generateCardImage();
      const link = document.createElement('a');
      link.download = `rankcheck-${gamertag || 'player'}-${formatDate(new Date())}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('❌ handleDownload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to generate card: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const dataUrl = await generateCardImage();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `rankcheck-${gamertag || 'player'}.png`, { type: 'image/png' });

      const percentileLabel = percentiles?.compositePercentile !== undefined
        ? formatPercentile(percentiles.compositePercentile)
        : 'Top 100%';
      const shareMessage = `Just did my RankCheck — ${percentileLabel} worldwide! 🏆 Try to beat me: https://therankcheck.com`;

      if (navigator.share) {
        await navigator.share({
          title: `${gamertag || 'Player'}'s RankCheck`,
          text: shareMessage,
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(shareMessage);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
        const link = document.createElement('a');
        link.download = `rankcheck-${gamertag || 'player'}-${formatDate(new Date())}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to share card:', err);
        setError('Failed to share card. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMessage = async () => {
    const percentileLabel = percentiles?.compositePercentile !== undefined
      ? formatPercentile(percentiles.compositePercentile)
      : 'Top 100%';
    const shareMessage = `Just did my RankCheck — ${percentileLabel} worldwide! 🏆 Try to beat me: https://therankcheck.com`;

    try {
      await navigator.clipboard.writeText(shareMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy message:', err);
      setError('Failed to copy message. Please try again.');
    }
  };

  if (!hasAllScores && !isLoadingPercentiles) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="flex flex-col items-center text-center max-w-md w-full animate-fade-in-up">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
              No scores yet
            </h1>
            <p className="mt-3 text-sm sm:text-base text-text-secondary">
              Complete all 3 tests to generate your Flex Card.
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

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[400px] mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-[400px] animate-fade-in-up">
          {error && (
            <div className="mb-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {isLoadingPercentiles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div ref={cardRef} className="w-full">
                <FlexCard
                  gamertag={gamertag}
                  aimScore={aimScore ?? 0}
                  movementScore={dexScore ?? 0}
                  reflexScore={reaxScore ?? 0}
                  compositeScore={compositeScore ?? 0}
                  rankLabel={rank.label}
                  rankColor={rank.color}
                  date={formatDate(new Date())}
                  aimPercentile={percentiles?.aimPercentile}
                  movementPercentile={percentiles?.movementPercentile}
                  reflexPercentile={percentiles?.reflexPercentile}
                  compositePercentile={percentiles?.compositePercentile}
                  isNewBest={isNewBest}
                />
              </div>

              <button
                type="button"
                onClick={handleShare}
                disabled={isGenerating}
                className={`mt-6 w-full rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-4 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-primary-glow-lg active:scale-[0.98] ${
                  isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Share2 className="h-5 w-5" />
                  )}
                  Share This Flex
                </span>
              </button>

              <div className="mt-3 flex w-full gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className={`flex-1 rounded-xl border border-primary/50 px-4 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98] ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`flex-1 rounded-xl border border-primary/50 px-4 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Message
                      </>
                    )}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mt-4 text-sm text-text-secondary hover:text-primary transition-colors duration-200 text-center w-full"
              >
                View your Dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}