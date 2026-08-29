import { Crosshair, Move, Zap, Target, Wind } from 'lucide-react';
import { formatPercentile } from '@/lib/supabase';

type FlexCardProps = {
  gamertag: string;
  aimScore: number;
  movementScore: number;
  reflexScore: number;
  compositeScore: number;
  rankLabel: string;
  rankColor: string;
  date: string;
  aimPercentile?: number;
  movementPercentile?: number;
  reflexPercentile?: number;
  compositePercentile?: number;
  isNewBest?: boolean;
};

function getStatHighlight(
  aimPercentile: number | undefined,
  movementPercentile: number | undefined,
  reflexPercentile: number | undefined
): { label: string; icon: React.ReactNode; color: string; emoji: string } {
  const a = aimPercentile ?? 0;
  const m = movementPercentile ?? 0;
  const r = reflexPercentile ?? 0;

  if (a === m && m === r) {
    return { label: 'Balanced', icon: <Target className="h-4 w-4" />, color: '#8b5cf6', emoji: '⚖️' };
  }
  if (a === m && a > r) {
    return { label: 'Balanced', icon: <Target className="h-4 w-4" />, color: '#8b5cf6', emoji: '⚖️' };
  }
  if (a === r && a > m) {
    return { label: 'Balanced', icon: <Target className="h-4 w-4" />, color: '#8b5cf6', emoji: '⚖️' };
  }
  if (m === r && m > a) {
    return { label: 'Balanced', icon: <Target className="h-4 w-4" />, color: '#8b5cf6', emoji: '⚖️' };
  }

  if (a > m && a > r) {
    return { label: 'Sniper', icon: <Crosshair className="h-4 w-4" />, color: '#c084fc', emoji: '🎯' };
  }
  if (m > a && m > r) {
    return { label: 'Shadow', icon: <Wind className="h-4 w-4" />, color: '#60a5fa', emoji: '🏃' };
  }
  if (r > a && r > m) {
    return { label: 'Lightning', icon: <Zap className="h-4 w-4" />, color: '#fbbf24', emoji: '⚡' };
  }

  return { label: 'Balanced', icon: <Target className="h-4 w-4" />, color: '#8b5cf6', emoji: '⚖️' };
}

function getCardBorderClass(rank: string): string {
  switch (rank) {
    case 'Radiant':
      return 'border-glow-radiant animate-border-shimmer';
    case 'Immortal':
      return 'border-glow-immortal animate-border-shimmer';
    case 'Diamond':
      return 'border-glow-diamond animate-border-shimmer';
    default:
      return 'border-2 border-primary';
  }
}

function getCardGlowClass(rank: string): string {
  switch (rank) {
    case 'Radiant':
      return 'card-glow-radiant';
    case 'Immortal':
      return 'card-glow-immortal';
    case 'Diamond':
      return 'card-glow-diamond';
    default:
      return '';
  }
}

