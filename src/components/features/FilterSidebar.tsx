'use client';

import React from 'react';
import { X, RotateCcw, Smartphone, Laptop, Check } from 'lucide-react';
import { formatPKR, PAKISTANI_CITIES, PTA_STATUSES, CONDITION_OPTIONS } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lockCategory?: boolean;
  category: 'LAPTOP' | 'PHONE' | 'ALL';
  setCategory: (c: 'LAPTOP' | 'PHONE' | 'ALL') => void;
  itemType: string;
  setItemType: (t: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  displayBrands: string[];
  ptaStatus: string;
  setPtaStatus: (p: string) => void;
  selectedRam: number | 'ALL';
  setSelectedRam: (r: number | 'ALL') => void;
  ramFilterOptions: number[];
  selectedStorage: string;
  setSelectedStorage: (s: string) => void;
  storageFilterOptions: string[];
  condition: string;
  setCondition: (c: string) => void;
  city: string;
  setCity: (c: string) => void;
  minPrice: number;
  setMinPrice: (p: number) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  onReset: () => void;
}

export function FilterSidebar({
  isOpen,
  onClose,
  lockCategory = false,
  category,
  setCategory,
  itemType,
  setItemType,
  selectedBrand,
  setSelectedBrand,
  displayBrands,
  ptaStatus,
  setPtaStatus,
  selectedRam,
  setSelectedRam,
  ramFilterOptions,
  selectedStorage,
  setSelectedStorage,
  storageFilterOptions,
  condition,
  setCondition,
  city,
  setCity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onReset,
}: FilterSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Filter Specifications</h3>
            <p className="text-xs text-slate-500">Refine catalog listings across Pakistan</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filter Options */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Category Selector */}
          {!lockCategory && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'LAPTOP', label: 'Laptops', icon: Laptop },
                  { id: 'PHONE', label: 'Phones', icon: Smartphone },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id as 'LAPTOP' | 'PHONE' | 'ALL');
                        setSelectedBrand('ALL');
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Item Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Item Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'COMPLETE_UNIT', label: 'Complete Unit' },
                { id: 'SPARE_PART', label: 'Spare Part' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setItemType(t.id)}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                    itemType === t.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Brand</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedBrand('ALL')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedBrand === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                All Brands
              </button>
              {displayBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedBrand === b
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* PTA Status (Phones only) */}
          {category !== 'LAPTOP' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">PTA Approval Status (Phones)</label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setPtaStatus('ALL')}
                  className={`w-full p-2 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                    ptaStatus === 'ALL'
                      ? 'bg-blue-50 text-blue-700 border-blue-600 font-semibold'
                      : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>All PTA Statuses</span>
                  {ptaStatus === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                {PTA_STATUSES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPtaStatus(p.id)}
                    className={`w-full p-2 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      ptaStatus === p.id
                        ? 'bg-blue-50 text-blue-700 border-blue-600 font-semibold'
                        : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>{p.label}</span>
                    {ptaStatus === p.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RAM */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">RAM Capacity (GB)</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedRam('ALL')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-mono ${
                  selectedRam === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Any RAM
              </button>
              {ramFilterOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRam(r)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-mono ${
                    selectedRam === r
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {r} GB
                </button>
              ))}
            </div>
          </div>

          {/* Storage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Storage Capacity</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedStorage('ALL')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-mono ${
                  selectedStorage === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Any Storage
              </button>
              {storageFilterOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStorage(s)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium font-mono ${
                    selectedStorage === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">Max Price</label>
              <span className="font-mono font-bold text-blue-600">{formatPKR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            >
              <option value="ALL">All Cities (Pakistan)</option>
              {PAKISTANI_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            >
              <option value="ALL">Any Condition</option>
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset All</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
