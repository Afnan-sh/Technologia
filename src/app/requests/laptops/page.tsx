import React, { Suspense } from 'react';
import RequestsCatalogView from '@/components/RequestsCatalogView';

export const metadata = {
  title: 'Laptop Part Sourcing Requests | Technologia',
  description: 'Browse active buyer requests for laptop displays, batteries, donor motherboards, and keyboards in Pakistan.',
};

export default function LaptopRequestsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading laptop requests...</div>}>
      <RequestsCatalogView
        initialCategory="LAPTOP"
        lockCategory={true}
        pageTitle="Laptop Part Sourcing Requests"
        pageSubtitle="Active requests for screens, OEM batteries, cooling fans, and donor boards"
      />
    </Suspense>
  );
}
