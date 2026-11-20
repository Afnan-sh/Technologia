'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Target, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Check, 
  Wrench,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { formatPKR, formatRelativeTime } from '@/lib/utils';
import WhatsAppButton from './WhatsAppButton';
import QuoteModal from './QuoteModal';

interface PartRequestCardProps {
  request: any;
  onQuoteAdded?: (quote: any) => void;
}

export default function PartRequestCard({ request, onQuoteAdded }: PartRequestCardProps) {
  const [showQuotes, setShowQuotes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotes, setQuotes] = useState<any[]>(request.quotes || []);
  const [isSaved, setIsSaved] = useState(false);

  const isUrgent = request.urgency === 'Urgent / Immediate';

  let acceptableConditions: string[] = [];
  try {
    acceptableConditions = typeof request.acceptableConditions === 'string'
      ? JSON.parse(request.acceptableConditions)
      : request.acceptableConditions || [];
  } catch (e) {
    acceptableConditions = ['Working Pull / Used'];
  }

  const handleQuoteSubmitted = (newQuote: any) => {
    setQuotes((prev) => [newQuote, ...prev]);
    setShowQuotes(true);
    if (onQuoteAdded) {
      onQuoteAdded(newQuote);
    }
  };

  // Dynamic Title: MUST strictly render as: [Part Name] - [Device Name]
  // e.g. "Screen / Display - iPhone 13 Pro" or "Charging Port / Flex - Lenovo ThinkPad T480"
  const partName = request.partCatalog?.name || request.partType || 'Part';
  const deviceName = (request.brand && request.model)
    ? `${request.brand} ${request.model}`
    : request.model || request.device?.model || 'Device';
  const displayTitle = `${partName} - ${deviceName}`;

  return (
    <>
      <div className="bg-white border border-gray-200 border-l-4 border-l-amber-800 rounded-2xl overflow-hidden shadow-xs hover-card-lift transition-all duration-200">
        {/* Top Urgency / Info Header */}
        <div className="px-5 py-2.5 border-b border-gray-100 flex items-center justify-between text-xs bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-800" />
              <span>Part Sourcing Request</span>
            </span>
            {isUrgent && (
              <span className="rounded-full bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 font-bold border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-800" />
                <span>Urgent</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(request.createdAt)}</span>
            </div>
            <button
              onClick={() => setIsSaved(!isSaved)}
              title={isSaved ? "Saved" : "Save Request"}
              className="p-1 rounded-full transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isSaved ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"}`} />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <Link href={`/requests/${request.id}`} className="hover:text-blue-600 transition-colors">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {displayTitle}
                </h3>
              </Link>

              {/* Model & Part Specs Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 font-medium border border-blue-100">
                  {request.brand} &bull; {request.model}
                </span>

                <span className="rounded-full bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 font-medium">
                  {request.partType}
                </span>

                {request.partNumber && (
                  <span className="rounded-full bg-amber-50 text-amber-800 text-xs px-2.5 py-0.5 font-medium border border-amber-200/60 font-mono">
                    SKU: {request.partNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Target Budget Box */}
            <div className="sm:text-right flex-shrink-0 bg-blue-50/60 border border-blue-100 p-2.5 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Target Budget
              </span>
              <span className="text-lg font-bold text-blue-700 font-mono">
                {formatPKR(request.maxBudgetPKR)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            {request.description}
          </p>

          {/* Acceptable Conditions & Location tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Acceptable:</span>
            {acceptableConditions.map((cond, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
              >
                <Check className="w-2.5 h-2.5 text-blue-600" />
                <span>{cond}</span>
              </span>
            ))}

            <div className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{request.city} {request.locationArea ? `(${request.locationArea})` : ''}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            {/* Buyer Contact */}
            <div className="flex items-center gap-2">
              <WhatsAppButton
                phone={request.buyerWhatsapp || request.buyerPhone}
                adTitle={`Part Request: ${request.title}`}
                adId={request.id}
                price={request.maxBudgetPKR}
                variant="sm"
              />
              <span className="text-xs text-slate-500">
                Buyer: <strong className="text-slate-800">{request.buyerName}</strong>
              </span>
            </div>

            {/* Offer Part / Quotes Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs shadow-xs transition-colors btn-tactile"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Offer Part</span>
              </button>

              {quotes.length > 0 && (
                <button
                  onClick={() => setShowQuotes(!showQuotes)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium text-slate-700 transition-colors"
                >
                  <span>{quotes.length} {quotes.length === 1 ? 'Offer' : 'Offers'}</span>
                  {showQuotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Quotes Section */}
        {showQuotes && quotes.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-800" />
                <span>Pitched Offers ({quotes.length})</span>
              </h4>
            </div>

            <div className="space-y-2">
              {quotes.map((quote: any) => (
                <div
                  key={quote.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-blue-700">
                        {formatPKR(quote.offeredPrice)}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {quote.condition}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        by <strong className="text-slate-700">{quote.sellerName}</strong> ({quote.city})
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
                      variant="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={request}
        onQuoteSubmitted={handleQuoteSubmitted}
      />
    </>
  );
}