export default function FlexCard({
  gamertag,
  aimScore,
  movementScore,
  reflexScore,
  compositeScore,
  rankLabel,
  rankColor,
  date,
  aimPercentile,
  movementPercentile,
  reflexPercentile,
  compositePercentile,
  isNewBest = false,
}: FlexCardProps) {
  const statHighlight = getStatHighlight(aimPercentile, movementPercentile, reflexPercentile);
  const isTopRank = rankLabel === 'Radiant' || rankLabel === 'Immortal' || rankLabel === 'Diamond';

  const stats = [
    { 
      icon: Crosshair, 
      label: 'Aim', 
      score: aimScore,
      percentile: aimPercentile,
    },
    { 
      icon: Move, 
      label: 'Movement', 
      score: movementScore,
      percentile: movementPercentile,
    },
    { 
      icon: Zap, 
      label: 'Reflex', 
      score: reflexScore,
      percentile: reflexPercentile,
    },
  ];

  return (
    <div
      className={`relative aspect-[4/5] w-full max-w-[400px] overflow-hidden rounded-2xl bg-surface flex flex-col ${getCardBorderClass(rankLabel)} ${getCardGlowClass(rankLabel)} ${
        isNewBest ? 'animate-rank-up' : ''
      }`}
      style={{
        boxShadow: isTopRank
          ? `0 0 40px ${rankColor}40, inset 0 0 30px ${rankColor}10`
          : '0 0 40px rgba(168, 85, 247, 0.35), inset 0 0 30px rgba(168, 85, 247, 0.05)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* New Best overlay glow + RANK UP text */}
      {isNewBest && (
        <>
          <div className="absolute inset-0 pointer-events-none animate-rank-up-glow">
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `radial-gradient(circle at center, ${rankColor}40 0%, transparent 70%)`,
              }}
            />
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-rank-up-text">
            <span 
              className="font-heading text-5xl font-extrabold tracking-wider"
              style={{
                color: rankColor,
                textShadow: `0 0 40px ${rankColor}80, 0 0 80px ${rankColor}40`,
              }}
            >
              RANK UP!
            </span>
          </div>
        </>
      )}

      {/* Subtle top gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, transparent 30%, transparent 70%, rgba(168, 85, 247, 0.06) 100%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col px-6 py-5">
        <div className="text-center">
          <h2
            className="font-heading text-xl font-bold tracking-widest text-white"
            style={{ textShadow: '0 0 12px rgba(168, 85, 247, 0.6)' }}
          >
            RankCheck
          </h2>
          <p className="mt-0.5 text-[10px] tracking-[0.2em] text-text-secondary uppercase">
            Do your RankCheck
          </p>
        </div>

        <div className="mt-5 text-center">
          <p className="text-[10px] tracking-widest text-text-secondary uppercase">Player</p>
          <h1
            className="mt-1.5 font-heading text-3xl font-extrabold tracking-wide text-white truncate px-2"
            style={{ textShadow: '0 0 16px rgba(255, 255, 255, 0.2)' }}
          >
            {gamertag || 'Player'}
          </h1>
        </div>

        <div className="mt-3 flex justify-center">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${statHighlight.color}20`,
              color: statHighlight.color,
              border: `1px solid ${statHighlight.color}30`,
            }}
          >
            <span>{statHighlight.emoji}</span>
            {statHighlight.icon}
            <span>{statHighlight.label}</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p
            className="font-heading text-4xl font-extrabold tracking-tight"
            style={{
              color: rankColor,
              textShadow: `0 0 20px ${rankColor}80`,
            }}
          >
            {rankLabel}
          </p>
          <p className="mt-0.5 text-[10px] tracking-widest text-text-secondary uppercase">
            {compositeScore} COMPOSITE SCORE
          </p>
          {compositePercentile !== undefined && (
            <p className="mt-0.5 text-xs font-bold text-primary-glow">
              {formatPercentile(compositePercentile)}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const percentileLabel = stat.percentile !== undefined ? formatPercentile(stat.percentile) : null;
            return (
              <div key={stat.label} className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-primary-glow" />
                  <span className="text-sm font-medium text-text-secondary">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {percentileLabel && (
                    <span className="text-xs font-medium text-primary-glow/80">
                      {percentileLabel}
                    </span>
                  )}
                  <span className="font-heading text-xl font-bold text-white">
                    {stat.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="text-center">
          <div className="mx-auto h-px w-16 bg-border" />
          <p className="mt-2 text-[10px] tracking-widest text-text-secondary uppercase">
            {date}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes border-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .border-glow-radiant {
          border: 3px solid transparent;
          background-image: linear-gradient(#131318, #131318), 
            linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444, #f59e0b, #fbbf24);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-size: 300% 300%;
          border-radius: 16px;
        }

        .border-glow-immortal {
          border: 3px solid transparent;
          background-image: linear-gradient(#131318, #131318), 
            linear-gradient(135deg, #c084fc, #a855f7, #7c3aed, #a855f7, #c084fc);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-size: 300% 300%;
          border-radius: 16px;
        }

        .border-glow-diamond {
          border: 3px solid transparent;
          background-image: linear-gradient(#131318, #131318), 
            linear-gradient(135deg, #60a5fa, #3b82f6, #06b6d4, #3b82f6, #60a5fa);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-size: 300% 300%;
          border-radius: 16px;
        }

        .animate-border-shimmer {
          animation: border-shimmer 4s ease-in-out infinite;
        }

        .card-glow-radiant {
          box-shadow: 
            0 0 40px rgba(251, 191, 36, 0.4),
            0 0 80px rgba(251, 191, 36, 0.2),
            0 0 120px rgba(251, 191, 36, 0.1) !important;
        }

        .card-glow-immortal {
          box-shadow: 
            0 0 40px rgba(192, 132, 252, 0.4),
            0 0 80px rgba(192, 132, 252, 0.2),
            0 0 120px rgba(192, 132, 252, 0.1) !important;
        }

        .card-glow-diamond {
          box-shadow: 
            0 0 40px rgba(96, 165, 250, 0.4),
            0 0 80px rgba(96, 165, 250, 0.2),
            0 0 120px rgba(96, 165, 250, 0.1) !important;
        }

        @keyframes rank-up {
          0% { transform: scale(0.85); opacity: 0.5; }
          60% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-rank-up {
          animation: rank-up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes rank-up-glow {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.2); }
        }

        .animate-rank-up-glow {
          animation: rank-up-glow 0.8s ease-out forwards;
        }

        @keyframes rank-up-text {
          0% { opacity: 0; transform: scale(0.5); }
          30% { opacity: 1; transform: scale(1.2); }
          60% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }

        .animate-rank-up-text {
          animation: rank-up-text 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}