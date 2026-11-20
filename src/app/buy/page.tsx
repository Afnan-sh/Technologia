import React, { Suspense } from 'react';
import ListingsCatalogView from '@/components/ListingsCatalogView';

export const metadata = {
  title: 'Buy Tech Hardware & Parts | Technologia',
  description: 'Browse verified mobile phones, laptops, and authentic replacement parts in Pakistan.',
};

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading marketplace...</div>}>
      <ListingsCatalogView
        initialCategory="ALL"
        lockCategory={false}
        pageTitle="Buy Tech Hardware & Parts"
        pageSubtitle="Explore phones, laptops, and authentic replacement parts"
      />
    </Suspense>
  );
}
