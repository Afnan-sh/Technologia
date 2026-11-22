'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw,
  Smartphone,
  Laptop,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPKR } from '@/lib/utils';
import ListingCard from '@/components/features/ListingCard';
import { FilterSidebar } from '@/components/features/FilterSidebar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingWithRelations } from '@/types';

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
  const [listings, setListings] = useState<ListingWithRelations[]>([]);
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

  // Filter Sheet state
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [saveToast, setSaveToast] = useState('');

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
      }
    } catch {
      toast.error('Failed to load listings');
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

  const handleSaveSearch = async () => {
    const parts = [];
    if (!lockCategory && category !== 'ALL') parts.push(category === 'LAPTOP' ? 'Laptops' : 'Phones');
    if (selectedBrand !== 'ALL') parts.push(selectedBrand);
    if (selectedRam !== 'ALL') parts.push(`${selectedRam}GB RAM`);
    if (city !== 'ALL') parts.push(city);
    if (search.trim()) parts.push(`"${search}"`);
    const name = parts.length > 0 ? parts.join(' • ') : 'All Catalog Hardware';

    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          criteria: {
            category,
            brand: selectedBrand,
            ramGB: selectedRam,
            maxPrice,
            city,
            search,
          },
          targetType: 'LISTING',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Search saved: ${name}`);
        setSaveToast(`Alert activated for: ${name}`);
        setTimeout(() => setSaveToast(''), 6000);
      } else {
        toast.error(data.error || 'Please sign in to save searches');
      }
    } catch {
      toast.error('Error saving alert search');
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

  const phoneBrands = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Huawei', 'Nothing'];
  const laptopBrands = ['Apple', 'Dell', 'Lenovo', 'HP', 'Asus', 'Acer', 'Google'];
  const displayBrands = category === 'PHONE' 
    ? phoneBrands 
    : category === 'LAPTOP' 
    ? laptopBrands 
    : Array.from(new Set([...phoneBrands, ...laptopBrands]));

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

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveSearch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs transition-colors"
            title="Save active search filters as stock alert"
          >
            <Bell className="w-3.5 h-3.5 text-amber-800" />
            <span className="hidden sm:inline">Save this Search</span>
            <span className="sm:hidden">Save</span>
          </button>

          <button
            onClick={() => setFilterSheetOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all ${
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

      {/* Search Bar & Active Filters Pill Row */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model, specs, or part number (e.g. S22 Ultra, T480, 01AV421)..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs font-medium"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Quick Category Switcher (if not locked) */}
          {!lockCategory && (
            <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start sm:self-auto border border-gray-200/50">
              <button
                onClick={() => {
                  setCategory('ALL');
                  setSelectedBrand('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setCategory('LAPTOP');
                  setSelectedBrand('ALL');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === 'LAPTOP' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptops</span>
              </button>
              <button
                onClick={() => {
                  setCategory('PHONE');
                  setSelectedBrand('ALL');
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === 'PHONE' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phones</span>
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          >
            <option value="latest">Latest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Active Filter Pills Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Active:</span>

            {!lockCategory && category !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-medium">
                {category === 'LAPTOP' ? 'Laptops' : 'Phones'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('ALL')} />
              </span>
            )}

            {itemType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium">
                {itemType === 'SPARE_PART' ? 'Parts Only' : 'Complete Units'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setItemType('ALL')} />
              </span>
            )}

            {selectedBrand !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-medium">
                Brand: {selectedBrand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('ALL')} />
              </span>
            )}

            {category !== 'LAPTOP' && ptaStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                {ptaStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPtaStatus('ALL')} />
              </span>
            )}

            {selectedRam !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono font-medium">
                {selectedRam}GB RAM
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRam('ALL')} />
              </span>
            )}

            {selectedStorage !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-gray-200 font-mono font-medium">
                {selectedStorage}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStorage('ALL')} />
              </span>
            )}

            {city !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium">
                {city}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCity('ALL')} />
              </span>
            )}

            {condition !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium">
                {condition}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCondition('ALL')} />
              </span>
            )}

            {maxPrice < 300000 && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-gray-200 font-mono font-medium">
                &le; {formatPKR(maxPrice)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice(300000)} />
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

      {/* Main Grid View */}
      <main>
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 h-40 flex gap-4">
                <Skeleton className="w-36 h-full rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No listings match your criteria"
            description="Try adjusting your price range, RAM, or location filters to see more verified hardware."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}
      </main>

      {/* Filter Options Drawer */}
      <FilterSidebar
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        lockCategory={lockCategory}
        category={category}
        setCategory={setCategory}
        itemType={itemType}
        setItemType={setItemType}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        displayBrands={displayBrands}
        ptaStatus={ptaStatus}
        setPtaStatus={setPtaStatus}
        selectedRam={selectedRam}
        setSelectedRam={setSelectedRam}
        ramFilterOptions={ramFilterOptions}
        selectedStorage={selectedStorage}
        setSelectedStorage={setSelectedStorage}
        storageFilterOptions={storageFilterOptions}
        condition={condition}
        setCondition={setCondition}
        city={city}
        setCity={setCity}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onReset={handleResetFilters}
      />
    </div>
  );
}
