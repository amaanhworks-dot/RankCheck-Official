import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "Do I need to sign up or create an account?",
    answer: "No. RankCheck is completely anonymous. Just enter your gamertag and play. No email, no password, no tracking."
  },
  {
    question: "Is RankCheck free?",
    answer: "Yes. The core experience — all three tests, your composite score, percentile, and Flex Card — is completely free."
  },
  {
    question: "How long does it take to complete?",
    answer: "About 90 seconds. Each test is 30 seconds long, and the entire experience — from landing to Flex Card — takes less than 2 minutes."
  },
  {
    question: "What games is RankCheck for?",
    answer: "RankCheck measures raw mechanical skill — aim, movement, and reflex — that applies to any FPS or competitive PC game. Valorant, CS2, Apex Legends, Overwatch, Call of Duty — if it requires aim and movement, RankCheck applies."
  },
  {
    question: "How is my rank calculated?",
    answer: "Your composite score is a weighted average of your three test scores: Aim (40%), Movement (35%), and Reflex (25%). Your rank tier (Bronze → Radiant) is based on your composite score."
  },
  {
    question: "Can I retake the tests?",
    answer: "Yes. As many times as you want. Your best score is saved to your Dashboard, and each new attempt updates your history."
  },
  {
    question: "What is the Flex Card?",
    answer: "The Flex Card is a shareable PNG image that shows your gamertag, composite score, individual test scores, global percentile, and rank tier. You can download it and share it anywhere."
  },
  {
    question: "How do I share my Flex Card?",
    answer: "After completing all three tests, you'll be taken to the Flex Card page. Click 'Share This Flex' — it downloads the card and copies a pre-written message to your clipboard. Paste it anywhere."
  },
  {
    question: "Is my data saved?",
    answer: "Yes. Your gamertag, scores, and history are saved to our database. We don't collect any personal information — no email, no IP tracking, no cookies."
  },
  {
    question: "What do the rank tiers mean?",
    answer: "Bronze (0–24), Gold (25–39), Platinum (40–54), Diamond (55–69), Immortal (70–84), Radiant (85+). Each tier represents your mechanical skill percentile relative to all players."
  },
  {
    question: "Can I play RankCheck on mobile?",
    answer: "Yes. RankCheck is fully responsive and works on phones, tablets, and desktops. However, for the best experience — especially for Aim and Movement tests — we recommend using a mouse and keyboard."
  },
  {
    question: "Who built RankCheck?",
    answer: "RankCheck was built by a solo developer who wanted to know — really know — how good they were at the games they love. No team. No funding. Just code and determination."
  },
  {
    question: "What is the Synergy Test?",
    answer: "The Synergy Test combines mouse aim and WASD movement at the same time — like a real FPS engagement. It's coming soon as the 4th test."
  },
  {
    question: "How can I contact you?",
    answer: "You can reach out via the Contact page or email us directly. We'd love to hear your feedback, suggestions, or bug reports."
  }
];

function FaqAccordion({ question, answer, index }: FaqItem & { index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b border-border last:border-b-0 transition-all duration-300 ${isOpen ? 'bg-primary/5' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-4 text-left hover:text-white transition-colors duration-200 group"
      >
        <div className="flex items-start gap-3">
          <span className="text-xs font-heading font-bold text-primary-glow/50 mt-0.5 w-6 shrink-0">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <span className={`text-base font-medium transition-colors duration-200 ${isOpen ? 'text-white' : 'text-text-secondary'}`}>
            {question}
          </span>
        </div>
        <div className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-primary-glow" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-secondary group-hover:text-white transition-colors duration-200" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pl-14 text-text-secondary leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center px-4 py-12 max-w-4xl mx-auto w-full animate-fade-in">

        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary-glow flex items-center justify-center">
                <HelpCircle className="h-6 w-6" />
              </div>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-wide text-white">
              Frequently Asked <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="mt-3 text-lg text-text-secondary max-w-3xl mx-auto">
              Everything you need to know about RankCheck.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="w-full bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {faqs.map((faq, index) => (
            <FaqAccordion key={index} {...faq} index={index} />
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-10 text-center">
          <div className="bg-surface/50 border border-border rounded-xl p-6">
            <p className="text-text-secondary">
              Still have questions?{" "}
              <Link to="/contact" className="text-primary-glow hover:text-primary transition-colors duration-200 font-medium">
                Contact us
              </Link>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-primary-glow-lg active:scale-[0.98]"
          >
            Take the Gauntlet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </Layout>
  );
}