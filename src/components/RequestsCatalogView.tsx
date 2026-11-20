'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PartRequestCard from '@/components/PartRequestCard';
import { 
  Target, 
  Search, 
  SlidersHorizontal, 
  AlertTriangle, 
  X, 
  Inbox,
  RotateCcw,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { PAKISTANI_CITIES } from '@/lib/utils';

interface RequestsCatalogViewProps {
  initialCategory?: 'LAPTOP' | 'PHONE' | 'ALL';
  lockCategory?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function RequestsCatalogView({
  initialCategory = 'ALL',
  lockCategory = false,
  pageTitle,
  pageSubtitle,
}: RequestsCatalogViewProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'LAPTOP' | 'PHONE' | 'ALL'>(initialCategory);
  const [urgency, setUrgency] = useState('ALL');
  const [city, setCity] = useState('ALL');

  // Collapsible Filter Sheet (closed by default)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Count active non-default filters
  const activeFiltersCount = [
    (!lockCategory && category !== 'ALL'),
    urgency !== 'ALL',
    city !== 'ALL',
  ].filter(Boolean).length;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (category !== 'ALL') query.set('category', category);
      if (urgency !== 'ALL') query.set('urgency', urgency);
      if (city !== 'ALL') query.set('city', city);

      const res = await fetch(`/api/requests?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [category, urgency, city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const [saveToast, setSaveToast] = useState('');

  const handleSaveSearch = async () => {
    const parts = [];
    if (category !== 'ALL') parts.push(category === 'LAPTOP' ? 'Laptop Parts' : 'Phone Parts');
    if (urgency !== 'ALL') parts.push(urgency);
    if (city !== 'ALL') parts.push(city);
    if (search.trim()) parts.push(`"${search}"`);
    const name = parts.length > 0 ? parts.join(' • ') : 'Parts Sourcing Alert';

    const criteria = {
      category,
      urgency: urgency !== 'ALL' ? urgency : undefined,
      city: city !== 'ALL' ? city : undefined,
      search: search.trim() || undefined,
    };

    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, criteria, targetType: 'REQUEST' }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveToast(`Sourcing alert saved for "${name}". Check /dashboard to simulate alerts.`);
        setTimeout(() => setSaveToast(''), 4500);
      } else {
        alert(data.error || 'Failed to save search');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving search');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    if (!lockCategory) setCategory('ALL');
    setUrgency('ALL');
    setCity('ALL');
  };

  // Dynamic titles based on context
  const computedTitle = pageTitle || (
    category === 'LAPTOP'
      ? 'Laptop Parts Sourcing Requests'
      : category === 'PHONE'
      ? 'Mobile Phone Parts Sourcing Requests'
      : 'View Parts Sourcing Requests'
  );

  const computedSubtitle = pageSubtitle || (
    category === 'LAPTOP'
      ? 'Browse active requests for ThinkPad, Dell, and HP screens, batteries, keyboards, and motherboards'
      : category === 'PHONE'
      ? 'Browse active requests for iPhone, Samsung, and Pixel screens, camera flexes, and ports'
      : 'Browse items buyers are actively looking to source. Inspect specs and pitch offers directly.'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner - Note: Strictly NO "Post Sourcing Request" button here */}
      <div className="border-b border-gray-100 pb-5 space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 font-mono mb-2">
            <Target className="w-3.5 h-3.5 text-amber-800" />
            <span>SOURCING & REQUESTS CENTRE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {computedTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {computedSubtitle}
          </p>
        </div>

        {/* Search & Filter Options Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search part name, OEM SKU (e.g. 01AV421, LP140WF3), model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchRequests();
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filter Options Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 shadow-2xs transition-colors"
              title="Save active sourcing request filters"
            >
              <Bell className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">Save this Search</span>
              <span className="sm:hidden">Save</span>
            </button>

            <button
              onClick={() => setFilterSheetOpen(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all btn-tactile ${
                activeFiltersCount > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-800 shadow-2xs'
                  : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
              }`}
              aria-label="Toggle Filter Options"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-800" />
              <span>Filter Options</span>
              {activeFiltersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-800 text-white text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Save Toast Banner */}
        {saveToast && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-800 flex-shrink-0" />
              <span className="font-semibold">{saveToast}</span>
            </div>
            <Link href="/dashboard?tab=alerts" className="font-bold underline text-amber-900 text-xs flex-shrink-0">
              Open Alerts &rarr;
            </Link>
          </div>
        )}

        {/* Active Filters Summary Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Applied:</span>
            {!lockCategory && category !== 'ALL' && (
              <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 font-medium border border-blue-100 flex items-center gap-1">
                {category === 'LAPTOP' ? 'Laptops' : 'Phones'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('ALL')} />
              </span>
            )}
            {urgency !== 'ALL' && (
              <span className="rounded-full bg-amber-50 text-amber-800 text-xs px-2.5 py-0.5 font-medium border border-amber-200/60 flex items-center gap-1">
                Urgent Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setUrgency('ALL')} />
              </span>
            )}
            {city !== 'ALL' && (
              <span className="rounded-full bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1">
                {city}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCity('ALL')} />
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-slate-400 hover:text-red-600 text-xs font-semibold ml-1 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Requests List (Full Width by default) */}
      <main className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-900">
            {requests.length} Active Sourcing Requests
          </span>
          <span>Click &ldquo;Offer Part&rdquo; to submit your quote</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 h-36 animate-pulse"></div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {requests.map((req) => (
              <PartRequestCard
                key={req.id}
                request={req}
                onQuoteAdded={() => fetchRequests()}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl p-8 space-y-3">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No requests match your selected filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your filter options to see all requests.
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-gray-100 text-xs font-semibold text-slate-700 hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Slide-out Optional Filter Sheet */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" 
            onClick={() => setFilterSheetOpen(false)} 
          />

          <div className="relative ml-auto z-10 w-88 max-w-[90vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-gray-200 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-800" />
                <h3 className="text-sm font-bold text-slate-900">Request Filters</h3>
              </div>
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              {/* Context-Aware: Only show Category Selector if NOT locked by dedicated page */}
              {!lockCategory && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Device Category
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'LAPTOP', label: 'Laptops' },
                      { id: 'PHONE', label: 'Phones' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          category === cat.id
                            ? 'bg-blue-50 text-blue-700 border-blue-600'
                            : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Urgency Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Urgency Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUrgency('ALL')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      urgency === 'ALL'
                        ? 'bg-blue-50 text-blue-700 border-blue-600'
                        : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    All Urgencies
                  </button>
                  <button
                    onClick={() => setUrgency(urgency === 'Urgent / Immediate' ? 'ALL' : 'Urgent / Immediate')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      urgency === 'Urgent / Immediate'
                        ? 'bg-amber-50 text-amber-800 border-amber-800 font-bold'
                        : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                    <span>Urgent Only</span>
                  </button>
                </div>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  City / Plaza
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">All Pakistan Cities</option>
                  {PAKISTANI_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
