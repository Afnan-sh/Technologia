'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

export function ShareButton({ title }: { title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
      <span>{copied ? 'Link Copied!' : 'Share Ad'}</span>
    </button>
  );
}
