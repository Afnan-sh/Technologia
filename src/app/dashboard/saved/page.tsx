'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Bell, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft, 
  Bookmark,
  ShoppingBag,
  Inbox
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import ListingCard from '@/components/ListingCard';
import { formatPKR } from '@/lib/utils';

export default function UnifiedSavedHubPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[] | null>(null);

  const loadSavedData = async () => {
    setLoading(true);
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
    } catch (e) {
      console.error('Error loading saved hub data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedData();
  }, [user?.id]);

  const handleDeleteSearch = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== id));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60 font-mono mb-2">
              <Bookmark className="w-3.5 h-3.5 text-red-600" />
              <span>SAVED HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saved Items & Search Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your bookmarks, saved hardware listings, and automated inventory search criteria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/buy/mobiles"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 transition-colors shadow-2xs"
            >
              Browse Mobiles
            </Link>
            <Link
              href="/buy/laptops"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 transition-colors shadow-2xs"
            >
              Browse Laptops
            </Link>
          </div>
        </div>
      </div>

      {/* Unified Tabs Switcher */}
      <Tabs defaultValue="saved-items" className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1 border border-gray-200">
          <TabsTrigger value="saved-items" className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Saved Items ({savedListings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="saved-searches" className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Saved Searches & Alerts ({savedSearches.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Saved Items */}
        <TabsContent value="saved-items">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 h-40 animate-pulse flex gap-4">
                  <div className="w-36 h-full bg-gray-100 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-5 bg-gray-100 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : savedListings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {savedListings.map((listing: any) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  isSavedInitial={true} 
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-gray-200/80 space-y-3">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No saved items yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap the heart icon on any laptop, phone, or spare part card in the marketplace to bookmark it here for quick access.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/buy/mobiles"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Explore Mobiles
                </Link>
                <Link
                  href="/buy/laptops"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Explore Laptops
                </Link>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Saved Searches */}
        <TabsContent value="saved-searches" className="space-y-4">
          {/* Alert Simulation Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Automated Hardware Match Alerts</span>
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

          {/* Simulation Output Banner */}
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
                        href={s.targetType === 'REQUEST' ? '/requests' : '/buy/mobiles'}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-slate-700 hover:bg-gray-50 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Results</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteSearch(s.id)}
                        className="p-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete saved search"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-gray-200/80 space-y-3">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No saved searches or alerts</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Set up search filters on the catalog (e.g. &ldquo;ThinkPad 16GB in Lahore&rdquo;) and tap &ldquo;Save this Search&rdquo; to receive automatic notifications.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
