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
  Trash2, 
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ListingCard from '@/components/features/ListingCard';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPKR, formatRelativeTime } from '@/lib/utils';
import { ListingWithRelations } from '@/types';

interface SavedSearchItem {
  id: string;
  name: string;
  criteria: string;
  targetType: string;
  alertEmail: boolean;
  createdAt: string | Date;
}

interface SimulationResultItem {
  name: string;
  matchCount: number;
  simulatedAlert: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'saved' | 'alerts' | 'listings' | 'reviews') || 'saved';

  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'alerts' | 'listings' | 'reviews'>(initialTab);

  const [savedListings, setSavedListings] = useState<ListingWithRelations[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [myListings, setMyListings] = useState<ListingWithRelations[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResultItem[] | null>(null);
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
    } catch {
      toast.error('Error loading dashboard data');
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
        toast.success('Search alert deleted');
      } else {
        toast.error('Failed to delete search alert');
      }
    } catch {
      toast.error('Network error deleting alert');
    }
  };

  const handleRunAlertSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/alerts/check');
      const data = await res.json();
      if (data.success && data.alerts) {
        setSimulationResults(data.alerts);
        toast.success('Simulation complete: Checked active listings');
      }
    } catch {
      toast.error('Error running alert simulation');
    } finally {
      setSimulating(false);
    }
  };

  const stats = user?.stats || {
    trustScore: 100,
    reviewCount: 0,
    itemAsDescribedPct: 100,
    avgCommunication: 5.0,
    cleanFaultsPct: 100,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Overview Profile Card */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {user?.name || 'Technologia Member'}
                </h1>
                {user?.isVerifiedShop && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                    <span>Verified Plaza Shop</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.city || 'Lahore'}</span>
                  {user?.shopAddress && <span>&bull; {user.shopAddress}</span>}
                </span>
                <span>&bull;</span>
                <span className="font-mono text-slate-600">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href="/post-ad"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Ad</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-3 flex items-center gap-2 transition-all ${
            activeTab === 'saved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Saved Listings ({savedListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-3 flex items-center gap-2 transition-all ${
            activeTab === 'alerts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Stock Alerts ({savedSearches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-3 flex items-center gap-2 transition-all ${
            activeTab === 'listings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>My Ads ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3 flex items-center gap-2 transition-all ${
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
          {loadingData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 h-40 flex gap-4">
                  <Skeleton className="w-36 h-full rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <Skeleton className="h-5 w-2/3 rounded-lg" />
                    <Skeleton className="h-3 w-1/3 rounded-lg" />
                    <Skeleton className="h-6 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : savedListings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {savedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} isSavedInitial={true} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No Saved Items Yet"
              description="Browse the marketplace and click the heart icon on any ad to bookmark it here for fast access."
              actionHref="/buy"
              actionLabel="Browse Laptops & Phones"
            />
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>{simulating ? 'Checking Ads...' : 'Run Simulation: Check New Ads'}</span>
            </button>
          </div>

          {/* Simulation Output Banner */}
          {simulationResults && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Simulation Complete: Checked Against Active Marketplace Listings</span>
              </div>
              <div className="space-y-1.5">
                {simulationResults.map((r, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-start justify-between gap-3 shadow-2xs">
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
                let parsedCriteria: Record<string, unknown> = {};
                try {
                  parsedCriteria = typeof s.criteria === 'string' ? JSON.parse(s.criteria) : s.criteria;
                } catch {
                  parsedCriteria = {};
                }

                return (
                  <div
                    key={s.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {s.targetType}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Created {formatRelativeTime(s.createdAt)}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[10px]">
                          Match Alerts Active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={s.targetType === 'REQUEST' ? '/requests' : '/listings'}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Open catalog with these filters"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
            <EmptyState
              icon={Bell}
              title="No Saved Search Alerts"
              description="Filter devices on the Buy or Sourcing page and click 'Save this Search' to receive simulated stock alerts."
              actionHref="/buy"
              actionLabel="Explore Catalog"
            />
          )}
        </div>
      )}

      {/* TAB 3: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="No Listings Posted Yet"
              description="Post your laptop, mobile phone, or spare part to reach thousands of Pakistani tech buyers."
              actionHref="/post-ad"
              actionLabel="Create an Ad"
            />
          )}
        </div>
      )}

      {/* TAB 4: REPUTATION BREAKDOWN */}
      {activeTab === 'reviews' && (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 space-y-6 shadow-2xs">
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
