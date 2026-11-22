'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { toggleSaveListingAction } from '@/app/actions/listings';
import { cn } from '@/lib/utils';

interface SaveListingButtonProps {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
  variant?: 'card' | 'detail';
}

export function SaveListingButton({
  listingId,
  initialSaved = false,
  className,
  variant = 'card',
}: SaveListingButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to save listings');
      router.push('/');
      return;
    }

    setLoading(true);
    try {
      const res = await toggleSaveListingAction(listingId);
      if (res.success && res.data) {
        setIsSaved(res.data.isSaved);
        if (res.data.isSaved) {
          toast.success('Listing saved to your dashboard');
        } else {
          toast.info('Listing removed from saved');
        }
      } else {
        toast.error(res.error || 'Failed to update saved status');
      }
    } catch {
      toast.error('Network error updating saved status');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'detail') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border shadow-2xs',
          isSaved
            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
            : 'bg-white text-slate-700 border-gray-200 hover:bg-slate-50',
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <Heart className={cn('w-4 h-4', isSaved ? 'fill-red-500 text-red-500' : 'text-slate-500')} />
        )}
        <span>{isSaved ? 'Saved to Wishlist' : 'Save Listing'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isSaved ? 'Remove from saved' : 'Save ad'}
      className={cn(
        'z-10 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 shadow-xs backdrop-blur-xs transition-colors disabled:opacity-50',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
      ) : (
        <Heart
          className={cn(
            'w-3.5 h-3.5 transition-colors',
            isSaved ? 'fill-red-500 text-red-500' : 'text-slate-500'
          )}
        />
      )}
    </button>
  );
}
