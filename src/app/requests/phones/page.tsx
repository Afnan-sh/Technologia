import React, { Suspense } from 'react';
import RequestsCatalogView from '@/components/RequestsCatalogView';

export const metadata = {
  title: 'Phone Part Sourcing Requests | Technologia',
  description: 'Browse active buyer requests for mobile OLED screens, camera modules, charging flex, and batteries in Pakistan.',
};

export default function PhoneRequestsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading phone requests...</div>}>
      <RequestsCatalogView
        initialCategory="PHONE"
        lockCategory={true}
        pageTitle="Phone Part Sourcing Requests"
        pageSubtitle="Active requests for OLED displays, camera modules, charging ports, and OEM batteries"
      />
    </Suspense>
  );
}
