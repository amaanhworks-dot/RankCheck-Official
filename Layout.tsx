import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground'; // ⭐ NEW

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-[#f5f5f7] flex flex-col">
      {/* ⭐ Animated Background - Added behind everything */}
      <AnimatedBackground />

      {/* Navbar - Added at the top */}
      <Navbar />

      {/* ⭐ Added relative z-10 so content appears above the background */}
      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary/60">
            © {new Date().getFullYear()} RankCheck. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-secondary/60">
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="hover:text-primary transition-colors duration-200"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="hover:text-primary transition-colors duration-200"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="hover:text-primary transition-colors duration-200"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="hover:text-primary transition-colors duration-200"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}