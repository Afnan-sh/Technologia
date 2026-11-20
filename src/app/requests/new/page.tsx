'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CatalogPicker, { SelectedCatalogData } from '@/components/CatalogPicker';
import { 
  Target, 
  AlertTriangle, 
  Check, 
  Upload, 
  X, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import { PAKISTANI_CITIES, CITY_MARKETS, REQUEST_CONDITIONS } from '@/lib/utils';

export default function NewPartRequestPage() {
  const router = useRouter();

  // Catalog Picker state
  const [catalogData, setCatalogData] = useState<SelectedCatalogData>({
    category: 'LAPTOP',
    itemType: 'SPARE_PART',
    brand: 'Lenovo',
    model: 'ThinkPad T480',
  });

  // Request variables
  const [partType, setPartType] = useState('Screen / Display');
  const [title, setTitle] = useState('Screen / Display - Lenovo ThinkPad T480');
  const [customPartNumber, setCustomPartNumber] = useState('');
  const [acceptableConditions, setAcceptableConditions] = useState<string[]>([
    'Brand New (OEM)',
    'Working Pull / Used',
  ]);
  const [maxBudgetPKR, setMaxBudgetPKR] = useState('');
  const [urgency, setUrgency] = useState<'Urgent / Immediate' | 'Flexible'>('Urgent / Immediate');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Buyer Info
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [locationArea, setLocationArea] = useState('Hafeez Centre (Gulberg)');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCatalogChange = (data: SelectedCatalogData) => {
    setCatalogData(data);
    const activePart = data.partName || data.partType || partType;
    if (data.partType) setPartType(data.partType);
    if (data.partNumber) setCustomPartNumber(data.partNumber);
    setTitle(`${activePart} - ${data.brand} ${data.model}`);
  };

  const toggleCondition = (cond: string) => {
    setAcceptableConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title || !partType || !maxBudgetPKR || !buyerName || !buyerPhone || !city) {
      setErrorMessage('Please fill in all required fields (Title, Part Type, Target Budget, Buyer Name, Phone, City)');
      return;
    }

    if (acceptableConditions.length === 0) {
      setErrorMessage('Please check at least one acceptable condition');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category: catalogData.category,
          deviceId: catalogData.deviceId,
          partCatalogId: catalogData.partCatalogId,
          brand: catalogData.brand,
          model: catalogData.model,
          partType,
          partNumber: customPartNumber || catalogData.partNumber || null,
          acceptableConditions,
          maxBudgetPKR: parseInt(maxBudgetPKR),
          urgency,
          description,
          photoUrl: photoUrl || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
          buyerName,
          buyerPhone,
          city,
          locationArea,
        }),
      });

      const data = await res.json();
      if (data.success && data.request) {
        router.push('/requests');
      } else {
        setErrorMessage(data.error || 'Failed to submit request');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests Board</span>
        </Link>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
            SOURCING REQUEST CREATION
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Post a Spare Part Sourcing Request
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Specify the laptop or phone model, upload photos of the broken connector or part number sticker, and invite quotes from local tech markets.
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
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Link to Laptop / Phone Model</span>
          </div>
          <CatalogPicker
            initialCategory="LAPTOP"
            initialItemType="SPARE_PART"
            onCatalogChange={handleCatalogChange}
            allowPartSelection={true}
          />
        </section>

        {/* Step 2: Part Requirements & Budget */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Part Specs, Target Budget & Urgency</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sourcing Request Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Looking for 30-pin 1080p Matte IPS Panel for ThinkPad T480"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Part Type / Category <span className="text-red-500">*</span>
              </label>
              <select
                value={partType}
                onChange={(e) => {
                  const val = e.target.value;
                  setPartType(val);
                  setTitle(`${val} - ${catalogData.brand} ${catalogData.model}`);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              >
                <option value="Screen / Display">Screen / Display</option>
                <option value="Body / Housing">Body / Housing</option>
                <option value="Battery / Charger">Battery / Charger</option>
                <option value="IC / Motherboard component">IC / Motherboard component</option>
                <option value="Charging Port / Flex">Charging Port / Flex</option>
                <option value="Keyboard">Keyboard Assembly</option>
                <option value="Heatsink / Fan">Heatsink / Fan Cooler</option>
                <option value="Camera Module">Camera Module</option>
                <option value="Other Component">Other Component</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OEM Part Number or Code (Optional)
              </label>
              <input
                type="text"
                value={customPartNumber}
                onChange={(e) => setCustomPartNumber(e.target.value)}
                placeholder="e.g. 01AV421, LP140WF3, GH82-30465A"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Target Budget (PKR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">PKR</span>
                <input
                  type="number"
                  required
                  value={maxBudgetPKR}
                  onChange={(e) => setMaxBudgetPKR(e.target.value)}
                  placeholder="e.g. 12000"
                  className="w-full pl-12 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency('Urgent / Immediate')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    urgency === 'Urgent / Immediate'
                      ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                      : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Urgent / Immediate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('Flexible')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    urgency === 'Flexible'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>Flexible</span>
                </button>
              </div>
            </div>
          </div>

          {/* Acceptable Conditions Checkboxes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Acceptable Conditions (Check all that apply) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {REQUEST_CONDITIONS.map((cond) => {
                const checked = acceptableConditions.includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      checked
                        ? 'bg-blue-50 text-blue-700 border-blue-600'
                        : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                    }`}>
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                    <span>{cond}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description of Broken Part & Fitting Requirements
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe pin count (e.g. 30-pin vs 40-pin), color finish, whether testing on spot is needed, etc."
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Photo of Broken Part */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Photo of Broken Ribbon / Connector / Part Sticker
            </label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-200 hover:border-blue-600 rounded-xl p-4 text-center cursor-pointer relative bg-gray-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-700">Click to upload photo</span>
              </div>
              {photoUrl && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-gray-200">
                  <img src={photoUrl} alt="part" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Step 3: Buyer Details & WhatsApp */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">3</span>
            <span>Buyer Location & Contact for Quotes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your City <span className="text-red-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const markets = CITY_MARKETS[e.target.value];
                  if (markets && markets.length > 0) setLocationArea(markets[0]);
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
                Area / Plaza (e.g. Hafeez Centre, Blue Area)
              </label>
              <input
                type="text"
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                placeholder="e.g. Gulberg III, near Hafeez Centre"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Usman Ghani"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="03001239876"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-lg bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 btn-tactile"
          >
            <Target className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting Request...' : 'Post Sourcing Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
