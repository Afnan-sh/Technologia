'use client';

import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Lock, CheckCircle, Info } from 'lucide-react';
import { DeviceCatalogItem, PartCatalogItem } from '@/types';

export interface SelectedCatalogData {
  category: 'LAPTOP' | 'PHONE';
  itemType: 'COMPLETE_UNIT' | 'SPARE_PART';
  deviceId?: string;
  brand: string;
  model: string;
  releaseYear?: number;
  screenSize?: string;
  resolution?: string;
  displayTech?: string;
  chipset?: string;
  ramOptions?: number[];
  storageOptions?: string[];
  ramLimits?: string;
  mainCamera?: string;
  cameraSummary?: string;
  batteryCapacity?: string;
  partCatalogId?: string;
  partName?: string;
  partNumber?: string;
  partType?: string;
  defaultScreen?: string;
  cpuGeneration?: string;
  supportedRamType?: string;
  supportedStorage?: string;
  suggestedPricePKR?: number;
  rawDevice?: DeviceCatalogItem;
}

interface CatalogPickerProps {
  initialCategory?: 'LAPTOP' | 'PHONE';
  initialItemType?: 'COMPLETE_UNIT' | 'SPARE_PART';
  onCatalogChange: (data: SelectedCatalogData) => void;
  allowPartSelection?: boolean;
}

