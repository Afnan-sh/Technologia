'use client';

import React, { useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingGalleryProps {
  images: string[];
  title: string;
  isFeatured?: boolean;
  viewsCount?: number;
}

export function ListingGallery({
  images,
  title,
  isFeatured = false,
  viewsCount = 0,
}: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="space-y-3">
      {/* Main Hero Image */}
      <div className="relative aspect-[16/10] bg-gray-100 rounded-3xl overflow-hidden border border-gray-200/80 shadow-2xs">
        <img
          src={displayImages[selectedIndex]}
          alt={title}
          className="w-full h-full object-cover"
        />

        {isFeatured && (
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-amber-800 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Featured Ad</span>
          </div>
        )}

        <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200/60 shadow-2xs">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{viewsCount} Views</span>
        </div>
      </div>

      {/* Thumbnails row */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all',
                selectedIndex === idx
                  ? 'border-blue-600 ring-2 ring-blue-600/20'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img src={img} alt={`${title} preview ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
