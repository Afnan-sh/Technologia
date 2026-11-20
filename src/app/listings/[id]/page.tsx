'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Laptop, 
  Smartphone, 
  Wrench, 
  MapPin, 
  Battery, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  ArrowLeft, 
  Share2, 
  Check, 
  Eye, 
  Clock, 
  AlertCircle,
  MessageSquare,
  Lock,
  Sparkles
} from 'lucide-react';
import { formatPKR, formatRelativeTime, PTA_STATUSES } from '@/lib/utils';
import WhatsAppButton from '@/components/WhatsAppButton';
import FeatureAdToggle from '@/components/FeatureAdToggle';

export default function ListingDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (data.success) {
          setListing(data.listing);
        }
      } catch (e) {
        console.error('Error fetching listing detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400 animate-pulse">
        Loading listing specifications & seller profile...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500">The ad you are looking for may have expired or been removed.</p>
        <Link href="/home" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  let images: string[] = [];
  try {
    images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
  } catch (e) {
    images = [listing.images];
  }
  if (!images || images.length === 0) {
    images = ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'];
  }

  const ptaConfig = PTA_STATUSES.find(p => p.id === listing.ptaStatus);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleStartChat = () => {
    router.push(`/messages?startWithListing=${listing.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={listing.category === 'LAPTOP' ? '/buy/laptops' : '/buy/mobiles'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {listing.category === 'LAPTOP' ? 'Laptops' : 'Mobiles'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-slate-700 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Ad'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Images + Overview & Seller Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Images & Spec sheet */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Image */}
          <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
            <img
              src={images[selectedImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.isFeatured && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-800 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Featured Ad</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200/50 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{listing.viewsCount || 0} Views</span>
            </div>
          </div>

          {/* Image Thumbnails (if multiple) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-blue-600 shadow-2xs' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Verified Specs Sheet */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Verified Hardware Specifications
                </h3>
              </div>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium border border-blue-100">
                Catalog-Locked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Model Registry</span>
                <span className="font-semibold text-slate-800">{listing.brand} {listing.model}</span>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Condition Rating</span>
                <span className="font-semibold text-slate-800">{listing.condition}</span>
              </div>

              {listing.device?.cpuGeneration && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Processor / Generation</span>
                  <span className="font-semibold text-slate-800">{listing.device.cpuGeneration}</span>
                </div>
              )}

              {listing.device?.defaultScreen && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Display Matrix</span>
                  <span className="font-semibold text-slate-800">{listing.device.defaultScreen}</span>
                </div>
              )}

              {listing.ramGB && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Installed RAM</span>
                  <span className="font-semibold text-slate-800 font-mono">{listing.ramGB}GB ({listing.device?.supportedRamType || 'DDR4'})</span>
                </div>
              )}

              {listing.storage && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Storage Unit</span>
                  <span className="font-semibold text-slate-800 font-mono">{listing.storage}</span>
                </div>
              )}

              {listing.batteryHealth && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Battery Health %</span>
                  <span className="font-semibold text-blue-600 font-mono">{listing.batteryHealth}% Capacity</span>
                </div>
              )}

              {listing.partNumber && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">OEM Part Number</span>
                  <span className="font-semibold text-amber-800 font-mono">{listing.partNumber}</span>
                </div>
              )}
            </div>

            {listing.specsLockedNotes && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-slate-500 leading-relaxed border border-gray-100">
                <strong className="text-slate-700">Catalog Reference:</strong> {listing.specsLockedNotes}
              </div>
            )}
          </div>

          {/* Seller Description */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Seller Description & Checking Warranty
            </h3>
            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </div>
          </div>
        </div>

        {/* Right Col: Price, Actions, PTA, WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-0.5">
                  {listing.itemType === 'SPARE_PART' ? 'SPARE PART' : 'COMPLETE DEVICE'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Posted {formatRelativeTime(listing.createdAt)}</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {listing.title}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Asking Price</span>
                <span className="text-2xl sm:text-3xl font-bold text-blue-700 font-mono">
                  {formatPKR(listing.price)}
                </span>
              </div>
              <span className="text-xs text-blue-600 font-medium">
                Cash on inspection
              </span>
            </div>

            {/* PTA Status Callout */}
            {listing.category === 'PHONE' && listing.ptaStatus && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>PTA Status: {listing.ptaStatus}</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  {ptaConfig?.description}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">{listing.city}</strong>
                <span>{listing.locationArea || 'Direct meetup in tech plaza'}</span>
              </div>
            </div>

            {/* Direct Handoff CTAs */}
            <div className="space-y-3 pt-2">
              <WhatsAppButton
                phone={listing.whatsappNumber || listing.sellerPhone}
                adTitle={listing.title}
                adId={listing.id}
                price={listing.price}
                variant="lg"
              />

              <button
                onClick={handleStartChat}
                className="w-full py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-800 border border-gray-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 btn-tactile"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Chat in-app on Technologia</span>
              </button>

              <Link
                href="/compare"
                className="w-full py-2.5 px-3 rounded-lg border border-blue-200 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Compare Specs in 10-Yr Registry</span>
              </Link>
            </div>

            {/* Seller Info Summary */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Seller</span>
                <strong className="text-slate-800">{listing.sellerName}</strong>
              </div>
              <div className="text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Phone</span>
                <span className="font-mono text-slate-800 font-semibold">{listing.sellerPhone}</span>
              </div>
            </div>
          </div>

          {/* Feature Ad Promotion Toggle */}
          <FeatureAdToggle
            listingId={listing.id}
            initialFeatured={listing.isFeatured}
            onToggle={(newFeatured) => setListing((prev: any) => ({ ...prev, isFeatured: newFeatured }))}
          />
        </div>
      </div>
    </div>
  );
}
