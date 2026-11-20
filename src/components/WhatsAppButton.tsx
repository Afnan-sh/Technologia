'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/utils';

interface WhatsAppButtonProps {
  phone: string;
  adTitle: string;
  adId?: string;
  price?: number;
  customMessage?: string;
  variant?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export default function WhatsAppButton({
  phone,
  adTitle,
  adId,
  price,
  customMessage,
  variant = 'md',
  className = '',
}: WhatsAppButtonProps) {
  const defaultText = customMessage || 
    `Assalam-o-Alaikum! I saw your ad on Technologia PK: "${adTitle}"${adId ? ` (ID: #${adId.slice(-6)})` : ''}${price ? ` listed for PKR ${price.toLocaleString()}` : ''}. Is it still available for inspection?`;

  const waUrl = buildWhatsAppLink(phone, defaultText);

  if (variant === 'icon') {
    return (
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className={`p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-600/30 transition-all inline-flex items-center justify-center ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <MessageCircle className="w-4 h-4 fill-white/20" />
      </a>
    );
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs font-semibold gap-2',
    lg: 'px-5 py-3 text-sm font-bold gap-2.5 w-full justify-center',
  };

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-600/30 font-medium transition-all ${sizeClasses[variant]} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCircle className="w-4 h-4 fill-white/20 flex-shrink-0" />
      <span>Contact on WhatsApp</span>
    </a>
  );
}
