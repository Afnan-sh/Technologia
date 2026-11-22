'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, 
  ChevronDown, 
  ChevronRight, 
  ShoppingBag, 
  Tag, 
  Target, 
  ListFilter, 
  Smartphone, 
  Laptop, 
  Home, 
  MessageSquare, 
  LogOut,
  ExternalLink,
  Heart,
  ShieldCheck,
  User as UserIcon,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // State for expandable accordions (all 4 modes default open or togglable)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    buy: true,
    sell: false,
    request: false,
    viewRequests: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Soft Backdrop Overlay with blur */}
      <div 
        className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-drawer-in border-r border-gray-100">
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link 
            href="/home" 
            onClick={onClose}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-blue-700 transition-colors">
              T
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                Technologia
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Tech Marketplace & Sourcing
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Body */}
        <div className="p-4 space-y-4 flex-1">
          {/* Quick Home Link */}
          <Link
            href="/home"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/home'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span>Marketplace Home</span>
          </Link>

          <div className="pt-1 border-t border-gray-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Marketplace Modes
            </span>

            {/* 1. BUY */}
            <div className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('buy')}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <span>1. Buy</span>
                </div>
                {expandedSections.buy ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.buy && (
                <div className="pl-9 pr-3 py-1 space-y-1 bg-gray-50/50 rounded-b-lg">
                  <Link
                    href="/buy/phones"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile Phones</span>
                  </Link>
                  <Link
                    href="/buy/laptops"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>Laptops</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. SELL */}
            <div className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('sell')}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span>2. Sell</span>
                </div>
                {expandedSections.sell ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.sell && (
                <div className="pl-9 pr-3 py-1 space-y-1 bg-gray-50/50 rounded-b-lg">
                  <Link
                    href="/post-ad?category=PHONE"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sell Mobile Phone</span>
                  </Link>
                  <Link
                    href="/post-ad?category=LAPTOP"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sell Laptop</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. REQUEST (Post a Request) */}
            <div className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('request')}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span>3. Request</span>
                </div>
                {expandedSections.request ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.request && (
                <div className="pl-9 pr-3 py-1 space-y-1 bg-gray-50/50 rounded-b-lg">
                  <Link
                    href="/requests/new?category=PHONE"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-amber-800 hover:bg-white rounded-md transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Request Phone / Part</span>
                  </Link>
                  <Link
                    href="/requests/new?category=LAPTOP"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-amber-800 hover:bg-white rounded-md transition-colors"
                  >
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>Request Laptop / Part</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. VIEW REQUESTS (Browse Requests) */}
            <div className="rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('viewRequests')}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center">
                    <ListFilter className="w-3.5 h-3.5" />
                  </div>
                  <span>4. View Requests</span>
                </div>
                {expandedSections.viewRequests ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.viewRequests && (
                <div className="pl-9 pr-3 py-1 space-y-1 bg-gray-50/50 rounded-b-lg">
                  <Link
                    href="/requests/phones"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Part Requests</span>
                  </Link>
                  <Link
                    href="/requests/laptops"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>Laptop Part Requests</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Additional Utilities */}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>My Dashboard</span>
              </div>
              {user?.isVerifiedShop && (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
              )}
            </Link>

            <Link
              href="/dashboard/saved"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Saved Items</span>
              </div>
            </Link>

            <Link
              href="/dashboard?tab=alerts"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-800" />
                <span>Saved Searches & Alerts</span>
              </div>
            </Link>

            <Link
              href="/compare"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/compare'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Compare Engine (10-Yr)</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
                Bench
              </span>
            </Link>

            <Link
              href="/messages"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/messages'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Direct Messages</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
                Chat
              </span>
            </Link>

            <Link
              href="/listings"
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/listings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              <ListFilter className="w-4 h-4 text-slate-500" />
              <span>Browse All Listings</span>
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Local Tech Marketplace</span>
            <span className="font-medium text-amber-800">Pakistan</span>
          </div>

          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-600 transition-colors pt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Return to Welcome Screen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
