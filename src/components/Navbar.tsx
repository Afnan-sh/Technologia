'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Laptop, 
  Smartphone, 
  Search, 
  PlusCircle, 
  Target, 
  MessageSquare, 
  Moon, 
  Sun,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  useEffect(() => {
    // Default to dark mode for technical high-density look
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const navLinks = [
    { href: '/listings', label: 'Browse Listings', icon: Laptop },
    { 
      href: '/requests', 
      label: 'Sourcing Hub', 
      icon: Target,
      badge: '5 Active',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    { 
      href: '/messages', 
      label: 'Messages', 
      icon: MessageSquare,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      badgeColor: 'bg-blue-500 text-white font-bold'
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Top micro ticker */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-300 py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PAKISTAN LOCAL TECH HUB
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Direct Sourcing in Hafeez Centre, Saddar, Blue Area & Dubai Plaza</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 font-mono text-slate-400">
            <span>Verified PTA & Hardware Specs</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-medium">WhatsApp Direct Handoff</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              T
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-foreground font-mono">
                  TECHNOLOGIA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  PK
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium">
                Hardware & Sourcing Hub
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Post Sourcing CTA */}
            <Link
              href="/requests/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Post Sourcing Request</span>
            </Link>

            {/* Post Ad CTA */}
            <Link
              href="/post-ad"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post an Ad</span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${link.badgeColor}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link
              href="/requests/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30"
            >
              <Target className="w-4 h-4" />
              <span>Post Part Request</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
