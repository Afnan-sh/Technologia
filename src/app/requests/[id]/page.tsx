'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Target, 
  Clock, 
  MapPin, 
  Check, 
  ArrowLeft, 
  AlertTriangle, 
  Sparkles, 
  Wrench, 
  Share2
} from 'lucide-react';
import { formatPKR, formatRelativeTime } from '@/lib/utils';
import WhatsAppButton from '@/components/WhatsAppButton';
import QuoteModal from '@/components/QuoteModal';

export default function RequestDetailPage() {
  const { id } = useParams() as { id: string };

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${id}`);
      const data = await res.json();
      if (data.success) {
        setRequest(data.request);
      }
    } catch (e) {
      console.error('Error fetching request detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400 animate-pulse">
        Loading part sourcing request & quotes...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Target className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Sourcing Request Not Found</h2>
        <Link href="/requests" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
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
      : request.acceptableConditions || [];
  } catch (e) {
    acceptableConditions = ['Working Pull / Used'];
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests Board</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-slate-700 transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share Request'}</span>
        </button>
      </div>

      {/* Main Sourcing Request */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-amber-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between text-xs bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-800" />
              <span>Sourcing Request Ticket</span>
            </span>
            {isUrgent && (
              <span className="rounded-full bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 font-bold border border-amber-200 flex items-center gap-1">
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

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {request.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="rounded-full bg-blue-50 text-blue-700 font-medium px-2.5 py-0.5 border border-blue-100">
                  {request.brand} {request.model}
                </span>
                <span className="rounded-full bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5">
                  {request.partType}
                </span>
                {request.partNumber && (
                  <span className="rounded-full bg-amber-50 text-amber-800 font-medium px-2.5 py-0.5 border border-amber-200/60 font-mono">
                    SKU: {request.partNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Target Budget */}
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl sm:text-right flex-shrink-0">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Buyer Target Budget</span>
              <span className="text-2xl font-bold text-blue-700 font-mono">
                {formatPKR(request.maxBudgetPKR)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {request.description}
          </div>

          {/* Broken Part Photo if attached */}
          {request.photoUrl && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Photo Provided by Buyer
              </h4>
              <div className="w-64 h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                <img src={request.photoUrl} alt="Part" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Acceptable Conditions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Acceptable Conditions:</span>
            {acceptableConditions.map((cond, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
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

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs shadow-xs transition-colors btn-tactile"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Offer Part</span>
            </button>
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
            {request.quotes.map((quote: any) => (
              <div
                key={quote.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
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
          <div className="text-center py-10 bg-white border border-gray-200 rounded-xl p-6 text-xs text-slate-500">
            No seller offers submitted yet. Be the first to submit an offer above!
          </div>
        )}
      </div>

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={request}
        onQuoteSubmitted={() => fetchRequest()}
      />
    </div>
  );
}
