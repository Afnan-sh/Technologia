'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RequestsCatalogView from '@/components/RequestsCatalogView';

function RequestsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const initialCategory = categoryParam === 'PHONE' ? 'PHONE' : categoryParam === 'LAPTOP' ? 'LAPTOP' : 'ALL';

  return (
    <RequestsCatalogView
      initialCategory={initialCategory}
      lockCategory={false}
      pageTitle="View Sourcing Requests"
      pageSubtitle="Browse active buyer requests for replacement parts, displays, batteries, and donor boards"
    />
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading requests...</div>}>
      <RequestsPageContent />
    </Suspense>
  );
}
