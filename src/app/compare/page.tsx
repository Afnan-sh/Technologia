'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  X, 
  Plus, 
  Smartphone, 
  Laptop, 
  Sparkles, 
  Check, 
  Cpu, 
  HardDrive, 
  Battery, 
  Camera, 
  Volume2, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  Monitor,
  Maximize2,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Flame
} from 'lucide-react';

interface DeviceItem {
  id: string;
  category: string;
  brand: string;
  model: string;
  releaseYear: number;
  imageUrl?: string;
  screenSize?: string;
  resolution?: string;
  displayTech?: string;
  bodyDimensions?: string;
  weight?: string;
  buildMaterial?: string;
  chipset?: string;
  cpuDetails?: string;
  gpuDetails?: string;
  os?: string;
  ramOptions?: string | number[];
  storageOptions?: string | string[];
  ramLimits?: string;
  cardSlot?: string;
  mainCamera?: string;
  mainCameraFeatures?: string;
  selfieCamera?: string;
  cameraSummary?: string;
  batteryCapacity?: string;
  chargingSpeed?: string;
  network?: string;
  comms?: string;
  sound?: string;
  security?: string;
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category')?.toUpperCase() === 'LAPTOP' ? 'LAPTOP' : 'PHONE';

  const [activeCategory, setActiveCategory] = useState<'PHONE' | 'LAPTOP'>(initialCategoryParam);
  const [allDevices, setAllDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected device slots (up to 3) strictly belonging to activeCategory
  const [phoneSlots, setPhoneSlots] = useState<(DeviceItem | null)[]>([null, null, null]);
  const [laptopSlots, setLaptopSlots] = useState<(DeviceItem | null)[]>([null, null, null]);

  // Modal selector state
  const [selectorOpenForSlot, setSelectorOpenForSlot] = useState<number | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [pickerSearch, setPickerSearch] = useState('');

  // Difference highlight toggle
  const [highlightDiff, setHighlightDiff] = useState(false);

  // Active slots pointer based on category
  const selectedDevices = activeCategory === 'PHONE' ? phoneSlots : laptopSlots;
  const setSelectedDevices = (updater: (prev: (DeviceItem | null)[]) => (DeviceItem | null)[]) => {
    if (activeCategory === 'PHONE') {
      setPhoneSlots(updater);
    } else {
      setLaptopSlots(updater);
    }
  };

  // Fetch catalog on mount
  useEffect(() => {
    async function loadDevices() {
      try {
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (data.success && data.devices) {
          setAllDevices(data.devices);

          const phones = data.devices.filter((d: any) => d.category === 'PHONE');
          const laptops = data.devices.filter((d: any) => d.category === 'LAPTOP');

          // Pre-populate canonical Phone legends
          const p1 = phones.find((d: any) => d.brand === 'Apple' && d.model.includes('iPhone 13 Pro')) || phones[0];
          const p2 = phones.find((d: any) => d.brand === 'Samsung' && d.model.includes('S22 Ultra')) || phones[1];
          const p3 = phones.find((d: any) => d.brand === 'Google' && d.model.includes('Pixel 7 Pro')) || phones[2];
          setPhoneSlots([p1 || null, p2 || null, p3 || null]);

          // Pre-populate canonical Laptop legends
          const l1 = laptops.find((d: any) => d.brand === 'Lenovo' && d.model.includes('ThinkPad T480')) || laptops[0];
          const l2 = laptops.find((d: any) => d.brand === 'Dell' && d.model.includes('XPS 15 9570')) || laptops[1];
          const l3 = laptops.find((d: any) => d.brand === 'Apple' && d.model.includes('MacBook Air M1')) || laptops[2];
          setLaptopSlots([l1 || null, l2 || null, l3 || null]);
        }
      } catch (err) {
        console.error('Error loading devices for comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDevices();
  }, []);

  const handleSelectCategory = (cat: 'PHONE' | 'LAPTOP') => {
    setActiveCategory(cat);
    setBrandFilter('ALL');
    setPickerSearch('');
  };

  const handleSelectDevice = (slotIndex: number, device: DeviceItem) => {
    setSelectedDevices((prev) => {
      const next = [...prev];
      next[slotIndex] = device;
      return next;
    });
    setSelectorOpenForSlot(null);
    setPickerSearch('');
  };

  const handleRemoveDevice = (slotIndex: number) => {
    setSelectedDevices((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  // STRICT SEPARATION: Filter devices for modal strictly by activeCategory
  const categoryDevices = allDevices.filter((d) => d.category === activeCategory);
  
  const phoneBrands = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Huawei', 'Nothing'];
  const laptopBrands = ['Lenovo', 'Dell', 'Apple', 'HP', 'Asus', 'Acer', 'Google'];
  const activeBrandList = activeCategory === 'PHONE' ? phoneBrands : laptopBrands;

  const filteredPickerDevices = categoryDevices.filter((d) => {
    const matchesBrand = brandFilter === 'ALL' || d.brand.toLowerCase() === brandFilter.toLowerCase();
    const matchesSearch = pickerSearch.trim() === '' || 
      `${d.brand} ${d.model}`.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (d.chipset && d.chipset.toLowerCase().includes(pickerSearch.toLowerCase())) ||
      (d.cpuDetails && d.cpuDetails.toLowerCase().includes(pickerSearch.toLowerCase()));
    return matchesBrand && matchesSearch;
  });

  // Helper to format RAM array
  const formatRam = (ram: any) => {
    if (!ram) return 'N/A';
    try {
      const arr = typeof ram === 'string' ? JSON.parse(ram) : ram;
      return Array.isArray(arr) ? arr.map(r => `${r}GB`).join(' / ') : String(ram);
    } catch {
      return String(ram);
    }
  };

  // Helper to format Storage array
  const formatStorage = (storage: any) => {
    if (!storage) return 'N/A';
    try {
      const arr = typeof storage === 'string' ? JSON.parse(storage) : storage;
      return Array.isArray(arr) ? arr.join(' / ') : String(storage);
    } catch {
      return String(storage);
    }
  };

  // Check if values across active slots differ
  const valuesDiffer = (extractor: (d: DeviceItem) => string | undefined) => {
    const active = selectedDevices.filter(Boolean) as DeviceItem[];
    if (active.length <= 1) return false;
    const firstVal = extractor(active[0]) || '';
    return active.some(d => (extractor(d) || '') !== firstVal);
  };

  // ==========================================
  // DISTINCT SPECIFICATION TABLES
  // ==========================================

  // 1. MOBILE PHONE SPECIFICATION SECTIONS
  const phoneSpecSections = [
    {
      group: 'Network & Cellular Bands',
      icon: Wifi,
      specs: [
        { label: 'Network Bands', key: 'network', get: (d: DeviceItem) => d.network },
        { label: 'Wireless & Connectivity', key: 'comms', get: (d: DeviceItem) => d.comms },
      ],
    },
    {
      group: 'Body, Glass & Durability',
      icon: ShieldCheck,
      specs: [
        { label: 'Glass & Chassis Materials', key: 'buildMaterial', get: (d: DeviceItem) => d.buildMaterial },
        { label: 'Dimensions', key: 'bodyDimensions', get: (d: DeviceItem) => d.bodyDimensions },
        { label: 'Weight', key: 'weight', get: (d: DeviceItem) => d.weight },
      ],
    },
    {
      group: 'Display & Nits Brightness',
      icon: Monitor,
      specs: [
        { label: 'Screen Size', key: 'screenSize', get: (d: DeviceItem) => d.screenSize },
        { label: 'Resolution', key: 'resolution', get: (d: DeviceItem) => d.resolution },
        { label: 'Display Technology & Nits', key: 'displayTech', get: (d: DeviceItem) => d.displayTech },
      ],
    },
    {
      group: 'Platform, Chipset & Performance',
      icon: Cpu,
      specs: [
        { label: 'Chipset (SoC)', key: 'chipset', get: (d: DeviceItem) => d.chipset },
        { label: 'CPU Cores', key: 'cpuDetails', get: (d: DeviceItem) => d.cpuDetails },
        { label: 'GPU / Graphics', key: 'gpuDetails', get: (d: DeviceItem) => d.gpuDetails },
        { label: 'Operating System', key: 'os', get: (d: DeviceItem) => d.os },
        { label: 'Release Year', key: 'releaseYear', get: (d: DeviceItem) => d.releaseYear?.toString() },
      ],
    },
    {
      group: 'Main Camera (MP, Aperture & OIS)',
      icon: Camera,
      specs: [
        { label: 'Main Camera Sensors', key: 'mainCamera', get: (d: DeviceItem) => d.mainCamera },
        { label: 'Camera Features & Video', key: 'mainCameraFeatures', get: (d: DeviceItem) => d.mainCameraFeatures },
        { label: 'Camera Summary', key: 'cameraSummary', get: (d: DeviceItem) => d.cameraSummary },
      ],
    },
    {
      group: 'Selfie Camera',
      icon: Camera,
      specs: [
        { label: 'Front / Selfie Camera', key: 'selfieCamera', get: (d: DeviceItem) => d.selfieCamera },
      ],
    },
    {
      group: 'Battery & Charging Wattage',
      icon: Battery,
      specs: [
        { label: 'Battery Capacity (mAh)', key: 'batteryCapacity', get: (d: DeviceItem) => d.batteryCapacity },
        { label: 'Charging Wattage & Wireless', key: 'chargingSpeed', get: (d: DeviceItem) => d.chargingSpeed },
      ],
    },
    {
      group: 'Factory Memory Variants',
      icon: HardDrive,
      specs: [
        { label: 'RAM Configurations', key: 'ramOptions', get: (d: DeviceItem) => formatRam(d.ramOptions) },
        { label: 'Storage Capacities', key: 'storageOptions', get: (d: DeviceItem) => formatStorage(d.storageOptions) },
        { label: 'Memory Card Slot', key: 'cardSlot', get: (d: DeviceItem) => d.cardSlot },
        { label: 'Biometrics & Security', key: 'security', get: (d: DeviceItem) => d.security },
      ],
    },
  ];

  // 2. LAPTOP SPECIFICATION SECTIONS
  const laptopSpecSections = [
    {
      group: 'Chassis Material & Build',
      icon: ShieldCheck,
      specs: [
        { label: 'Chassis Material & Finish', key: 'buildMaterial', get: (d: DeviceItem) => d.buildMaterial },
        { label: 'Dimensions', key: 'bodyDimensions', get: (d: DeviceItem) => d.bodyDimensions },
        { label: 'Weight', key: 'weight', get: (d: DeviceItem) => d.weight },
        { label: 'Release Year', key: 'releaseYear', get: (d: DeviceItem) => d.releaseYear?.toString() },
      ],
    },
    {
      group: 'Display (Color Gamut, Refresh Rate & Finish)',
      icon: Monitor,
      specs: [
        { label: 'Screen Size', key: 'screenSize', get: (d: DeviceItem) => d.screenSize },
        { label: 'Native Resolution', key: 'resolution', get: (d: DeviceItem) => d.resolution },
        { label: 'Panel Finish, Color Gamut & Nits', key: 'displayTech', get: (d: DeviceItem) => d.displayTech },
      ],
    },
    {
      group: 'Processor, Cores & Architecture',
      icon: Cpu,
      specs: [
        { label: 'Default CPUs & Architecture', key: 'chipset', get: (d: DeviceItem) => d.chipset },
        { label: 'Cores, Threads & Boost Clocks', key: 'cpuDetails', get: (d: DeviceItem) => d.cpuDetails },
        { label: 'Graphics / GPU', key: 'gpuDetails', get: (d: DeviceItem) => d.gpuDetails },
        { label: 'Supported OS', key: 'os', get: (d: DeviceItem) => d.os },
      ],
    },
    {
      group: 'Memory Configurability & Limits',
      icon: HardDrive,
      specs: [
        { label: 'Factory RAM Options', key: 'ramOptions', get: (d: DeviceItem) => formatRam(d.ramOptions) },
        { label: 'Default / Max RAM Limit (Slots)', key: 'ramLimits', get: (d: DeviceItem) => d.ramLimits },
      ],
    },
    {
      group: 'Storage Interfaces (NVMe Gen3/Gen4)',
      icon: HardDrive,
      specs: [
        { label: 'Storage Interface & Slots', key: 'cardSlot', get: (d: DeviceItem) => d.cardSlot || 'M.2 NVMe PCIe SSD' },
        { label: 'Factory Storage Configurations', key: 'storageOptions', get: (d: DeviceItem) => formatStorage(d.storageOptions) },
      ],
    },
    {
      group: 'I/O Ports & Expansion (Thunderbolt / USB-A)',
      icon: Wifi,
      specs: [
        { label: 'I/O Ports (Thunderbolt, USB, HDMI)', key: 'comms', get: (d: DeviceItem) => d.comms },
        { label: 'Audio & Speakers', key: 'sound', get: (d: DeviceItem) => d.sound },
        { label: 'Security (Fingerprint / Shutter)', key: 'security', get: (d: DeviceItem) => d.security },
      ],
    },
    {
      group: 'Battery & Power (Watt-Hours)',
      icon: Battery,
      specs: [
        { label: 'Battery Capacity (Wh)', key: 'batteryCapacity', get: (d: DeviceItem) => d.batteryCapacity },
        { label: 'Charger Wattage & RapidCharge', key: 'chargingSpeed', get: (d: DeviceItem) => d.chargingSpeed },
      ],
    },
  ];

  const activeSpecSections = activeCategory === 'PHONE' ? phoneSpecSections : laptopSpecSections;
  const activeDeviceCount = selectedDevices.filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              STRICT CATEGORY COMPARISON ENGINE
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              10-Year Hardware Bench
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            {activeCategory === 'PHONE' ? 'Mobile Phone Comparison Matrix' : 'Laptop Comparison Matrix'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {activeCategory === 'PHONE'
              ? 'Compare complete mobile specifications side-by-side: Network bands, IP ratings, OLED display nits, camera systems with OIS, and mAh battery wattage.'
              : 'Compare complete laptop specifications side-by-side: Chassis material, color gamut, core/thread clocks, upgradeable RAM slots, NVMe interfaces, and Wh battery capacity.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighlightDiff(!highlightDiff)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${
              highlightDiff 
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-800" />
            <span>{highlightDiff ? 'Differences Highlighted' : 'Highlight Differences'}</span>
          </button>
        </div>
      </div>

      {/* STRICT CATEGORY SEPARATION TABS */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center max-w-md border border-gray-200">
        <button
          onClick={() => handleSelectCategory('PHONE')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'PHONE'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>Compare Phones</span>
        </button>

        <button
          onClick={() => handleSelectCategory('LAPTOP')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeCategory === 'LAPTOP'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Laptop className="w-4 h-4 text-blue-600" />
          <span>Compare Laptops</span>
        </button>
      </div>

      {/* STICKY DEVICE SLOTS HEADER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-xs sticky top-16 z-30 backdrop-blur-md bg-white/95">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 divide-x divide-gray-100">
          {[0, 1, 2].map((slotIndex) => {
            const dev = selectedDevices[slotIndex];
            return (
              <div key={slotIndex} className={`flex flex-col items-center text-center px-1 sm:px-3 ${slotIndex > 0 ? 'pl-3 sm:pl-6' : ''}`}>
                {dev ? (
                  <div className="w-full space-y-2">
                    <div className="relative mx-auto w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gray-50 border border-gray-200/80 overflow-hidden shadow-2xs group">
                      <img
                        src={dev.imageUrl || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'}
                        alt={dev.model}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={() => handleRemoveDevice(slotIndex)}
                        title="Remove device"
                        className="absolute top-1.5 right-1.5 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                        {dev.brand} &bull; {dev.releaseYear}
                      </span>
                      <h3 className="font-extrabold text-xs sm:text-base text-slate-900 truncate">
                        {dev.model}
                      </h3>
                      <span className="text-[11px] text-slate-500 hidden sm:block truncate mt-0.5">
                        {dev.chipset || dev.cpuDetails}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      <button
                        onClick={() => setSelectorOpenForSlot(slotIndex)}
                        className="text-[10px] font-semibold text-slate-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2 py-1 rounded-md border border-gray-200 transition-colors"
                      >
                        Change
                      </button>
                      <Link
                        href={`/buy?search=${encodeURIComponent(dev.model)}`}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-100 transition-colors hidden sm:inline-flex items-center gap-1"
                      >
                        <span>View Ads</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectorOpenForSlot(slotIndex)}
                    className="w-full h-32 sm:h-44 border-2 border-dashed border-gray-200 hover:border-blue-600 rounded-2xl flex flex-col items-center justify-center p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 mb-2 transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold block text-slate-700 group-hover:text-blue-600">
                      Add {activeCategory === 'PHONE' ? 'Phone' : 'Laptop'} {slotIndex + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {categoryDevices.length} models available
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DISTINCT SPECIFICATION MATRIX TABLE */}
      {activeDeviceCount > 0 ? (
        <div className="space-y-6">
          {activeSpecSections.map((sec, secIdx) => {
            const Icon = sec.icon;
            return (
              <div key={secIdx} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
                {/* Section Header */}
                <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-200 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                    {sec.group}
                  </h3>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100 text-xs">
                  {sec.specs.map((spec, rowIdx) => {
                    const isDiff = highlightDiff && valuesDiffer(spec.get);

                    return (
                      <div 
                        key={rowIdx} 
                        className={`grid grid-cols-12 p-4 transition-colors ${
                          isDiff ? 'bg-amber-50/40 border-l-4 border-l-amber-800' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        {/* Spec Name */}
                        <div className="col-span-12 sm:col-span-3 text-slate-500 font-semibold mb-1.5 sm:mb-0 pr-2">
                          {spec.label}
                        </div>

                        {/* 3 Device Columns */}
                        <div className="col-span-12 sm:col-span-9 grid grid-cols-3 gap-3 sm:gap-6 divide-x divide-gray-100">
                          {[0, 1, 2].map((slotIdx) => {
                            const dev = selectedDevices[slotIdx];
                            const val = dev ? spec.get(dev) : null;

                            return (
                              <div key={slotIdx} className={`min-w-0 ${slotIdx > 0 ? 'pl-3 sm:pl-6' : ''}`}>
                                {dev ? (
                                  val ? (
                                    <span className={`text-slate-800 leading-relaxed block break-words ${isDiff ? 'font-bold text-amber-950' : ''}`}>
                                      {val}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 italic text-[11px]">&mdash;</span>
                                  )
                                ) : (
                                  <span className="text-slate-200 text-[11px]">&mdash;</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-gray-50/50 rounded-3xl border border-gray-200 space-y-3">
          {activeCategory === 'PHONE' ? (
            <Smartphone className="w-10 h-10 text-slate-300 mx-auto" />
          ) : (
            <Laptop className="w-10 h-10 text-slate-300 mx-auto" />
          )}
          <h3 className="text-base font-bold text-slate-900">No {activeCategory === 'PHONE' ? 'Phones' : 'Laptops'} Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click any of the slots above to choose up to 3 {activeCategory === 'PHONE' ? 'mobile phones' : 'laptops'} to compare their full hardware specifications side-by-side.
          </p>
        </div>
      )}

      {/* STRICT SELECTOR MODAL DIALOG (STRICT CATEGORY ISOLATION) */}
      {selectorOpenForSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-modal-pop">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Select {activeCategory === 'PHONE' ? 'Phone' : 'Laptop'} for Slot {selectorOpenForSlot + 1}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    {activeCategory} ONLY
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing canonical {activeCategory === 'PHONE' ? 'smartphones' : 'laptops'} from the last 10 years
                </p>
              </div>
              <button
                onClick={() => setSelectorOpenForSlot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls: Brand Filter Tabs strictly for activeCategory */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
              {/* Brand buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setBrandFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                    brandFilter === 'ALL'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  All {activeCategory === 'PHONE' ? 'Phones' : 'Laptops'}
                </button>
                {activeBrandList.map((brandName) => (
                  <button
                    key={brandName}
                    onClick={() => setBrandFilter(brandName)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                      brandFilter === brandName
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {brandName}
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder={`Search ${activeCategory === 'PHONE' ? 'phones (e.g. S23 Ultra, iPhone 15 Pro, Pixel 8)...' : 'laptops (e.g. ThinkPad T480, XPS 15, MacBook M1)...'}`}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Device List (Strictly Category-Isolated) */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-gray-100">
              {filteredPickerDevices.length > 0 ? (
                filteredPickerDevices.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => handleSelectDevice(selectorOpenForSlot, dev)}
                    className="pt-2 first:pt-0 flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={dev.imageUrl || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'}
                          alt={dev.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">
                            {dev.brand}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            &bull; {dev.releaseYear}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600">
                          {dev.model}
                        </h4>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {dev.chipset || dev.cpuDetails} &bull; {dev.screenSize}
                        </span>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-white group-hover:bg-blue-600 text-slate-700 group-hover:text-white rounded-lg text-xs font-semibold border border-gray-200 group-hover:border-blue-600 shadow-2xs transition-colors flex-shrink-0">
                      Select
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No {activeCategory === 'PHONE' ? 'phones' : 'laptops'} match your search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading comparison engine...</div>}>
      <CompareContent />
    </Suspense>
  );
}
