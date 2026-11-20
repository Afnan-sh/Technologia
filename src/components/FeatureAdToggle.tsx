'use client';

import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

interface FeatureAdToggleProps {
  listingId?: string;
  initialFeatured?: boolean;
  onToggle?: (isFeatured: boolean) => void;
}

export default function FeatureAdToggle({
  listingId,
  initialFeatured = false,
  onToggle,
}: FeatureAdToggleProps) {
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const handleToggle = async () => {
    const nextState = !isFeatured;
    setIsFeatured(nextState);
    if (onToggle) onToggle(nextState);

    if (listingId) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/listings/${listingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFeatured: nextState }),
        });
        const data = await res.json();
        if (data.success) {
          setShowNotice(true);
          setTimeout(() => setShowNotice(false), 4000);
        }
      } catch (e) {
        console.error('Error toggling featured ad:', e);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowNotice(true);
      setTimeout(() => setShowNotice(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Featured Ad Promotion (Mock Payment Flow)
            </span>
            <span className="text-[11px] text-slate-500">
              Pin to the top of listings and add a featured badge
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isFeatured ? 'bg-amber-800' : 'bg-gray-200'
          }`}
          aria-label="Toggle Featured Ad"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isFeatured ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {showNotice && (
        <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-amber-800" />
          <span>
            {isFeatured
              ? 'Featured Ad active: this ad will be highlighted and pinned to the top!'
              : 'Featured status removed.'}
          </span>
        </div>
      )}
    </div>
  );
}
