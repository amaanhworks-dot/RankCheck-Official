import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Terms() {
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
          Terms of Service
        </h1>

        <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
          <p>
            <span className="text-white font-semibold">Last updated:</span> September 1, 2026
          </p>

          <p>
            By using RankCheck, you agree to these Terms of Service. If you do not agree, please do not use our service.
          </p>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Acceptance of Terms</h2>
            <p>
              By accessing or using RankCheck, you agree to be bound by these terms and all applicable laws and regulations.
            </p>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Use of Service</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 13 years old to use RankCheck</li>
              <li>You agree to use the service for its intended purpose</li>
              <li>You will not attempt to manipulate scores or rankings</li>
              <li>You will not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Account & Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your gamertag is a display name and is not unique</li>
              <li>Your scores are tied to an anonymous identifier stored in your browser</li>
              <li>You are responsible for any activity associated with your device</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Limitation of Liability</h2>
            <p>
              RankCheck is provided "as is" without warranties of any kind. We are not responsible for any loss of data or any issues arising from the use of the service.
            </p>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-white font-heading text-lg font-semibold mb-2">Contact</h2>
            <p>
              For any questions about these terms, please{' '}
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