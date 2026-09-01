import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Crosshair, Move, Zap, Share2, TrendingUp, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center px-4 py-12 max-w-5xl mx-auto w-full animate-fade-in">

        {/* Header with glow */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide text-white">
              About <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">RankCheck</span>
            </h1>
            <p className="mt-3 text-lg text-text-secondary max-w-3xl mx-auto">
              A 90-second mechanical skill benchmark for PC gamers who want to know where they really stand.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary-glow rounded-full border border-primary/20">
                🎯 Built for gamers
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary-glow rounded-full border border-primary/20">
                ⚡ 90 seconds
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary-glow rounded-full border border-primary/20">
                🏆 6 rank tiers
              </span>
            </div>
          </div>
        </div>

        {/* What It Is */}
        <section className="w-full mb-12 bg-surface/50 border border-border rounded-2xl p-6 sm:p-8 hover:border-primary/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-white">What Is RankCheck?</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            RankCheck measures your raw mechanical skill through three short tests: 
            <span className="text-white font-medium"> Aim</span>, 
            <span className="text-white font-medium"> Movement</span>, and 
            <span className="text-white font-medium"> Reflex</span>.
          </p>
          <p className="text-text-secondary leading-relaxed mt-2">
            Each test is designed to challenge a different part of your gameplay. 
            After all three, you get a composite score, a global percentile, and a 
            shareable Flex Card that proves your rank — from Bronze to Radiant.
          </p>
        </section>

        {/* The Three Tests */}
        <section className="w-full mb-12">
          <h2 className="font-heading text-2xl font-semibold text-white mb-4 text-center">The Three Tests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Crosshair, title: 'Aim', desc: 'Static targets, moving targets, and golden Ace targets that appear for just 0.9 seconds. Click fast. Click true.', color: 'from-purple-500/20 to-purple-600/5', iconColor: 'text-purple-400' },
              { icon: Move, title: 'Movement', desc: 'Track a chaotic moving target with WASD. Stay on it. Sprint if you can. Every millisecond counts.', color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400' },
              { icon: Zap, title: 'Reflex', desc: 'Keys appear. Press them. Sometimes it\'s a sequence. Sometimes it\'s a trap. Don\'t press the red one.', color: 'from-amber-500/20 to-amber-600/5', iconColor: 'text-amber-400' },
            ].map((test, i) => (
              <div
                key={i}
                className={`group bg-gradient-to-br ${test.color} border border-border hover:border-primary/30 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-glow/10`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`${test.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <test.icon className="h-8 w-8 mb-3" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white">{test.title}</h3>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">{test.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why I Built It */}
        <section className="w-full mb-12 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="font-heading text-2xl font-semibold text-white mb-4">Why I Built It</h2>
            <p className="text-text-secondary leading-relaxed">
              I built RankCheck because I wanted to know — <span className="text-white italic">really know</span> — how good I was at the games I love. 
              Not my rank. Not my hours played. My actual mechanics.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              The stuff that separates a good player from a great one. There wasn't a tool that did that 
              simply and fairly. So I built one.
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              No signup. No download. No excuses. Just three tests, a brutal score, and a Flex Card you'll actually want to share.
            </p>
          </div>
        </section>

        {/* The Philosophy */}
        <section className="w-full mb-12 bg-primary/5 border border-primary/10 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
          <div className="relative">
            <p className="text-text-secondary text-2xl sm:text-3xl font-light italic max-w-2xl mx-auto leading-relaxed">
              “Skill is not subjective. It can be measured, compared, and improved.”
            </p>
            <p className="text-text-secondary text-sm mt-4">
              RankCheck is a tool for doing exactly that — quickly, fairly, and without friction.
            </p>
          </div>
        </section>

        {/* Who It's For */}
        <section className="w-full mb-12">
          <h2 className="font-heading text-2xl font-semibold text-white mb-4 text-center">Who It's For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Users, title: 'The Flexer', desc: 'wants proof they\'re better than their friends' },
              { icon: TrendingUp, title: 'The Grinder', desc: 'wants to track improvement over time' },
              { icon: Share2, title: 'The Streamer', desc: 'wants content: "Chat, try to beat my rank"' },
              { icon: Crosshair, title: 'The Skeptic', desc: 'wants to see if they\'re actually as good as they think' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-surface/30 border border-border hover:border-primary/30 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary-glow flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-text-secondary text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full text-center py-8">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-white mb-4">Ready to See Where You Stand?</h2>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-primary-glow-lg active:scale-[0.98]"
            >
              Take the Gauntlet
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </Layout>
  );
}