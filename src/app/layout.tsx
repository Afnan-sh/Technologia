import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MarketplaceLayoutWrapper from '@/components/MarketplaceLayoutWrapper';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Technologia | Minimalist Tech Marketplace & Sourcing Hub',
  description: 'Pakistan local marketplace for Laptops, Phones, and hard-to-find spare parts sourcing requests. Hafeez Centre, Saddar, Blue Area & Dubai Plaza.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-white text-slate-900 font-sans">
        <AuthProvider>
          <MarketplaceLayoutWrapper>
            {children}
          </MarketplaceLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
