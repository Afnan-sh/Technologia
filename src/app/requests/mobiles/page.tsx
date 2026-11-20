import React, { Suspense } from 'react';
import RequestsCatalogView from '@/components/RequestsCatalogView';

export const metadata = {
  title: 'Mobile Part Sourcing Requests | Technologia',
  description: 'Browse active buyer requests for mobile OLED screens, camera modules, charging flex, and batteries in Pakistan.',
};

export default function MobileRequestsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading mobile requests...</div>}>
      <RequestsCatalogView
        initialCategory="PHONE"
        lockCategory={true}
        pageTitle="Mobile Phone Part Sourcing Requests"
        pageSubtitle="Active requests for OLED displays, camera modules, charging ports, and OEM batteries"
      />
    </Suspense>
  );
}
