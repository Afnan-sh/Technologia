'use client';

import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFeatureListingAction } from '@/app/actions/listings';

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
        const res = await toggleFeatureListingAction(listingId);
        if (res.success && res.data) {
          setIsFeatured(res.data.isFeatured);
          setShowNotice(true);
          toast.success(res.data.isFeatured ? 'Featured badge activated!' : 'Featured badge deactivated');
          setTimeout(() => setShowNotice(false), 4000);
        } else {
          toast.error(res.error || 'Failed to update featured status');
        }
      } catch {
        toast.error('Network error updating feature status');
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowNotice(true);
      setTimeout(() => setShowNotice(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Featured Ad Promotion (Mock Payment Flow)
            </span>
            <span className="text-[11px] text-slate-500 block">
              Top of grid placement &bull; Amber highlight badge &bull; 4x click-through
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            isFeatured ? 'bg-amber-800' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isFeatured ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {showNotice && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 transition-all">
          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>
            {isFeatured 
              ? 'Featured Ad activated! Simulated PKR 500 JazzCash payment processed.' 
              : 'Featured badge removed.'}
          </span>
        </div>
      )}
    </div>
  );
}
