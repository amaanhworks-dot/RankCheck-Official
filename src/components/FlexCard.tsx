import { Crosshair, Move, Zap } from 'lucide-react';

type StatRow = {
  icon: typeof Crosshair;
  label: string;
  score: number;
};

const stats: StatRow[] = [
  { icon: Crosshair, label: 'Aim', score: 92 },
  { icon: Move, label: 'Movement', score: 78 },
  { icon: Zap, label: 'Reflex', score: 85 },
];

type FlexCardProps = {
  gamertag: string;
};

export default function FlexCard({ gamertag }: FlexCardProps) {
  return (
    <div
      className="relative aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-primary bg-surface flex flex-col"
      style={{
        boxShadow: '0 0 40px rgba(168, 85, 247, 0.35), inset 0 0 30px rgba(168, 85, 247, 0.05)',
      }}
    >
      {/* Subtle top gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, transparent 30%, transparent 70%, rgba(168, 85, 247, 0.06) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col px-6 py-5">
        {/* Top: wordmark */}
        <div className="text-center">
          <h2
            className="font-heading text-lg font-bold tracking-widest text-white"
            style={{ textShadow: '0 0 12px rgba(168, 85, 247, 0.6)' }}
          >
            RankCheck
          </h2>
          <p className="mt-0.5 text-[9px] tracking-[0.2em] text-text-secondary uppercase">
            Do your RankCheck
          </p>
        </div>

        {/* Center: gamertag */}
        <div className="mt-7 text-center">
          <p className="text-[10px] tracking-widest text-text-secondary uppercase">Player</p>
          <h1
            className="mt-1.5 font-heading text-2xl font-extrabold tracking-wide text-white truncate px-2"
            style={{ textShadow: '0 0 16px rgba(255, 255, 255, 0.2)' }}
          >
            {gamertag || 'Player'}
          </h1>
        </div>

        {/* Percentile headline */}
        <div className="mt-5 text-center">
          <p
            className="font-heading text-3xl font-extrabold tracking-tight"
            style={{
              color: '#c084fc',
              textShadow: '0 0 20px rgba(192, 132, 252, 0.5)',
            }}
          >
            Top 5%
          </p>
          <p className="mt-0.5 text-[10px] tracking-widest text-text-secondary uppercase">
            worldwide
          </p>
        </div>

        {/* Stat bars */}
        <div className="mt-6 space-y-2.5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary-glow" />
                <span className="w-14 shrink-0 text-[11px] font-medium text-text-secondary">
                  {stat.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                    style={{
                      width: `${stat.score}%`,
                      boxShadow: '0 0 8px rgba(168, 85, 247, 0.5)',
                    }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-heading text-[11px] font-bold text-white">
                  {stat.score}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spacer pushes footer to bottom */}
        <div className="flex-1" />

        {/* Bottom: footer date */}
        <div className="text-center">
          <div className="mx-auto h-px w-16 bg-border" />
          <p className="mt-2 text-[9px] tracking-widest text-text-secondary uppercase">
            August 16, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
