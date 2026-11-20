import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';
import PartRequestCard from '@/components/PartRequestCard';
import { 
  Smartphone, 
  Laptop, 
  Target, 
  ArrowRight, 
  Search, 
  Plus, 
  Sparkles,
  Inbox
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query exactly 3 to 4 items for each required row
  const [phoneListings, laptopListings, urgentRequests] = await Promise.all([
    // Row 1: Fresh Arrivals (Phones)
    prisma.listing.findMany({
      where: { category: 'PHONE' },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        device: true,
        partCatalog: true,
      },
    }),

    // Row 2: Top Laptops
    prisma.listing.findMany({
      where: { category: 'LAPTOP' },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        device: true,
        partCatalog: true,
      },
    }),

    // Row 3: Urgent Requests (Sourcing Board)
    prisma.partRequest.findMany({
      take: 4,
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        device: true,
        partCatalog: true,
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero / Quick Search Bar */}
      <div className="bg-gray-50/60 border border-gray-100 rounded-3xl p-6 sm:p-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            Clean, Verified Hardware & Spare Parts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Browse verified listings in Hafeez Centre, Saddar, and Blue Area, or pitch quotes directly on hard-to-find part requests.
          </p>

          {/* Clean Minimal Search Input */}
          <form action="/buy/mobiles" method="GET" className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white border border-gray-200 rounded-xl p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-slate-400 ml-2.5 flex-shrink-0" />
              <input
                type="text"
                name="search"
                placeholder="Search models, specs, or part numbers (e.g., T480, S23 Ultra, 01AV421)..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent border-0 focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors btn-tactile flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Category Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <Link
              href="/buy/mobiles"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-2xs font-medium"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Mobile Phones</span>
            </Link>
            <Link
              href="/buy/laptops"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-2xs font-medium"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              <span>Laptops</span>
            </Link>
            <Link
              href="/requests"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-200 text-amber-900 hover:border-amber-800 transition-colors shadow-2xs font-medium"
            >
              <Target className="w-3.5 h-3.5 text-amber-800" />
              <span>Sourcing & Parts Hub</span>
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 hover:border-blue-600 transition-colors shadow-2xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Compare Engine (10-Yr Registry)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: Fresh Arrivals (Phones) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Fresh Arrivals (Phones)
              </h2>
              <p className="text-xs text-slate-500">
                Official PTA, CPID, and JV units with verified battery health
              </p>
            </div>
          </div>
          <Link
            href="/buy/mobiles"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View all phones</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {phoneListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phoneListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No phone listings here yet.</p>
            <Link
              href="/post-ad?category=PHONE"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3 h-3" />
              <span>Post the First Ad</span>
            </Link>
          </div>
        )}
      </section>

      {/* Row 2: Top Laptops */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Top Laptops
              </h2>
              <p className="text-xs text-slate-500">
                Lenovo ThinkPads, Dell XPS, and HP EliteBooks with locked specs
              </p>
            </div>
          </div>
          <Link
            href="/buy/laptops"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View all laptops</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {laptopListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {laptopListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No laptop listings here yet.</p>
            <Link
              href="/post-ad?category=LAPTOP"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3 h-3" />
              <span>Post the First Ad</span>
            </Link>
          </div>
        )}
      </section>

      {/* Row 3: Urgent Part Requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Urgent Part Requests
              </h2>
              <p className="text-xs text-slate-500">
                Rare screens, batteries, and donor boards looking for seller quotes
              </p>
            </div>
          </div>
          <Link
            href="/requests"
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
          >
            <span>Browse all requests</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {urgentRequests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {urgentRequests.map((req) => (
              <PartRequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No active part requests right now.</p>
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3 h-3" />
              <span>Post a Part Request</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
