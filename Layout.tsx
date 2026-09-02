import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AnimatedBackground from './AnimatedBackground';
import favicon from '@/assets/favicon.ico';
import favicon16 from '@/assets/favicon-16x16.png';
import favicon32 from '@/assets/favicon-32x32.png';
import appleTouch from '@/assets/apple-touch-icon.png';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  // ⭐ Set favicon dynamically
  useEffect(() => {
    // Set main favicon
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = favicon;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = favicon;
      document.head.appendChild(newLink);
    }

    // Set 16x16 favicon
    let link16 = document.querySelector("link[rel*='icon'][sizes='16x16']") as HTMLLinkElement;
    if (link16) {
      link16.href = favicon16;
    } else {
      const newLink16 = document.createElement('link');
      newLink16.rel = 'icon';
      newLink16.sizes = '16x16';
      newLink16.href = favicon16;
      document.head.appendChild(newLink16);
    }

    // Set 32x32 favicon
    let link32 = document.querySelector("link[rel*='icon'][sizes='32x32']") as HTMLLinkElement;
    if (link32) {
      link32.href = favicon32;
    } else {
      const newLink32 = document.createElement('link');
      newLink32.rel = 'icon';
      newLink32.sizes = '32x32';
      newLink32.href = favicon32;
      document.head.appendChild(newLink32);
    }

    // Set apple-touch-icon
    let linkApple = document.querySelector("link[rel*='apple-touch-icon']") as HTMLLinkElement;
    if (linkApple) {
      linkApple.href = appleTouch;
    } else {
      const newLinkApple = document.createElement('link');
      newLinkApple.rel = 'apple-touch-icon';
      newLinkApple.href = appleTouch;
      document.head.appendChild(newLinkApple);
    }
  }, []);

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