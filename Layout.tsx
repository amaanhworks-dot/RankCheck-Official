import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';
import { refreshAds, initAllAds } from '@/utils/adScript';

type LayoutProps = {
  children: ReactNode;
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐ Initialize ads on first load
  useEffect(() => {
    initAllAds();
  }, []);

  // ⭐ Refresh ads on route change
  useEffect(() => {
    // Track page view in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-WZLGX7H9Y0', {
        page_path: location.pathname + location.search,
      });
    }

    // ⭐ Refresh ads on every route change
    refreshAds();
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-[#f5f5f7] flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      <footer className="border-t border-border py-6 px-4 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary/60">
            © {new Date().getFullYear()} RankCheck. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-secondary/60">
            <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors duration-200">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors duration-200">Terms</button>
            <button onClick={() => navigate('/about')} className="hover:text-primary transition-colors duration-200">About</button>
            <button onClick={() => navigate('/contact')} className="hover:text-primary transition-colors duration-200">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}