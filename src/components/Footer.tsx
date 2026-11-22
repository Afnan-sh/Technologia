import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Branding & Intro */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                T
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">
                Technologia
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clean local tech marketplace and rare parts sourcing hub for Pakistan. Zero commission, direct meetup, and cash on inspection.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Verified Specs &bull; WhatsApp Handoff</span>
            </div>
          </div>

          {/* Col 2: Major Tech Plazas */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Tech Plazas & Hubs
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Hafeez Centre & Hall Road (Lahore)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Saddar Star City & Techno City (Karachi)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Blue Area IT Market (Islamabad)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Dubai Plaza 6th Road (Rawalpindi)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/listings?category=PHONE" className="text-slate-500 hover:text-blue-600 transition-colors">
                  &bull; Mobile Phones Catalog
                </Link>
              </li>
              <li>
                <Link href="/listings?category=LAPTOP" className="text-slate-500 hover:text-blue-600 transition-colors">
                  &bull; Laptops & Ultrabooks
                </Link>
              </li>
              <li>
                <Link href="/requests" className="text-slate-500 hover:text-amber-800 transition-colors">
                  &bull; Sourcing & Parts Board
                </Link>
              </li>
              <li>
                <Link href="/post-ad" className="text-slate-500 hover:text-blue-600 transition-colors">
                  &bull; Post Hardware or Part Ad
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Inspection */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Safety & Verification
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
              Always inspect hardware, screens, battery health, and test ports physically at established plazas before handing over cash. Verify PTA tax status via 8484 SMS.
            </p>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>&copy; {new Date().getFullYear()} Technologia. Running locally with SQLite.</p>
          <p className="text-slate-400">
            Clean White &bull; Modern Blue &bull; Subtle Brown
          </p>
        </div>
      </div>
    </footer>
  );
}
