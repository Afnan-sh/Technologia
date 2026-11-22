import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { 
  Target, 
  Clock, 
  Check, 
  ArrowLeft, 
  AlertTriangle, 
  Wrench, 
  MapPin 
} from 'lucide-react';
import { formatPKR, formatRelativeTime } from '@/lib/utils';
import WhatsAppButton from '@/components/WhatsAppButton';
import { OfferPartButton } from '@/components/features/OfferPartButton';
import { ShareButton } from '@/components/features/ShareButton';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface RequestDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: RequestDetailPageProps): Promise<Metadata> {
  const request = await prisma.partRequest.findUnique({
    where: { id: params.id },
  });

  if (!request) {
    return {
      title: 'Sourcing Request Not Found | Technologia',
    };
  }

  return {
    title: `${request.title} (Max: PKR ${request.maxBudgetPKR.toLocaleString('en-PK')}) | Technologia`,
    description: `Active sourcing request for ${request.partType} for ${request.brand} ${request.model} in ${request.city}. Buyer budget: PKR ${request.maxBudgetPKR}.`,
  };
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const request = await prisma.partRequest.findUnique({
    where: { id: params.id },
    include: {
      device: true,
      partCatalog: true,
      quotes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!request) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Target className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Sourcing Request Not Found</h2>
        <p className="text-xs text-slate-500">The request may have been fulfilled or closed by the buyer.</p>
        <Link href="/requests" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">
          Return to Requests Board
        </Link>
      </div>
    );
  }

  const isUrgent = request.urgency === 'Urgent / Immediate';

  let acceptableConditions: string[] = [];
  try {
    acceptableConditions = typeof request.acceptableConditions === 'string'
      ? JSON.parse(request.acceptableConditions)
      : (request.acceptableConditions as unknown as string[]) || [];
  } catch {
    acceptableConditions = ['Working Pull / Used'];
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests Board</span>
        </Link>

        <ShareButton title={request.title} />
      </div>

      {/* Main Sourcing Request */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-amber-800 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between text-xs bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-800" />
              <span>Sourcing Request Ticket</span>
            </span>
            {isUrgent && (
              <span className="rounded-full bg-amber-50 text-amber-800 text-[10px] px-2.5 py-0.5 font-bold border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-800" />
                <span>Urgent</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>Posted {formatRelativeTime(request.createdAt)}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {request.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="rounded-full bg-blue-50 text-blue-700 font-medium px-3 py-0.5 border border-blue-100">
                  {request.brand} {request.model}
                </span>
                <span className="rounded-full bg-slate-100 text-slate-700 font-medium px-3 py-0.5">
                  {request.partType}
                </span>
                {request.partNumber && (
                  <span className="rounded-full bg-amber-50 text-amber-800 font-medium px-3 py-0.5 border border-amber-200/60 font-mono">
                    SKU: {request.partNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Target Budget */}
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl sm:text-right flex-shrink-0">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Buyer Target Budget</span>
              <span className="text-2xl font-bold text-blue-700 font-mono">
                {formatPKR(request.maxBudgetPKR)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {request.description}
          </div>

          {/* Broken Part Photo if attached */}
          {request.photoUrl && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Photo Provided by Buyer
              </h4>
              <div className="w-64 h-48 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                <img src={request.photoUrl} alt="Part requested" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Acceptable Conditions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Acceptable Conditions:</span>
            {acceptableConditions.map((cond, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                <Check className="w-3 h-3 text-blue-600" />
                <span>{cond}</span>
              </span>
            ))}
          </div>

          {/* Buyer Handoff & Pitch Action */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <WhatsAppButton
                phone={request.buyerWhatsapp || request.buyerPhone}
                adTitle={`Part Request: ${request.title}`}
                adId={request.id}
                price={request.maxBudgetPKR}
                variant="md"
              />
              <span className="text-xs text-slate-500">
                Buyer: <strong className="text-slate-800">{request.buyerName}</strong> ({request.city})
              </span>
            </div>

            <OfferPartButton request={request} />
          </div>
        </div>
      </div>

      {/* Submitted Quotes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-800" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Pitched Offers ({request.quotes?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Contact any seller directly via WhatsApp
          </span>
        </div>

        {request.quotes && request.quotes.length > 0 ? (
          <div className="space-y-3">
            {request.quotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-blue-700">
                      {formatPKR(quote.offeredPrice)}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {quote.condition}
                    </span>
                    <span className="text-xs text-slate-400">
                      by <strong className="text-slate-800">{quote.sellerName}</strong> &bull; {quote.city}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;{quote.notes}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <WhatsAppButton
                    phone={quote.sellerWhatsapp || quote.sellerPhone}
                    adTitle={`Your Quote for ${request.title}`}
                    price={quote.offeredPrice}
                    variant="md"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white border border-gray-200 rounded-2xl p-6 text-xs text-slate-500">
            No seller offers submitted yet. Be the first to submit an offer above!
          </div>
        )}
      </div>
    </div>
  );
}
