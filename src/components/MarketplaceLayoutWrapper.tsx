'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MarketplaceHeader from './MarketplaceHeader';
import Footer from './Footer';

export default function MarketplaceLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWelcomePage = pathname === '/';

  if (isWelcomePage) {
    return <main className="min-h-screen bg-white">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <MarketplaceHeader />
      <main className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
}
