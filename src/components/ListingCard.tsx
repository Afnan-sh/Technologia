'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Sparkles, 
  Clock, 
  Smartphone, 
  Laptop, 
  Wrench,
  Camera,
  Cpu,
  HardDrive,
  Monitor,
  Heart,
  ShieldCheck,
  Star,
  User as UserIcon
} from 'lucide-react';
import { formatPKR, formatRelativeTime } from '@/lib/utils';
import WhatsAppButton from './WhatsAppButton';
import { useAuth } from '@/context/AuthContext';

interface ListingCardProps {
  listing: any;
  onInitiateChat?: (listing: any) => void;
  isSavedInitial?: boolean;
}

export default function ListingCard({ listing, onInitiateChat, isSavedInitial = false }: ListingCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [savingLoading, setSavingLoading] = useState(false);

  React.useEffect(() => {
    setIsSaved(Boolean(isSavedInitial));
  }, [isSavedInitial]);

  let images: string[] = [];
  try {
    images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
  } catch (e) {
    images = [listing.images];
  }
  const thumbnail = images && images.length > 0 
    ? images[0] 
    : (listing.category === 'LAPTOP' 
      ? 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' 
      : 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80');

  // Title: MUST only be the Device Name (e.g. "Samsung Galaxy S22 Ultra" or "Lenovo ThinkPad T480")
  let cleanDeviceTitle = listing.title;
  if (listing.itemType === 'SPARE_PART' && listing.partName) {
    cleanDeviceTitle = `${listing.partName} - ${listing.brand} ${listing.model}`;
  } else if (listing.brand && listing.model) {
    cleanDeviceTitle = `${listing.brand} ${listing.model}`;
  }

  // Camera spec (phones only)
  const cameraSpec = listing.cameraSpec || listing.device?.cameraSummary;

  // Screen size
  const screenSize = listing.screenSize || listing.device?.screenSize || listing.device?.defaultScreen;

  // Seller info & trust score
  const sellerId = listing.userId || listing.user?.id;
  const isVerifiedShop = Boolean(listing.isVerifiedShop || listing.user?.isVerifiedShop || listing.user?.role === 'SHOPKEEPER');
  const sellerName = listing.user?.shopName || listing.sellerName || listing.user?.name || 'Seller';
  const trustScore = listing.sellerTrustScore ?? (listing.user?.stats?.trustScore ?? 100);
  const reviewCount = listing.sellerReviewCount ?? (listing.user?.stats?.reviewCount ?? 0);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/');
      return;
    }
    const previousState = isSaved;
    // Optimistic toggle
    setIsSaved(!previousState);
    setSavingLoading(true);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.saved);
      } else {
        setIsSaved(previousState);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setIsSaved(previousState);
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col sm:flex-row bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs hover-card-lift transition-all duration-200">
      {/* Featured Badge if flagged */}
      {listing.isFeatured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-amber-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-200" />
          <span>Featured</span>
        </div>
      )}

      {/* Bookmark Heart Button on Thumbnail */}
      <button
        onClick={handleToggleSave}
        disabled={savingLoading}
        title={isSaved ? 'Remove from saved' : 'Save ad'}
        className="absolute top-2.5 right-2.5 sm:top-2.5 sm:left-auto sm:right-auto sm:left-28 sm:md:left-32 z-10 p-1.5 rounded-full bg-white/95 hover:bg-white shadow-xs backdrop-blur-xs transition-colors group/heart"
      >
        <Heart 
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'
          }`} 
        />
      </button>

      {/* Left Side: Thumbnail image (w-36 h-36 or w-40 h-40 on sm) */}
      <Link 
        href={`/listings/${listing.id}`} 
        className="relative w-full sm:w-36 md:w-40 sm:h-auto aspect-video sm:aspect-square flex-shrink-0 bg-gray-100 overflow-hidden block"
      >
        <img
          src={thumbnail}
          alt={cleanDeviceTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Indicator Tag */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-gray-200/60 shadow-xs">
          {listing.itemType === 'SPARE_PART' ? (
            <>
              <Wrench className="w-3 h-3 text-amber-800" />
              <span>Part</span>
            </>
          ) : listing.category === 'LAPTOP' ? (
            <>
              <Laptop className="w-3 h-3 text-blue-600" />
              <span>Laptop</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3 text-blue-600" />
              <span>Phone</span>
            </>
          )}
        </div>
      </Link>

      {/* Right Side: Content Area */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5 min-w-0">
        <div>
          {/* Header row: Title and Price */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/listings/${listing.id}`} className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {cleanDeviceTitle}
              </h3>
            </Link>

            {/* Price (PKR) prominent */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm sm:text-base font-bold text-blue-600 font-mono leading-tight">
                {formatPKR(listing.price)}
              </div>
            </div>
          </div>

          {/* Subtitle: Location and Time in small gray font */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{listing.city} &bull; {listing.locationArea || 'Meetup'}</span>
            <span>&bull;</span>
            <span className="flex-shrink-0">{formatRelativeTime(listing.createdAt)}</span>
          </div>

          {/* Seller Reputation Row */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
            {sellerId ? (
              <Link
                href={`/profile/${sellerId}`}
                className="font-semibold text-slate-700 hover:text-blue-600 truncate flex items-center gap-1"
              >
                <span>{sellerName}</span>
              </Link>
            ) : (
              <span className="font-semibold text-slate-700 truncate">{sellerName}</span>
            )}

            {isVerifiedShop && (
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded-full flex-shrink-0">
                <ShieldCheck className="w-3 h-3 text-amber-800" />
                <span>Verified Shop</span>
              </span>
            )}

            <span className="text-[10px] font-mono text-slate-500 font-semibold flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{trustScore}% Trust</span>
              {reviewCount > 0 && <span className="text-slate-400">({reviewCount})</span>}
            </span>
          </div>
        </div>

        {/* Specs Pill Tags (Strictly: RAM, Storage, Condition, Camera (phones), Screen Size) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {/* Condition Badge */}
          {listing.condition && (
            <span className="rounded-full bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 font-medium border border-gray-200/60">
              {listing.condition}
            </span>
          )}

          {/* RAM */}
          {listing.ramGB && (
            <span className="rounded-full bg-blue-50 text-blue-700 text-[11px] px-2.5 py-0.5 font-medium border border-blue-100/60 font-mono flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>{listing.ramGB}GB RAM</span>
            </span>
          )}

          {/* Storage */}
          {listing.storage && (
            <span className="rounded-full bg-slate-50 text-slate-700 text-[11px] px-2.5 py-0.5 font-medium border border-gray-200/60 font-mono flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[95px]">{listing.storage}</span>
            </span>
          )}

          {/* Camera (Phones only) */}
          {listing.category === 'PHONE' && cameraSpec && (
            <span className="rounded-full bg-blue-50 text-blue-700 text-[11px] px-2.5 py-0.5 font-medium border border-blue-100/60 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{cameraSpec}</span>
            </span>
          )}

          {/* Screen Size */}
          {screenSize && (
            <span className="rounded-full bg-slate-50 text-slate-600 text-[11px] px-2.5 py-0.5 font-medium border border-gray-200/60 flex items-center gap-1">
              <Monitor className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[95px]">{screenSize}</span>
            </span>
          )}

          {/* PTA Status (if phone) */}
          {listing.category === 'PHONE' && listing.ptaStatus && (
            <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 font-semibold border border-emerald-200/60">
              {listing.ptaStatus}
            </span>
          )}
        </div>

        {/* Footer Actions Row */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          <span className="text-[10px] text-slate-400">
            Cash on physical inspection
          </span>

          <div className="flex items-center gap-2">
            <WhatsAppButton
              phone={listing.whatsappNumber || listing.sellerPhone}
              adTitle={cleanDeviceTitle}
              adId={listing.id}
              price={listing.price}
              variant="icon"
            />
            <Link
              href={`/listings/${listing.id}`}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors btn-tactile"
            >
              View Ad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
