'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw,
  Inbox,
  Check,
  Smartphone,
  Laptop,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { formatPKR, PAKISTANI_CITIES, PTA_STATUSES } from '@/lib/utils';

interface ListingsCatalogViewProps {
  initialCategory?: 'LAPTOP' | 'PHONE' | 'ALL';
  lockCategory?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function ListingsCatalogView({
  initialCategory = 'ALL',
  lockCategory = false,
  pageTitle,
  pageSubtitle,
}: ListingsCatalogViewProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'LAPTOP' | 'PHONE' | 'ALL'>(initialCategory);
  const [itemType, setItemType] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [ptaStatus, setPtaStatus] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [condition, setCondition] = useState('ALL');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [selectedRam, setSelectedRam] = useState<number | 'ALL'>('ALL');
  const [selectedStorage, setSelectedStorage] = useState<string>('ALL');
  const [sort, setSort] = useState('latest');

  // Collapsible Filter Sheet state (closed by default for maximum whitespace)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Count active non-default filters
  const activeFiltersCount = [
    (!lockCategory && category !== 'ALL'),
    itemType !== 'ALL',
    selectedBrand !== 'ALL',
    (category !== 'LAPTOP' && ptaStatus !== 'ALL'),
    selectedRam !== 'ALL',
    selectedStorage !== 'ALL',
    city !== 'ALL',
    condition !== 'ALL',
    maxPrice < 300000,
  ].filter(Boolean).length;

  const fetchListings = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (category !== 'ALL') query.set('category', category);
      if (itemType !== 'ALL') query.set('itemType', itemType);
      if (selectedBrand !== 'ALL') query.set('brand', selectedBrand);
      if (ptaStatus !== 'ALL') query.set('ptaStatus', ptaStatus);
      if (city !== 'ALL') query.set('city', city);
      if (condition !== 'ALL') query.set('condition', condition);
      if (minPrice > 0) query.set('minPrice', minPrice.toString());
      if (maxPrice < 300000) query.set('maxPrice', maxPrice.toString());
      if (selectedRam !== 'ALL') query.set('ramGB', selectedRam.toString());
      if (selectedStorage !== 'ALL') query.set('storage', selectedStorage);
      if (sort) query.set('sort', sort);

      const res = await fetch(`/api/listings?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
        if (data.savedIds && Array.isArray(data.savedIds)) {
          setSavedIds(data.savedIds);
        }
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, itemType, selectedBrand, ptaStatus, city, condition, minPrice, maxPrice, selectedRam, selectedStorage, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const [saveToast, setSaveToast] = useState('');

  const handleSaveSearch = async () => {
    const parts = [];
    if (category !== 'ALL') parts.push(category === 'LAPTOP' ? 'Laptop' : 'Phone');
    if (selectedBrand !== 'ALL') parts.push(selectedBrand);
    if (selectedRam !== 'ALL') parts.push(`${selectedRam}GB RAM`);
    if (selectedStorage !== 'ALL') parts.push(selectedStorage);
    if (city !== 'ALL') parts.push(city);
    if (search.trim()) parts.push(`"${search}"`);
    const name = parts.length > 0 ? parts.join(' • ') : 'Hardware Search Alert';

    const criteria = {
      category,
      brand: selectedBrand,
      ram: selectedRam !== 'ALL' ? selectedRam : undefined,
      storage: selectedStorage !== 'ALL' ? selectedStorage : undefined,
      city: city !== 'ALL' ? city : undefined,
      maxPrice: maxPrice < 300000 ? maxPrice : undefined,
      search: search.trim() || undefined,
    };

    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, criteria, targetType: 'LISTING' }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveToast(`Alert activated for "${name}". Check /dashboard to simulate notifications.`);
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
    setItemType('ALL');
    setSelectedBrand('ALL');
    setPtaStatus('ALL');
    setCity('ALL');
    setCondition('ALL');
    setMinPrice(0);
    setMaxPrice(300000);
    setSelectedRam('ALL');
    setSelectedStorage('ALL');
    setSort('latest');
  };

  // Supported brands depending on category
  const phoneBrands = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Huawei', 'Nothing'];
  const laptopBrands = ['Apple', 'Dell', 'Lenovo', 'HP', 'Asus', 'Acer', 'Google'];
  const displayBrands = category === 'PHONE' 
    ? phoneBrands 
    : category === 'LAPTOP' 
    ? laptopBrands 
    : Array.from(new Set([...phoneBrands, ...laptopBrands]));

  // Strict RAM & Storage options based on category
  const ramFilterOptions = category === 'PHONE'
    ? [4, 6, 8, 12, 16]
    : [8, 16, 24, 32, 64];

  const storageFilterOptions = category === 'PHONE'
    ? ['64GB', '128GB', '256GB', '512GB', '1TB']
    : ['256GB', '512GB', '1TB', '2TB'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {pageTitle || (category === 'LAPTOP' ? 'Laptops & Parts Catalog' : category === 'PHONE' ? 'Mobile Phones Catalog' : 'Tech Hardware Marketplace')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {pageSubtitle || 'Verified devices with locked specs in Hafeez Centre, Saddar, and Blue Area.'}
          </p>
        </div>

        {/* Action Controls: Search & Filter Options Button */}
        <div className="flex items-center gap-2">
          {/* Save Search Button */}
          <button
            onClick={handleSaveSearch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-xs transition-colors"
            title="Save active search filters as stock alert"
          >
            <Bell className="w-3.5 h-3.5 text-amber-800" />
            <span className="hidden sm:inline">Save this Search</span>
            <span className="sm:hidden">Save</span>
          </button>

          {/* Filter Options Drawer Button */}
          <button
            onClick={() => setFilterSheetOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-all ${
              activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-600 text-blue-700'
                : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Filter Options</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Save Search Confirmation Toast */}
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

      {/* Search Bar & Active Filters Pill Row */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model, specs, or part number (e.g. S22 Ultra, T480, 01AV421)..."
              className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs font-medium"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="latest">Latest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

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
            {itemType !== 'ALL' && (
              <span className="rounded-full bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1">
                {itemType === 'SPARE_PART' ? 'Spare Parts' : 'Complete Units'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setItemType('ALL')} />
              </span>
            )}
            {selectedBrand !== 'ALL' && (
              <span className="rounded-full bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 font-medium flex items-center gap-1">
                Brand: {selectedBrand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('ALL')} />
              </span>
            )}
            {selectedRam !== 'ALL' && (
              <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 font-medium border border-blue-100 flex items-center gap-1 font-mono">
                {selectedRam}GB RAM
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRam('ALL')} />
              </span>
            )}
            {selectedStorage !== 'ALL' && (
              <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 font-medium border border-blue-100 flex items-center gap-1 font-mono">
                {selectedStorage}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStorage('ALL')} />
              </span>
            )}
            {category !== 'LAPTOP' && ptaStatus !== 'ALL' && (
              <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 font-medium border border-emerald-200 flex items-center gap-1">
                {ptaStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPtaStatus('ALL')} />
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

      {/* Main Full-Width Product Grid (2 Horizontal Columns on Desktop) */}
      <main>
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                isSavedInitial={savedIds.includes(listing.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-gray-200/80 space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No listings match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your price range, RAM, or location filters to see more verified hardware.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* COLLAPSIBLE FILTER OPTIONS SHEET DRAWER */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setFilterSheetOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-drawer-in border-l border-gray-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Filter Options ({activeFiltersCount} Active)
                </h3>
              </div>
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-5 space-y-6 flex-1">
              {/* Category (Hidden if page context is locked) */}
              {!lockCategory && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Device Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'LAPTOP', label: 'Laptops' },
                      { id: 'PHONE', label: 'Phones' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id as any)}
                        className={`p-2 rounded-lg text-xs font-semibold transition-colors border ${
                          category === c.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Type: Unit vs Part */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Listing Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'COMPLETE_UNIT', label: 'Complete Unit' },
                    { id: 'SPARE_PART', label: 'Spare Parts' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setItemType(t.id)}
                      className={`p-2 rounded-lg text-xs font-semibold transition-colors border ${
                        itemType === t.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Brand ({displayBrands.length} Supported)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedBrand('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedBrand === 'ALL'
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    All Brands
                  </button>
                  {displayBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedBrand === b
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strict RAM Filter (Context-Aware for Phone vs Laptop) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block flex items-center justify-between">
                  <span>RAM Configuration</span>
                  <span className="text-[10px] text-slate-400">
                    {category === 'PHONE' ? 'Factory Phone RAM' : 'Laptop Installed RAM'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedRam('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      selectedRam === 'ALL'
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Any RAM
                  </button>
                  {ramFilterOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRam(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        selectedRam === r
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {r}GB
                    </button>
                  ))}
                </div>
              </div>

              {/* Strict Storage Filter (Context-Aware for Phone vs Laptop) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block flex items-center justify-between">
                  <span>Storage Capacity</span>
                  <span className="text-[10px] text-slate-400">ROM / Internal SSD</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedStorage('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      selectedStorage === 'ALL'
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Any Storage
                  </button>
                  {storageFilterOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStorage(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        selectedStorage === s
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* PTA Status (Phones Only) */}
              {category !== 'LAPTOP' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    PTA Tax Status (Mobile Phones)
                  </label>
                  <select
                    value={ptaStatus}
                    onChange={(e) => setPtaStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ALL">All PTA Statuses</option>
                    {PTA_STATUSES.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* City Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  City / Tech Plaza
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

              {/* Max Budget Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800">Max Budget</label>
                  <span className="font-mono font-bold text-blue-600">
                    {formatPKR(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={300000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>PKR 5K</span>
                  <span>PKR 300K+</span>
                </div>
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
                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
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
