import { Download, Share2 } from 'lucide-react';
import Layout from '@/components/Layout';
import FlexCard from '@/components/FlexCard';
import { useTest } from '@/context/TestContext';

export default function FlexCardPage() {
  const { gamertag } = useTest();

  return (
    <Layout>
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center w-full max-w-md animate-fade-in-up">
          {/* The card */}
          <FlexCard gamertag={gamertag} />

          {/* Action buttons */}
          <div className="mt-8 flex w-full gap-3">
            <button
              type="button"
              className="flex-1 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-glow hover:shadow-primary-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download card
              </span>
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl border border-primary px-6 py-3.5 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-primary-glow active:scale-[0.98]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
