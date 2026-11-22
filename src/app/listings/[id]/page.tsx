import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { 
  MapPin, 
  Clock, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { formatPKR, formatRelativeTime, PTA_STATUSES } from '@/lib/utils';
import WhatsAppButton from '@/components/WhatsAppButton';
import FeatureAdToggle from '@/components/FeatureAdToggle';
import { ListingGallery } from '@/components/features/ListingGallery';
import { ShareButton } from '@/components/features/ShareButton';
import { SaveListingButton } from '@/components/features/SaveListingButton';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ListingPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
  });

  if (!listing) {
    return {
      title: 'Listing Not Found | Technologia',
    };
  }

  return {
    title: `${listing.title} - PKR ${listing.price.toLocaleString('en-PK')} | Technologia`,
    description: `${listing.title} in ${listing.city}. Condition: ${listing.condition}. Verified specifications locked via Technologia master catalog.`,
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      device: true,
      partCatalog: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          isVerifiedShop: true,
          shopName: true,
          shopAddress: true,
          city: true,
          whatsappNumber: true,
          phone: true,
        },
      },
    },
  });

  if (!listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500">The ad you are looking for may have expired or been removed.</p>
        <Link href="/home" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Asynchronously increment views counter without blocking page render
  prisma.listing.update({
    where: { id: listing.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  let images: string[] = [];
  try {
    images = typeof listing.images === 'string' ? JSON.parse(listing.images) : (listing.images as unknown as string[]);
  } catch {
    images = [listing.images];
  }
  if (!images || images.length === 0) {
    images = ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'];
  }

  const ptaConfig = PTA_STATUSES.find(p => p.id === listing.ptaStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Top Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </Link>

        <div className="flex items-center gap-2">
          <SaveListingButton listingId={listing.id} variant="detail" />
          <ShareButton title={listing.title} />
        </div>
      </div>

      {/* Main Grid: Images + Overview & Seller Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery & Spec Sheet */}
        <div className="lg:col-span-7 space-y-6">
          <ListingGallery
            images={images}
            title={listing.title}
            isFeatured={listing.isFeatured}
            viewsCount={listing.viewsCount}
          />

          {/* Verified Specs Sheet */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
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
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Model Registry</span>
                <span className="font-semibold text-slate-800">{listing.brand} {listing.model}</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Condition Rating</span>
                <span className="font-semibold text-slate-800">{listing.condition}</span>
              </div>

              {listing.device?.cpuGeneration && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Processor / Generation</span>
                  <span className="font-semibold text-slate-800">{listing.device.cpuGeneration}</span>
                </div>
              )}

              {listing.device?.defaultScreen && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Display Matrix</span>
                  <span className="font-semibold text-slate-800">{listing.device.defaultScreen}</span>
                </div>
              )}

              {listing.ramGB && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Installed RAM</span>
                  <span className="font-semibold text-slate-800 font-mono">{listing.ramGB}GB ({listing.device?.supportedRamType || 'DDR4'})</span>
                </div>
              )}

              {listing.storage && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Storage Unit</span>
                  <span className="font-semibold text-slate-800 font-mono">{listing.storage}</span>
                </div>
              )}

              {listing.batteryHealth && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Battery Health %</span>
                  <span className="font-semibold text-blue-600 font-mono">{listing.batteryHealth}% Capacity</span>
                </div>
              )}

              {listing.partNumber && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
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
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Seller Description & Checking Warranty
            </h3>
            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </div>
          </div>
        </div>

        {/* Right Column: Price, Contact, Location */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 space-y-5 shadow-2xs">
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
                {ptaConfig?.description && (
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    {ptaConfig.description}
                  </p>
                )}
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

              <Link
                href={`/messages?startWithListing=${listing.id}`}
                className="w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-slate-800 border border-gray-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Chat in-app on Technologia</span>
              </Link>

              <Link
                href="/compare"
                className="w-full py-2.5 px-3 rounded-xl border border-blue-200 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
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
          />
        </div>
      </div>
    </div>
  );
}
