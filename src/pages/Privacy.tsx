import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-8 max-w-3xl w-full mx-auto animate-fade-in">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-text-secondary hover:text-white transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide text-white mb-6">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
          <p>
            <span className="text-white font-semibold">Last updated:</span> September 1, 2026
          </p>

          <p>
            RankCheck ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website.
          </p>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-white">Gamertag:</span> The display name you choose to use on RankCheck</li>
              <li><span className="text-white">Test Scores:</span> Your performance data from the three tests (Aim, Movement, Reflex)</li>
              <li><span className="text-white">Anonymous ID:</span> A unique identifier stored in your browser's local storage</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To display your scores and rankings on the leaderboard</li>
              <li>To generate your Flex Card for sharing</li>
              <li>To improve the game experience based on aggregate data</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Data Storage</h2>
            <p>
              Your data is stored securely in a Supabase database. We do not share your personal information with third parties.
            </p>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You can request deletion of your data at any time</li>
              <li>You can clear your local storage to reset your anonymous ID</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please{' '}
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-primary hover:text-primary-glow transition-colors duration-200"
              >
                contact us
              </button>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}