export default function CatalogPicker({
  initialCategory = 'LAPTOP',
  initialItemType = 'COMPLETE_UNIT',
  onCatalogChange,
  allowPartSelection = true,
}: CatalogPickerProps) {
  const [devices, setDevices] = useState<DeviceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<'LAPTOP' | 'PHONE'>(initialCategory);
  const [itemType, setItemType] = useState<'COMPLETE_UNIT' | 'SPARE_PART'>(initialItemType);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');

  // Fetch catalog on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (data.success && data.devices) {
          setDevices(data.devices);
          // Set initial defaults
          const filtered = (data.devices as DeviceCatalogItem[]).filter((d) => d.category === initialCategory);
          if (filtered.length > 0) {
            setSelectedBrand(filtered[0].brand);
            const firstDev = filtered.find((d) => d.brand === filtered[0].brand);
            setSelectedDeviceId(firstDev ? firstDev.id : filtered[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, [initialCategory]);

  const categoryDevices = devices.filter((d) => d.category === category);
  const availableBrands = Array.from(new Set(categoryDevices.map((d) => d.brand)));
  const brandDevices = categoryDevices.filter((d) => d.brand === selectedBrand);
  const activeDevice = devices.find((d) => d.id === selectedDeviceId);
  const availableParts: PartCatalogItem[] = (activeDevice?.parts as unknown as PartCatalogItem[]) || [];
  const activePart = availableParts.find((p) => p.id === selectedPartId);

  const handleCategoryChange = (newCat: 'LAPTOP' | 'PHONE') => {
    setCategory(newCat);
    const filtered = devices.filter((d) => d.category === newCat);
    if (filtered.length > 0) {
      const firstBrand = filtered[0].brand;
      setSelectedBrand(firstBrand);
      const firstDev = filtered.find((d) => d.brand === firstBrand);
      setSelectedDeviceId(firstDev ? firstDev.id : '');
    } else {
      setSelectedBrand('');
      setSelectedDeviceId('');
    }
    setSelectedPartId('');
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    const dev = categoryDevices.find((d) => d.brand === brand);
    setSelectedDeviceId(dev ? dev.id : '');
    setSelectedPartId('');
  };

  useEffect(() => {
    if (!activeDevice) return;

    let parsedRamOptions: number[] = [];
    try {
      if (activeDevice.ramOptions) {
        parsedRamOptions = typeof activeDevice.ramOptions === 'string'
          ? JSON.parse(activeDevice.ramOptions)
          : activeDevice.ramOptions;
      }
    } catch (e) {
      parsedRamOptions = [8, 16];
    }

    let parsedStorageOptions: string[] = [];
    try {
      if (activeDevice.storageOptions) {
        parsedStorageOptions = typeof activeDevice.storageOptions === 'string'
          ? JSON.parse(activeDevice.storageOptions)
          : activeDevice.storageOptions;
      }
    } catch (e) {
      parsedStorageOptions = ['128GB', '256GB', '512GB'];
    }

    const data: SelectedCatalogData = {
      category,
      itemType,
      deviceId: activeDevice.id,
      brand: activeDevice.brand,
      model: activeDevice.model,
      releaseYear: activeDevice.releaseYear,
      screenSize: activeDevice.screenSize || activeDevice.defaultScreen || '',
      resolution: activeDevice.resolution || '',
      displayTech: activeDevice.displayTech || '',
      chipset: activeDevice.chipset || activeDevice.cpuGeneration || '',
      ramOptions: parsedRamOptions,
      storageOptions: parsedStorageOptions,
      ramLimits: activeDevice.ramLimits || activeDevice.supportedRamType || '',
      mainCamera: activeDevice.mainCamera || '',
      cameraSummary: activeDevice.cameraSummary || '',
      batteryCapacity: activeDevice.batteryCapacity || '',
      defaultScreen: activeDevice.defaultScreen || activeDevice.screenSize || '',
      cpuGeneration: activeDevice.cpuGeneration || activeDevice.chipset || '',
      supportedRamType: activeDevice.supportedRamType || activeDevice.ramLimits || '',
      supportedStorage: activeDevice.supportedStorage || '',
      rawDevice: activeDevice,
    };

    if (itemType === 'SPARE_PART' && activePart) {
      data.partCatalogId = activePart.id;
      data.partName = activePart.name;
      data.partNumber = activePart.partNumber || '';
      data.partType = activePart.partType;
      data.suggestedPricePKR = activePart.suggestedPricePKR || 0;
    }

    onCatalogChange(data);
  }, [category, itemType, selectedDeviceId, selectedPartId, activeDevice, activePart]);

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 animate-pulse bg-white border border-gray-100 rounded-xl">
        Loading canonical catalog specs...
      </div>
    );
  }

  // Parse for display
  let displayRam: number[] = [];
  try {
    if (activeDevice?.ramOptions) {
      displayRam = typeof activeDevice.ramOptions === 'string' ? JSON.parse(activeDevice.ramOptions) : activeDevice.ramOptions;
    }
  } catch (e) {}

  let displayStorage: string[] = [];
  try {
    if (activeDevice?.storageOptions) {
      displayStorage = typeof activeDevice.storageOptions === 'string' ? JSON.parse(activeDevice.storageOptions) : activeDevice.storageOptions;
    }
  } catch (e) {}

  return (
    <div className="space-y-4 bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Master Device Catalog (10-Year Historical Registry)
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">
          Auto-locks verified hardware specs
        </span>
      </div>

      {/* 1. Category and Item Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category: Laptop vs Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            1. Device Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange('LAPTOP')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all border ${
                category === 'LAPTOP'
                  ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-2xs'
                  : 'bg-gray-50/60 text-slate-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>Laptops</span>
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('PHONE')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all border ${
                category === 'PHONE'
                  ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-2xs'
                  : 'bg-gray-50/60 text-slate-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Phones</span>
            </button>
          </div>
        </div>

        {/* Item Type: Complete Unit vs Spare Part */}
        {allowPartSelection && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Listing Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemType('COMPLETE_UNIT')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold transition-all border ${
                  itemType === 'COMPLETE_UNIT'
                    ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-2xs'
                    : 'bg-gray-50/60 text-slate-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Complete Unit</span>
              </button>
              <button
                type="button"
                onClick={() => setItemType('SPARE_PART')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold transition-all border ${
                  itemType === 'SPARE_PART'
                    ? 'bg-amber-50 text-amber-800 border-amber-800 shadow-2xs'
                    : 'bg-gray-50/60 text-slate-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>Spare Part Only</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Cascading Selectors: Brand -> Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Brand Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            3. Select Brand ({availableBrands.length} Supported)
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            4. Select Canonical Model ({brandDevices.length} Models)
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => {
              setSelectedDeviceId(e.target.value);
              setSelectedPartId('');
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            {brandDevices.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.model} ({dev.releaseYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Component Part Picker (if Spare Part selected) */}
      {itemType === 'SPARE_PART' && (
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold text-amber-900 mb-1 flex items-center justify-between">
            <span>5. Select Component / Part from Catalog</span>
            <span className="text-[10px] text-slate-400">Compatible with {activeDevice?.model}</span>
          </label>
          <select
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-amber-50/30 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
          >
            <option value="">-- Choose Canonical Part (or type custom in description) --</option>
            {availableParts.map((part) => (
              <option key={part.id} value={part.id}>
                [{part.partType}] {part.name} {part.partNumber ? `(PN: ${part.partNumber})` : ''} - Suggested: PKR {part.suggestedPricePKR?.toLocaleString()}
              </option>
            ))}
          </select>

          {activePart && (
            <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-1">
              <div className="font-bold text-amber-900">{activePart.name}</div>
              {activePart.partNumber && (
                <div className="text-[11px] font-mono text-slate-600">
                  OEM Part Number: <span className="text-slate-900 font-semibold">{activePart.partNumber}</span>
                </div>
              )}
              {activePart.compatibilityNotes && (
                <div className="text-[11px] text-slate-500">
                  Compatibility: {activePart.compatibilityNotes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Auto-locked Dynamic Specs preview */}
      {activeDevice && (
        <div className="mt-3 bg-gray-50/80 border border-gray-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Immutable Master Specs ({activeDevice.brand} {activeDevice.model} - {activeDevice.releaseYear}):</span>
            </div>
            {category === 'PHONE' ? (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                Strict Factory Variants
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                Upgradeable Hardware
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {/* Display */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-100">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Display</span>
              <span className="text-slate-800 font-medium text-xs block truncate">
                {activeDevice.screenSize} ({activeDevice.resolution})
              </span>
              <span className="text-[10px] text-slate-500 block truncate">{activeDevice.displayTech}</span>
            </div>

            {/* Processor / Chipset */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-100">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Platform / CPU</span>
              <span className="text-slate-800 font-medium text-xs block truncate">
                {activeDevice.chipset || activeDevice.cpuGeneration}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">{activeDevice.os}</span>
            </div>

            {/* Camera / Battery */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-100">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                {category === 'PHONE' ? 'Camera & Battery' : 'Battery & Ports'}
              </span>
              <span className="text-slate-800 font-medium text-xs block truncate">
                {category === 'PHONE' ? (activeDevice.cameraSummary || activeDevice.mainCamera) : activeDevice.batteryCapacity}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {category === 'PHONE' ? activeDevice.batteryCapacity : activeDevice.weight}
              </span>
            </div>
          </div>

          {/* Variants info pill row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-slate-500 font-medium">Valid Manufacturer Configs:</span>
            {displayRam.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-medium">
                RAM: {displayRam.join(', ')}GB
              </span>
            )}
            {displayStorage.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                Storage: {displayStorage.join(' / ')}
              </span>
            )}
            {activeDevice.ramLimits && (
              <span className="text-[10px] text-slate-400 italic">
                ({activeDevice.ramLimits})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
