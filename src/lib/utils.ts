import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'PKR 0';
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return '923000000000';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.slice(1);
  } else if (!cleaned.startsWith('92')) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanNumber = cleanWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const PAKISTANI_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Multan',
  'Faisalabad',
  'Gujranwala',
  'Sialkot',
  'Quetta',
];

export const CITY_MARKETS: Record<string, string[]> = {
  Lahore: ['Hafeez Centre (Gulberg)', 'Hall Road', 'DHA Phase 5 Commercial', 'Johar Town', 'Cavalry Ground'],
  Karachi: ['Saddar (Star City Mall)', 'Techno City Mall (I.I. Chundrigar)', 'Clifton', 'Nazimabad / Gulshan', 'Amma Tower'],
  Islamabad: ['Blue Area (Fazal-ul-Haq Rd)', 'G-9 Markaz (Karachi Company)', 'F-7 Jinnah Super', 'I-8 Markaz'],
  Rawalpindi: ['Dubai Plaza (6th Road)', 'Saddar Rawalpindi', 'Bank Road', 'Chandni Chowk'],
  Peshawar: ['Deans Trade Center (Saddar)', 'University Road', 'Khyber Bazaar'],
  Multan: ['Hussain Agahi Market', 'ChenOne Road', 'Cantt Area', 'Gulgasht Colony'],
};

export const PTA_STATUSES = [
  {
    id: 'Official PTA Approved',
    label: 'Official PTA Approved',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    description: 'Customs tax paid to FBR. Permanent lifetime dual-SIM approval.',
  },
  {
    id: 'CPID / Patch Approved',
    label: 'CPID / Patch Approved',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30',
    description: 'Server IMEI write. Both SIMs working, supports Android updates / resets.',
  },
  {
    id: 'Non-PTA / Physical SIM Locked (JV)',
    label: 'Non-PTA / JV Locked',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    description: 'No tax paid. Works on Wi-Fi or Turbo SIM / Gevey. Physical SIM carrier-locked.',
  },
  {
    id: 'eSIM Only',
    label: 'eSIM Only',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30',
    description: 'Physical slot disabled; digital eSIM configuration supported.',
  },
];

export const CONDITION_OPTIONS = [
  'Brand New',
  'Like New (10/10)',
  'Used - Good (8-9/10)',
  'Faulty / For Parts',
];

export const REQUEST_CONDITIONS = [
  'Brand New (OEM)',
  'Working Pull / Used',
  'Faulty for IC / donor scrap',
];

export const DEFAULT_IMAGES = {
  laptop: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  phone: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
  part: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
};
