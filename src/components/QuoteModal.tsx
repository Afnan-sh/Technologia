'use client';

import React, { useState } from 'react';
import { X, Send, Camera, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { formatPKR, PAKISTANI_CITIES } from '@/lib/utils';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onQuoteSubmitted?: (newQuote: any) => void;
}

export default function QuoteModal({
  isOpen,
  onClose,
  request,
  onQuoteSubmitted,
}: QuoteModalProps) {
  const [offeredPrice, setOfferedPrice] = useState('');
  const [condition, setCondition] = useState('Working Pull / Used');
  const [notes, setNotes] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [city, setCity] = useState(request?.city || 'Lahore');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successQuote, setSuccessQuote] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!offeredPrice || !condition || !notes || !sellerName || !sellerPhone) {
      setErrorMessage('Please fill in all required quote details');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeredPrice: parseInt(offeredPrice),
          condition,
          notes,
          photoUrl: photoUrl || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
          sellerName,
          sellerPhone,
          city,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessQuote(data.quote);
        if (onQuoteSubmitted) {
          onQuoteSubmitted(data.quote);
        }
      } else {
        setErrorMessage(data.error || 'Failed to submit quote');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessQuote(null);
    setOfferedPrice('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" 
        onClick={handleReset} 
      />

      <div className="relative z-10 w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header with brown accent */}
        <div className="h-[3px] w-full bg-amber-800" />
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 font-mono">
                OFFER PART / SUBMIT QUOTE
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
              {request.title}
            </h3>
            <p className="text-xs text-slate-500">
              Buyer Target Budget: <strong className="text-blue-700 font-mono">{formatPKR(request.maxBudgetPKR)}</strong>
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successQuote ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Offer Submitted Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your offer of <strong className="text-slate-800 font-mono">{formatPKR(successQuote.offeredPrice)}</strong> is attached to the sourcing request. The buyer ({request.buyerName}) will see your offer directly.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors btn-tactile"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Offered Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Offered Price (PKR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">PKR</span>
                <input
                  type="number"
                  required
                  placeholder="e.g. 11500"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Part Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Working Pull / Used">Working Pull / Used (Tested 100%)</option>
                <option value="Brand New (OEM)">Brand New (OEM Sealed / Unused)</option>
                <option value="Faulty for IC / donor scrap">Faulty for IC / Donor Board (Component Scrap)</option>
              </select>
            </div>

            {/* Notes / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition Note & Compatibility Proof <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Original pull from working Lenovo T480, no scratches or dead spots. Free test bench available at Hafeez Centre shop."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Part Photo URL or Sticker / Connector Photo</span>
                <span className="text-[10px] text-slate-400">Optional</span>
              </label>
              <div className="relative">
                <Camera className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="Paste image link or leave default"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Seller Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name / Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waseem LCD Spares"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your City & Plaza
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 btn-tactile"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting Offer...' : 'Submit Offer to Buyer'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
