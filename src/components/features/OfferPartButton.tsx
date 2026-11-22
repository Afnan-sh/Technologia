'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import QuoteModal from '@/components/QuoteModal';

interface OfferPartButtonProps {
  request: {
    id: string;
    title: string;
    maxBudgetPKR: number;
    buyerName?: string;
    city?: string;
  };
}

export function OfferPartButton({ request }: OfferPartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs shadow-xs transition-colors"
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>Offer Part</span>
      </button>

      <QuoteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        request={request}
      />
    </>
  );
}
