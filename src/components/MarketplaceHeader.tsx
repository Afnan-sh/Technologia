'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Plus, MessageSquare, Search, Heart, User as UserIcon, ShieldCheck } from 'lucide-react';
import NavigationDrawer from './NavigationDrawer';
import { useAuth } from '@/context/AuthContext';

export default function MarketplaceHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Subtle brown accent bar at the very top */}
      <div className="h-[3px] w-full bg-amber-800" />

      {/* Sticky Clean Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Hamburger Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-gray-50 transition-colors btn-tactile flex items-center gap-2 group"
                aria-label="Open menu drawer"
              >
                <Menu className="w-5 h-5 text-slate-700 group-hover:text-blue-600" />
                <span className="hidden sm:inline-block text-xs font-medium text-slate-500 group-hover:text-blue-600">
                  Menu
                </span>
              </button>
            </div>

            {/* Center: Branding (Clean, slightly bold, centered sans-serif) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <Link 
                href="/home" 
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors inline-block"
              >
                Technologia
              </Link>
            </div>

            {/* Right: Clean Quick Actions (Compare / Saved / Messages / Dashboard / Post Ad) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/compare"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 text-xs font-semibold shadow-2xs transition-colors"
                title="GSMArena-style Comparison Engine"
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Compare</span>
              </Link>

              <Link
                href="/dashboard/saved"
                className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-gray-50 transition-colors"
                title="Saved Items"
              >
                <Heart className="w-4 h-4" />
              </Link>

              <Link
                href="/messages"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>

              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg border border-gray-200 hover:border-blue-600 bg-gray-50/70 text-slate-800 text-xs font-semibold transition-colors"
                  title="Your Dashboard"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[80px] truncate">
                    {user.name}
                  </span>
                  {user.isVerifiedShop && (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-800 hidden sm:inline-block" />
                  )}
                </Link>
              ) : (
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              <Link
                href="/post-ad"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors btn-tactile"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Ad</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
