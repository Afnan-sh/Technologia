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
import WhatsAppButton from '@/components/WhatsAppButton';
import QuoteModal from '@/components/QuoteModal';
import { PartRequestWithRelations, RequestQuoteItem } from '@/types';

export interface SourcingRequestItem {
  id: string;
  title: string;
  category: string;
  brand: string;
  model: string;
  partType: string;
  partNumber?: string | null;
  acceptableConditions: string | string[];
  maxBudgetPKR: number;
  urgency: string;
  description: string;
  photoUrl?: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerWhatsapp: string;
  city: string;
  locationArea?: string | null;
  status: string;
  createdAt: Date | string;
  quotes?: RequestQuoteItem[];
  device?: {
    imageUrl?: string | null;
  } | null;
}

interface SourcingRequestCardProps {
  request: SourcingRequestItem | PartRequestWithRelations;
  onQuoteAdded?: (quote: RequestQuoteItem) => void;
}

export function SourcingRequestCard({ request, onQuoteAdded }: SourcingRequestCardProps) {
  const [showQuotes, setShowQuotes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotes, setQuotes] = useState<RequestQuoteItem[]>(
    (request.quotes as unknown as RequestQuoteItem[]) || []
  );
  const [isSaved, setIsSaved] = useState(false);

  const isUrgent = request.urgency === 'Urgent / Immediate';

  let acceptableConditions: string[] = [];
  try {
    acceptableConditions = typeof request.acceptableConditions === 'string'
      ? JSON.parse(request.acceptableConditions)
      : request.acceptableConditions || [];
  } catch {
    acceptableConditions = ['Working Pull / Used'];
  }

  const handleQuoteSubmitted = (newQuote: RequestQuoteItem) => {
    setQuotes((prev) => [newQuote, ...prev]);
    setShowQuotes(true);
    if (onQuoteAdded) {
      onQuoteAdded(newQuote);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 border-l-4 border-l-amber-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-200">
        {/* Top Urgency Header */}
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
              className="p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <Link href={`/requests/${request.id}`} className="hover:text-blue-600 transition-colors">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {request.title}
                </h3>
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">
                  {request.brand} {request.model}
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                  <Wrench className="w-3 h-3 text-amber-800" />
                  {request.partType}
                </span>
                {request.partNumber && (
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    PN: {request.partNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Max Budget */}
            <div className="sm:text-right flex-shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Max Buyer Budget</div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                {formatPKR(request.maxBudgetPKR)}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium flex items-center sm:justify-end gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" />
                <span>Ready Cash</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-gray-50/40 p-2.5 rounded-lg border border-gray-100">
            {request.description}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{request.city}</span>
                {request.locationArea && <span className="text-slate-400">({request.locationArea})</span>}
              </div>
              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-600 font-medium">Buyer: {request.buyerName}</span>
            </div>

            {/* Acceptable conditions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">Accepts:</span>
              {acceptableConditions.map((cond, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                  {cond}
                </span>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuotes(!showQuotes)}
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span>Quotes Submitted ({quotes.length})</span>
                {showQuotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <WhatsAppButton
                phone={request.buyerWhatsapp || request.buyerPhone}
                adTitle={`Part Sourcing: ${request.title}`}
                price={request.maxBudgetPKR}
                variant="md"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors btn-tactile"
              >
                Submit Quote
              </button>
            </div>
          </div>

          {/* Expandable Quotes Drawer */}
          {showQuotes && (
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 bg-slate-50/70 p-3 rounded-xl">
              <div className="text-xs font-bold text-slate-900 mb-2">Vendor & Shopkeeper Quotes</div>
              {quotes.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No quotes submitted yet. Be the first shopkeeper or technician to pitch an offer!
                </div>
              ) : (
                quotes.map((q, idx) => (
                  <div key={q.id || idx} className="bg-white p-3 rounded-lg border border-gray-200 text-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{q.sellerName}</span>
                        <span className="text-[10px] text-slate-400">({q.city})</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {q.condition}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{q.notes}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold font-mono text-emerald-600 text-sm">
                        {formatPKR(q.offeredPrice)}
                      </div>
                      <span className="text-[10px] text-slate-400">{formatRelativeTime(q.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quote Submission Modal */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestId={request.id}
        requestTitle={request.title}
        maxBudget={request.maxBudgetPKR}
        onQuoteSubmitted={handleQuoteSubmitted}
      />
    </>
  );
}

export const PartRequestCard = SourcingRequestCard;
export default SourcingRequestCard;
