import React, { Suspense } from 'react';
import ListingsCatalogView from '@/components/ListingsCatalogView';
import { notFound } from 'next/navigation';

interface BuyCategoryPageProps {
  params: {
    category: string;
  };
}

export function generateMetadata({ params }: BuyCategoryPageProps) {
  const cat = params.category?.toLowerCase();
  if (cat === 'laptops') {
    return {
      title: 'Buy Laptops & Spare Parts | Technologia',
      description: 'Lenovo ThinkPads, Dell XPS, HP EliteBooks and authentic laptop parts with locked specs in Pakistan.',
    };
  }
  if (cat === 'phones' || cat === 'mobiles') {
    return {
      title: 'Buy Mobile Phones & Parts | Technologia',
      description: 'Official PTA Approved, CPID, and JV mobile phones with verified battery health in Pakistan.',
    };
  }
  return {
    title: 'Buy Tech Hardware | Technologia',
  };
}

export default function BuyCategoryPage({ params }: BuyCategoryPageProps) {
  const cat = params.category?.toLowerCase();

  if (cat === 'laptops') {
    return (
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading laptops...</div>}>
        <ListingsCatalogView
          initialCategory="LAPTOP"
          lockCategory={true}
          pageTitle="Browse Laptops & Ultrabooks"
          pageSubtitle="Lenovo ThinkPads, Dell XPS, HP EliteBooks and replacement parts"
        />
      </Suspense>
    );
  }

  if (cat === 'phones' || cat === 'mobiles') {
    return (
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading phones...</div>}>
        <ListingsCatalogView
          initialCategory="PHONE"
          lockCategory={true}
          pageTitle="Browse Mobile Phones"
          pageSubtitle="Official PTA, CPID, and JV phones with verified battery health"
        />
      </Suspense>
    );
  }

  return notFound();
}
