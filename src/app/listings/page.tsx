'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ListingsCatalogView from '@/components/ListingsCatalogView';

function ListingsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const initialCategory = categoryParam === 'PHONE' ? 'PHONE' : categoryParam === 'LAPTOP' ? 'LAPTOP' : 'ALL';

  return (
    <ListingsCatalogView
      initialCategory={initialCategory}
      lockCategory={false}
      pageTitle="Marketplace Listings"
      pageSubtitle="Browse verified laptops, mobile phones, and spare parts across Pakistan"
    />
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading catalog...</div>}>
      <ListingsPageContent />
    </Suspense>
  );
}
