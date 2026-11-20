'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CatalogPicker, { SelectedCatalogData } from '@/components/CatalogPicker';
import { 
  PlusCircle, 
  Upload, 
  X, 
  AlertCircle,
  Lock,
  Cpu,
  HardDrive,
  ShieldCheck,
  Battery,
  Sparkles
} from 'lucide-react';
import { 
  PAKISTANI_CITIES, 
  CITY_MARKETS, 
  PTA_STATUSES, 
  CONDITION_OPTIONS, 
  DEFAULT_IMAGES 
} from '@/lib/utils';
import FeatureAdToggle from '@/components/FeatureAdToggle';

function PostAdForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') === 'PHONE' ? 'PHONE' : 'LAPTOP';

  // Catalog selected data
  const [catalogData, setCatalogData] = useState<SelectedCatalogData>({
    category: initialCategoryParam,
    itemType: 'COMPLETE_UNIT',
    brand: initialCategoryParam === 'PHONE' ? 'Apple' : 'Lenovo',
    model: initialCategoryParam === 'PHONE' ? 'iPhone 13 Pro' : 'ThinkPad T480',
    ramOptions: initialCategoryParam === 'PHONE' ? [6] : [8, 16, 32],
    storageOptions: initialCategoryParam === 'PHONE' ? ['128GB', '256GB', '512GB', '1TB'] : ['256GB NVMe SSD', '512GB NVMe SSD', '1TB NVMe SSD'],
  });

  // Seller variables
  const [title, setTitle] = useState(
    initialCategoryParam === 'PHONE' ? 'Apple iPhone 13 Pro' : 'Lenovo ThinkPad T480'
  );
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Used - Good (8-9/10)');
  const [description, setDescription] = useState('');

  // Phone specifics
  const [ptaStatus, setPtaStatus] = useState('Official PTA Approved');
  const [batteryHealth, setBatteryHealth] = useState('88');

  // Specs: RAM & Storage
  const [ramGB, setRamGB] = useState('16');
  const [storage, setStorage] = useState('512GB NVMe SSD');

  // Location & Contact
  const [city, setCity] = useState('Lahore');
  const [locationArea, setLocationArea] = useState('Hafeez Centre (Gulberg)');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');

  // Feature ad promotion toggle
  const [isFeatured, setIsFeatured] = useState(false);

  // Images state
  const [images, setImages] = useState<string[]>([]);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCatalogChange = (data: SelectedCatalogData) => {
    setCatalogData(data);

    // Title MUST strictly be the Device Name (or part name for model)
    if (data.itemType === 'SPARE_PART' && data.partName) {
      setTitle(`${data.partName} for ${data.brand} ${data.model}`);
    } else {
      setTitle(`${data.brand} ${data.model}`);
    }

    // Dynamic RAM and Storage handling:
    if (data.category === 'PHONE') {
      const phoneRams = data.ramOptions && data.ramOptions.length > 0 ? data.ramOptions : [6];
      setRamGB(phoneRams[0].toString());

      const phoneStorages = data.storageOptions && data.storageOptions.length > 0
        ? data.storageOptions
        : ['128GB', '256GB', '512GB'];
      setStorage(phoneStorages[0]);
    } else {
      // Laptop: default to 16GB RAM and 512GB NVMe SSD
      if (!ramGB || ramGB === '6') setRamGB('16');
      if (!storage || storage === '128GB') setStorage('512GB NVMe SSD');
    }
  };

  const handleAddDefaultImage = () => {
    const fallback = catalogData.itemType === 'SPARE_PART' 
      ? DEFAULT_IMAGES.part 
      : catalogData.category === 'LAPTOP' 
      ? DEFAULT_IMAGES.laptop 
      : DEFAULT_IMAGES.phone;
    setImages((prev) => [...prev, fallback]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title || !price || !sellerName || !sellerPhone || !city) {
      setErrorMessage('Please fill in all required fields (Title, Price, Seller Name, Phone, City)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title,
        category: catalogData.category,
        itemType: catalogData.itemType,
        deviceId: catalogData.deviceId,
        partCatalogId: catalogData.partCatalogId,
        brand: catalogData.brand,
        model: catalogData.model,
        partName: catalogData.partName,
        partNumber: catalogData.partNumber,
        price: parseInt(price),
        condition,
        ramGB: ramGB ? parseInt(ramGB) : undefined,
        storage: storage || undefined,
        cameraSpec: catalogData.cameraSummary || catalogData.mainCamera || undefined,
        screenSize: catalogData.screenSize || catalogData.defaultScreen || undefined,
        specsLockedNotes: `Screen: ${catalogData.screenSize || 'Standard'} | CPU: ${catalogData.chipset || 'Catalog'} | RAM: ${ramGB}GB`,
        city,
        locationArea,
        sellerName,
        sellerPhone,
        whatsappNumber: sellerPhone.replace(/[^0-9]/g, ''),
        description,
        isFeatured,
        images: images.length > 0 ? images : [
          catalogData.category === 'LAPTOP' ? DEFAULT_IMAGES.laptop : DEFAULT_IMAGES.phone
        ],
      };

      if (catalogData.category === 'PHONE') {
        payload.ptaStatus = ptaStatus;
        if (batteryHealth) payload.batteryHealth = parseInt(batteryHealth);
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.listing) {
        router.push(`/listings/${data.listing.id}`);
      } else {
        setErrorMessage(data.error || 'Failed to publish listing');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error creating ad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMarkets = CITY_MARKETS[city] || ['Main Tech Centre', 'Other Market'];

  // Phone variants
  const phoneRams = catalogData.ramOptions && catalogData.ramOptions.length > 0 
    ? catalogData.ramOptions 
    : [6];
  const phoneStorages = catalogData.storageOptions && catalogData.storageOptions.length > 0 
    ? catalogData.storageOptions 
    : ['128GB', '256GB', '512GB'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            CATALOG-FIRST AD POSTING
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Post Hardware or Spare Part Ad
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lock verified hardware attributes from our 10-year master catalog registry. Clean titles, strict variants for phones, and upgradeable options for laptops.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Catalog Picker */}
        <section className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Master Catalog Selection</span>
          </div>
          <CatalogPicker
            initialCategory={initialCategoryParam}
            initialItemType="COMPLETE_UNIT"
            onCatalogChange={handleCatalogChange}
            allowPartSelection={true}
          />
        </section>

        {/* Step 2: Listing Title & Price */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Pricing & Hardware Configuration</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Ad Title (Clean Device Name) <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-slate-400">Specs and condition are displayed as clean tags</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Samsung Galaxy S22 Ultra"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asking Price (PKR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">PKR</span>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 68500"
                  className="w-full pl-12 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC SPECS LOGIC: PHONES (Strict Variants) vs LAPTOPS (Upgradeable) */}
          {catalogData.category === 'PHONE' ? (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-200/60 p-2.5 rounded-xl text-xs text-blue-900">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  <strong>Strict Phone Variants:</strong> RAM and Storage are constrained strictly to verified manufacturer releases for <strong>{catalogData.brand} {catalogData.model}</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* RAM (Strict) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>Manufacturer RAM</span>
                    </span>
                    {phoneRams.length === 1 && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                        Fixed Spec
                      </span>
                    )}
                  </label>
                  {phoneRams.length === 1 ? (
                    <div className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-slate-700 font-mono font-bold flex items-center justify-between">
                      <span>{phoneRams[0]} GB RAM</span>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ) : (
                    <select
                      value={ramGB}
                      onChange={(e) => setRamGB(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium"
                    >
                      {phoneRams.map((r) => (
                        <option key={r} value={r}>{r} GB RAM</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Storage (Strict Dropdown) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    <span>Manufacturer Storage</span>
                  </label>
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium"
                  >
                    {phoneStorages.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PTA Status & Battery Health */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>PTA Approval Status</span>
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono">DIRBS</span>
                  </label>
                  <select
                    value={ptaStatus}
                    onChange={(e) => setPtaStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-blue-200 bg-blue-50/30 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    {PTA_STATUSES.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-blue-600" />
                    <span>Battery Health % (e.g. 88)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(e.target.value)}
                    placeholder="88"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* LAPTOP SPECIFICS: UPGRADEABLE LOGIC */
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-200/60 p-2.5 rounded-xl text-xs text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Upgradeable Laptop Hardware:</strong> Laptops can be customized. Specify your installed configuration below ({catalogData.ramLimits || 'SO-DIMM slots'}).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Installed RAM (Flexible Upgraded Options) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>Installed RAM (GB)</span>
                  </label>
                  <select
                    value={ramGB}
                    onChange={(e) => setRamGB(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium"
                  >
                    <option value="8">8 GB RAM</option>
                    <option value="16">16 GB RAM (Standard)</option>
                    <option value="24">24 GB RAM</option>
                    <option value="32">32 GB RAM (Pro)</option>
                    <option value="64">64 GB RAM (Max Workstation)</option>
                  </select>
                </div>

                {/* Storage Type & Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                    <span>Storage Configuration</span>
                  </label>
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium"
                  >
                    <option value="256GB NVMe SSD">256GB NVMe SSD</option>
                    <option value="512GB NVMe SSD">512GB NVMe SSD</option>
                    <option value="1TB NVMe SSD">1TB NVMe SSD</option>
                    <option value="2TB NVMe SSD">2TB NVMe SSD</option>
                    <option value="1TB HDD + 256GB SSD">1TB HDD + 256GB SSD (Dual Drive)</option>
                    <option value="128GB SSD">128GB SSD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description & Checking Warranty Terms
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention original charger included, cosmetic marks, battery backup hours, 7-days shop checking warranty, test bench availability at Hafeez Centre..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </section>

        {/* Step 3: Location & Seller WhatsApp */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">3</span>
            <span>Location & Direct WhatsApp Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const markets = CITY_MARKETS[e.target.value] || [];
                  if (markets.length > 0) setLocationArea(markets[0]);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Local Area / Tech Plaza
              </label>
              <select
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {currentMarkets.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seller / Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Usman Tech Hub / Hafeez Centre Shop #45"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone / WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="03001234567"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>
        </section>

        {/* Step 4: Multi-File Photo Uploads */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">4</span>
            <span>Photos & Inspection Preview</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload Device Photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleAddDefaultImage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs text-slate-600 hover:bg-gray-50 transition-colors"
            >
              <span>+ Add Placeholder Image</span>
            </button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-100">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-slate-900/80 text-white px-1.5 py-0.5 rounded font-mono">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Step 5: Feature Ad Promotion (Mock) */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">5</span>
            <span>Promote Your Listing</span>
          </div>

          <FeatureAdToggle
            initialFeatured={isFeatured}
            onToggle={(active) => setIsFeatured(active)}
          />
        </section>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 btn-tactile"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing Ad...' : 'Publish Ad to Marketplace'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PostAdPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading form...</div>}>
      <PostAdForm />
    </Suspense>
  );
}
