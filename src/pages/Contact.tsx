import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Mail, MessageSquare, User, Send, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/xbgjojlr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message.');
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center px-4 py-12 max-w-5xl mx-auto w-full animate-fade-in">

        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide text-white">
              Get in <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="mt-3 text-lg text-text-secondary max-w-3xl mx-auto">
              Have feedback, a bug report, or just want to say hi? Reach out.
            </p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-border rounded-2xl p-5 transition-all duration-300 hover:border-primary/30">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary-glow flex items-center justify-center mb-3">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-semibold text-white text-sm">Email</h3>
              <p className="text-sm text-text-secondary mt-1">
                <a href="mailto:contact@therankcheck.com" className="hover:text-primary-glow transition-colors">
                  contact@therankcheck.com
                </a>
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-border rounded-2xl p-5 transition-all duration-300 hover:border-primary/30">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary-glow flex items-center justify-center mb-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-semibold text-white text-sm">Response Time</h3>
              <p className="text-sm text-text-secondary mt-1">
                Usually within <span className="text-white">24–48 hours</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-transparent border border-border rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary-glow mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">
                  <span className="text-white font-medium">Tip:</span> If you're reporting a bug, include your gamertag and what you were doing when it happened — it helps me fix it faster.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-white">Message Sent! 🎉</h3>
                  <p className="text-text-secondary mt-2 max-w-sm mx-auto">
                    Thanks for reaching out. I'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm text-primary-glow hover:text-primary transition-colors duration-200"
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-1.5">
                      Your Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary-glow transition-colors duration-200" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your gamertag or name"
                        className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-3 text-white placeholder:text-text-secondary/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-1.5">
                      Your Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-primary-glow transition-colors duration-200" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-3 text-white placeholder:text-text-secondary/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-1.5">
                      Message
                    </label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-text-secondary group-focus-within:text-primary-glow transition-colors duration-200" />
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="What's on your mind? Feedback, bug report, feature request..."
                        className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-3 text-white placeholder:text-text-secondary/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y min-h-[120px]"
                      />
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 animate-shake">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-primary-glow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </Layout>
  );
}