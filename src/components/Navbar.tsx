import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Trophy, LayoutDashboard, Info, HelpCircle, Mail, Gamepad2 } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/about', label: 'About', icon: Info },
  { path: '/how-it-works', label: 'How It Works', icon: Gamepad2 },
  { path: '/faq', label: 'FAQ', icon: HelpCircle },
  { path: '/contact', label: 'Contact', icon: Mail },
];

// Icons only for mobile (first 3)
const mobileIcons = navLinks.slice(0, 3);

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setIsDrawerOpen(false);

  const isActive = (path: string) => location.pathname === path;

  // Close drawer on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    };
    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border h-12 flex items-center px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="font-heading text-base sm:text-lg font-bold text-white tracking-wide hover:text-primary-glow transition-colors duration-200 shrink-0">
            RankCheck
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${active 
                      ? 'text-white bg-primary/10' 
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-glow rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1">
            {mobileIcons.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${active 
                      ? 'text-white bg-primary/10' 
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }
                  `}
                  aria-label={link.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}

            {/* Three dots toggle */}
            <button
              onClick={toggleDrawer}
              className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer */}
      <>
        {/* Backdrop */}
        <div
          className={`
            fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden
            ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={closeDrawer}
        />

        {/* Drawer */}
        <div
          ref={drawerRef}
          className={`
            fixed top-0 right-0 z-50 h-full w-64 bg-background/95 backdrop-blur-md border-l border-border shadow-2xl transition-transform duration-300 ease-out md:hidden
            ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between h-12 px-4 border-b border-border">
            <span className="font-heading text-sm font-bold text-white">Menu</span>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex flex-col p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeDrawer}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${active 
                      ? 'bg-primary/10 text-white' 
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-glow" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <p className="text-xs text-text-secondary text-center">
              RankCheck v1.0
            </p>
          </div>
        </div>
      </>
    </>
  );
}