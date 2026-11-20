'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Heart, 
  Bell, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  User as UserIcon, 
  Plus, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ListingCard from '@/components/ListingCard';
import { formatPKR, formatRelativeTime } from '@/lib/utils';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'saved';

  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'alerts' | 'listings' | 'reviews'>(initialTab as any);

  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [simulationResults, setSimulationResults] = useState<any[] | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch saved listings
      const resSaved = await fetch('/api/saved');
      const dataSaved = await resSaved.json();
      if (dataSaved.success && dataSaved.savedListings) {
        setSavedListings(dataSaved.savedListings);
      }

      // 2. Fetch saved searches
      const resSearches = await fetch('/api/saved-searches');
      const dataSearches = await resSearches.json();
      if (dataSearches.success && dataSearches.savedSearches) {
        setSavedSearches(dataSearches.savedSearches);
      }

      // 3. Fetch user listings
      if (user?.id) {
        const resUser = await fetch(`/api/users/${user.id}`);
        const dataUser = await resUser.json();
        if (dataUser.success && dataUser.user?.listings) {
          setMyListings(dataUser.user.listings);
        }
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const handleDeleteSearch = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSavedSearches(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) {
      console.error('Error deleting search:', e);
    }
  };

  const handleRunAlertSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/alerts/check');
      const data = await res.json();
      if (data.success && data.alerts) {
        setSimulationResults(data.alerts);
      }
    } catch (e) {
      console.error('Error running alert simulation:', e);
    } finally {
      setSimulating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading user session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900">Sign in to view your Dashboard</h2>
        <p className="text-xs text-slate-500">
          Access your saved products, saved search alerts, active listings, and reputation reviews.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          Sign In / Select Demo Account
        </Link>
      </div>
    );
  }

  const isVerifiedShop = user.isVerifiedShop || user.role === 'SHOPKEEPER';
  const stats = user.stats || {
    trustScore: 100,
    reviewCount: 0,
    itemAsDescribedPct: 100,
    avgCommunication: 5.0,
    cleanFaultsPct: 100,
    itemsSold: 0,
    itemsBought: 0,
    activeListingsCount: 0,
    sourcingRequestsCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* User Dashboard Header Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shadow-2xs">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isVerifiedShop && (
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-800 text-white rounded-lg shadow-xs border-2 border-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                {isVerifiedShop && user.shopName ? user.shopName : user.name}
              </h1>
              {isVerifiedShop ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                  <ShieldCheck className="w-3 h-3 text-amber-800" />
                  <span>Verified Shop</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span>Standard Enthusiast</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {user.email} &bull; {user.city}
              {isVerifiedShop && user.shopAddress && ` &bull; ${user.shopAddress}`}
            </p>
          </div>
        </div>

        {/* Quick Reputation & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="font-mono font-extrabold text-sm text-slate-900">
                {stats.trustScore}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {stats.reviewCount} Review{stats.reviewCount === 1 ? '' : 's'}
            </span>
          </div>

          <Link
            href={`/profile/${user.id}`}
            className="px-3.5 py-2 rounded-xl border border-gray-200 hover:border-blue-600 bg-white text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors shadow-2xs"
          >
            View Public Profile
          </Link>

          <Link
            href="/post-ad"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 btn-tactile"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Ad</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'saved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Saved Items ({savedListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Saved Searches & Alerts ({savedSearches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'listings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>My Listings ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>My Reputation</span>
        </button>
      </div>

      {/* TAB 1: SAVED ITEMS (BOOKMARKS) */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedListings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {savedListings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} isSavedInitial={true} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-gray-200 space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Saved Items Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Browse the marketplace and click the heart icon on any ad to bookmark it here for fast access.
              </p>
              <Link
                href="/buy"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
              >
                <span>Browse Laptops & Phones</span> &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED SEARCHES & ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Automated Ad Match Alerts</span>
              </div>
              <p className="text-[11px] text-blue-700/80 mt-0.5">
                Whenever you filter items on /buy or /requests, click &ldquo;Save this Search&rdquo; to track incoming inventory.
              </p>
            </div>

            <button
              onClick={handleRunAlertSimulation}
              disabled={simulating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>{simulating ? 'Checking Ads...' : 'Run Simulation: Check New Ads'}</span>
            </button>
          </div>

          {/* Simulation Output Banner if run */}
          {simulationResults && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Simulation Complete: Checked Against Active Marketplace Listings</span>
              </div>
              <div className="space-y-1.5">
                {simulationResults.map((r, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-800">{r.name}</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">{r.simulatedAlert}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {r.matchCount} Matches
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List of Saved Searches */}
          {savedSearches.length > 0 ? (
            <div className="space-y-3">
              {savedSearches.map((s) => {
                let criteria: any = {};
                try {
                  criteria = JSON.parse(s.criteria);
                } catch {
                  criteria = {};
                }

                return (
                  <div
                    key={s.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {s.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                          {s.targetType} ALERT
                        </span>
                      </div>

                      {/* Criteria tags */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        {criteria.category && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            Category: {criteria.category}
                          </span>
                        )}
                        {criteria.brand && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            Brand: {criteria.brand}
                          </span>
                        )}
                        {criteria.ram && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                            RAM: {criteria.ram}GB
                          </span>
                        )}
                        {criteria.city && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            City: {criteria.city}
                          </span>
                        )}
                        {criteria.maxPrice && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                            Max: {formatPKR(criteria.maxPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/buy?category=${criteria.category || 'ALL'}&brand=${criteria.brand || 'ALL'}`}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-blue-600 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        <span>View Results</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleDeleteSearch(s.id)}
                        title="Delete alert"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-gray-200 space-y-3">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Saved Search Alerts</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Filter devices on the Buy or Sourcing page and click &ldquo;Save this Search&rdquo; to receive simulated stock alerts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myListings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-gray-200 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Listings Posted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Post your laptop, mobile phone, or spare part to reach thousands of Pakistani tech buyers.
              </p>
              <Link
                href="/post-ad"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
              >
                <span>Create an Ad</span> &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REPUTATION BREAKDOWN */}
      {activeTab === 'reviews' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Your Trust Score & Reputation Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated transparently across every meetup and inspection review
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-3 py-1 rounded-xl text-amber-950 font-mono font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{stats.trustScore}% Score</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-200/60">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Item as Described
              </span>
              <span className="text-lg font-black text-slate-900 mt-1 block font-mono">
                {stats.itemAsDescribedPct || 100}%
              </span>
              <span className="text-[10px] text-slate-500">Matching advertised specs</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-200/60">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Communication Rating
              </span>
              <span className="text-lg font-black text-slate-900 mt-1 block font-mono">
                {stats.avgCommunication || 5.0} / 5.0
              </span>
              <span className="text-[10px] text-slate-500">Punctuality and responses</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-200/60">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Undisclosed Faults
              </span>
              <span className="text-lg font-black text-slate-900 mt-1 block font-mono">
                {stats.cleanFaultsPct || 100}% Clean
              </span>
              <span className="text-[10px] text-slate-500">Zero hidden defects found</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
