'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Search, 
  SlidersHorizontal, 
  AlertTriangle, 
  X, 
  RotateCcw,
  Bell,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { PAKISTANI_CITIES } from '@/lib/utils';
import SourcingRequestCard from '@/components/features/SourcingRequestCard';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PartRequestWithRelations } from '@/types';

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
  const [requests, setRequests] = useState<PartRequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'LAPTOP' | 'PHONE' | 'ALL'>(initialCategory);
  const [urgency, setUrgency] = useState('ALL');
  const [city, setCity] = useState('ALL');

  // Filter Sheet
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [saveToast, setSaveToast] = useState('');

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
    } catch {
      toast.error('Error fetching requests');
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
        toast.success(`Sourcing alert saved: ${name}`);
        setSaveToast(`Sourcing alert saved for "${name}". Check /dashboard to simulate alerts.`);
        setTimeout(() => setSaveToast(''), 4500);
      } else {
        toast.error(data.error || 'Failed to save search');
      }
    } catch {
      toast.error('Error saving search');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    if (!lockCategory) setCategory('ALL');
    setUrgency('ALL');
    setCity('ALL');
  };

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
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {computedTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {computedSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/requests/new">
            <Button variant="primary" size="md" className="bg-amber-800 hover:bg-amber-900 text-white">
              <Plus className="w-4 h-4 mr-1" />
              <span>Post Request</span>
            </Button>
          </Link>

          <button
            onClick={handleSaveSearch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs transition-colors"
            title="Save active search filters as stock alert"
          >
            <Bell className="w-3.5 h-3.5 text-amber-800" />
            <span className="hidden sm:inline">Save Alert</span>
          </button>

          <button
            onClick={() => setFilterSheetOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all ${
              activeFiltersCount > 0
                ? 'bg-amber-50 border-amber-800 text-amber-900'
                : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-800" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-800 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-800 flex-shrink-0" />
            <span className="font-semibold">{saveToast}</span>
          </div>
          <Link href="/dashboard?tab=alerts" className="font-bold underline text-amber-900 text-xs flex-shrink-0">
            Open Alerts &rarr;
          </Link>
        </div>
      )}

      {/* Search Bar */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part names, models, or codes (e.g. T480 screen, S23 Ultra AMOLED, 01AV421)..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800 shadow-2xs font-medium"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg shadow-2xs"
          >
            Search
          </button>
        </form>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Active:</span>

            {!lockCategory && category !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200 font-medium">
                {category === 'LAPTOP' ? 'Laptops' : 'Phones'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('ALL')} />
              </span>
            )}

            {urgency !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                {urgency}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setUrgency('ALL')} />
              </span>
            )}

            {city !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium">
                {city}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCity('ALL')} />
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] text-red-600 hover:text-red-700 underline font-medium ml-2 flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Requests List */}
      <main className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-900">
            {requests.length} Active Sourcing Requests
          </span>
          <span>Click &ldquo;Offer Part&rdquo; to submit your quote</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 h-48 space-y-4 shadow-2xs">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-14 w-full" />
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {requests.map((req) => (
              <SourcingRequestCard
                key={req.id}
                request={req}
                onQuoteAdded={() => fetchRequests()}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No requests match your selected filters"
            description="Try adjusting your filter options, or post a new sourcing request to get quotes from shopkeepers."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        )}
      </main>

      {/* Slide-out Optional Filter Sheet */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" 
            onClick={() => setFilterSheetOpen(false)} 
          />

          <div className="relative z-10 w-88 max-w-[90vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
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

            <div className="p-5 space-y-6 flex-1 text-xs">
              {!lockCategory && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'LAPTOP', label: 'Laptops' },
                      { id: 'PHONE', label: 'Phones' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id as 'LAPTOP' | 'PHONE' | 'ALL')}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          category === c.id
                            ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                            : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Urgency Level</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'ALL', label: 'Any Urgency' },
                    { id: 'Urgent / Immediate', label: 'Urgent / Immediate' },
                    { id: 'Flexible', label: 'Flexible' },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        urgency === u.id
                          ? 'bg-amber-50 text-amber-900 border-amber-800 font-bold'
                          : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800 shadow-2xs"
                >
                  <option value="ALL">All Cities (Pakistan)</option>
                  {PAKISTANI_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                className="bg-amber-800 hover:bg-amber-900 text-white"
                onClick={() => setFilterSheetOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
