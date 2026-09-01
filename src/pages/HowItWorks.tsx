import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { 
  ArrowRight, 
  Crosshair, 
  Move, 
  Zap, 
  BarChart3, 
  Share2, 
  Trophy,
  Clock,
  Users,
  Sparkles,
  Target,
  GitBranch,
  Flame
} from 'lucide-react';

export default function HowItWorks() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center px-4 py-12 max-w-6xl mx-auto w-full animate-fade-in">

        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide text-white">
              How It <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Works</span>
            </h1>
            <p className="mt-3 text-lg text-text-secondary max-w-4xl mx-auto">
              Three tests. Ninety seconds. One composite score.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary-glow rounded-full border border-primary/20">
                🎯 3 tests
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary-glow rounded-full border border-primary/20">
                ⏱️ 90 seconds
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary-glow rounded-full border border-primary/20">
                🏆 6 ranks
              </span>
            </div>
          </div>
        </div>

        {/* Overview Steps */}
        <div className="w-full max-w-5xl mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: 'Step 1', desc: 'Enter your gamertag. No signup required.', color: 'from-purple-500/20 to-purple-600/5' },
              { icon: Crosshair, title: 'Step 2', desc: 'Play all 3 tests — Aim, Movement, Reflex.', color: 'from-blue-500/20 to-blue-600/5' },
              { icon: Trophy, title: 'Step 3', desc: 'Get your rank, percentile, and Flex Card.', color: 'from-amber-500/20 to-amber-600/5' },
            ].map((step, i) => (
              <div
                key={i}
                className={`group bg-gradient-to-br ${step.color} border border-border hover:border-primary/30 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-glow/10`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary-glow flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="w-full max-w-5xl space-y-6">

          {/* Aim Test */}
          <div className="group bg-surface border border-border hover:border-primary/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Crosshair className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-white">Aim Test</h2>
              <span className="ml-auto text-xs font-medium bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">40% of score</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Static targets appear randomly. Moving targets drift across the screen. 
              Golden Ace targets appear for just 0.9 seconds — hit them for bonus points.
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="bg-surface/50 rounded-lg p-2 text-center border border-border">
                <span className="text-xs text-text-secondary">Static</span>
                <p className="text-white font-bold text-sm">+10</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2 text-center border border-border">
                <span className="text-xs text-text-secondary">Moving</span>
                <p className="text-white font-bold text-sm">+15</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2 text-center border border-border">
                <span className="text-xs text-text-secondary">Ace</span>
                <p className="text-white font-bold text-sm">+25</p>
              </div>
              <div className="bg-surface/50 rounded-lg p-2 text-center border border-border">
                <span className="text-xs text-text-secondary">Combo</span>
                <p className="text-white font-bold text-sm">x5</p>
              </div>
            </div>
          </div>

          {/* Movement Test */}
          <div className="group bg-surface border border-border hover:border-primary/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Move className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-white">Movement Test</h2>
              <span className="ml-auto text-xs font-medium bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">35% of score</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Track a chaotic moving target with WASD. The longer you stay on target, the more points you earn. 
              Hold <kbd className="px-2 py-0.5 bg-border rounded text-xs text-white">Shift</kbd> to sprint (380px/s instead of 220px/s).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">🏃 Sprint: 380px/s</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">🎯 Time on target × 2</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">⚡ Speed increases over time</span>
            </div>
          </div>

          {/* Reflex Test */}
          <div className="group bg-surface border border-border hover:border-primary/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-white">Reflex Test</h2>
              <span className="ml-auto text-xs font-medium bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">25% of score</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Keys appear on screen. Press them as fast as possible. 
              Sometimes it's a sequence. Sometimes it's a trap — don't press the red key.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">⚡ Under 300ms = bonus</span>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">⚠️ False prompts = -20</span>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">👑 Boss key = +50</span>
            </div>
          </div>
        </div>

        {/* Composite Score Section */}
        <div className="w-full max-w-5xl mt-10 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary-glow flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-white">Composite Score</h2>
          </div>
          <p className="text-text-secondary leading-relaxed max-w-3xl">
            Your final rank is based on a weighted composite score:
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <div className="bg-surface/50 rounded-xl p-3 text-center border border-border hover:border-purple-500/30 transition-all duration-300">
              <p className="text-xs text-text-secondary uppercase">Aim</p>
              <p className="font-heading text-2xl font-bold text-purple-400">40%</p>
            </div>
            <div className="bg-surface/50 rounded-xl p-3 text-center border border-border hover:border-blue-500/30 transition-all duration-300">
              <p className="text-xs text-text-secondary uppercase">Movement</p>
              <p className="font-heading text-2xl font-bold text-blue-400">35%</p>
            </div>
            <div className="bg-surface/50 rounded-xl p-3 text-center border border-border hover:border-amber-500/30 transition-all duration-300">
              <p className="text-xs text-text-secondary uppercase">Reflex</p>
              <p className="font-heading text-2xl font-bold text-amber-400">25%</p>
            </div>
          </div>
        </div>

        {/* Rank Tiers */}
        <div className="w-full max-w-5xl mt-10">
          <h2 className="font-heading text-2xl font-semibold text-white text-center mb-4">Rank Tiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Radiant', score: '85+', color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' },
              { label: 'Immortal', score: '70–84', color: '#c084fc', glow: 'rgba(192,132,252,0.2)' },
              { label: 'Diamond', score: '55–69', color: '#60a5fa', glow: 'rgba(96,165,250,0.2)' },
              { label: 'Platinum', score: '40–54', color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
              { label: 'Gold', score: '25–39', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
              { label: 'Bronze', score: '0–24', color: '#d97706', glow: 'rgba(217,119,6,0.2)' },
            ].map((rank) => (
              <div
                key={rank.label}
                className="bg-surface border border-border hover:border-primary/30 rounded-xl p-3 text-center transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: `0 0 20px ${rank.glow}` }}
              >
                <p className="text-xs text-text-secondary uppercase">{rank.label}</p>
                <p className="font-heading text-lg font-bold" style={{ color: rank.color }}>{rank.score}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Flex Card Section */}
        <div className="w-full max-w-5xl mt-10 bg-surface border border-border hover:border-primary/30 rounded-2xl p-6 sm:p-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary-glow flex items-center justify-center">
              <Share2 className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-white">The Flex Card</h2>
          </div>
          <p className="text-text-secondary leading-relaxed max-w-3xl">
            After completing all three tests, you get a shareable Flex Card with:
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-secondary max-w-4xl">
            {[
              'Your gamertag and unique ID',
              'Composite score + global percentile',
              'Individual test scores',
              'Rank tier (Bronze → Radiant)',
              'Stat highlight (Sniper, Shadow, Lightning)',
              'Download as PNG + auto-copy share message',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface/30 rounded-lg px-3 py-2 border border-border">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full max-w-5xl text-center mt-12">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-white mb-4">Ready to Test Your Mechanics?</h2>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-primary-glow-lg active:scale-[0.98]"
            >
              Take the Gauntlet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}