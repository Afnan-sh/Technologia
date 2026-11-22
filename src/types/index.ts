import { Prisma } from '@prisma/client';

export type Category = 'LAPTOP' | 'PHONE';
export type ItemType = 'COMPLETE_UNIT' | 'SPARE_PART';
export type RequestUrgency = 'Urgent / Immediate' | 'Flexible';
export type RequestStatus = 'OPEN' | 'FULFILLED' | 'CLOSED';
export type UserRole = 'ENTHUSIAST' | 'SHOPKEEPER';

// Strict Prisma Payload Types
export type ListingWithRelations = Prisma.ListingGetPayload<{
  include: {
    device?: true;
    partCatalog?: true;
    user?: {
      select: {
        id: true;
        name: true;
        role: true;
        isVerifiedShop: true;
        shopName: true;
        shopAddress: true;
        city: true;
        whatsappNumber: true;
        phone: true;
        reviewsReceived: true;
      };
    };
  };
}>;

export type PartRequestWithRelations = Prisma.PartRequestGetPayload<{
  include: {
    device?: true;
    partCatalog?: true;
    user?: {
      select: {
        id: true;
        name: true;
        role: true;
        isVerifiedShop: true;
        shopName: true;
        city: true;
      };
    };
    quotes?: {
      orderBy: { createdAt: 'desc' };
    };
  };
}>;

export type DeviceCatalogItem = Prisma.DeviceCatalogGetPayload<{
  include: {
    parts?: true;
  };
}>;

export type PartCatalogItem = Prisma.PartCatalogGetPayload<{
  include: {
    device?: true;
  };
}>;

export type RequestQuoteItem = Prisma.RequestQuoteGetPayload<{}>;

export type UserReview = Prisma.ReviewGetPayload<{
  include: {
    reviewer?: {
      select: {
        id: true;
        name: true;
        avatarUrl: true;
      };
    };
  };
}>;

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    listings?: true;
    requests?: true;
    reviewsReceived?: {
      include: {
        reviewer: {
          select: {
            id: true;
            name: true;
            avatarUrl: true;
          };
        };
      };
    };
  };
}>;

// Filter and Mutation Types
export interface ListingFilters {
  search?: string;
  category?: 'LAPTOP' | 'PHONE' | 'ALL';
  itemType?: 'COMPLETE_UNIT' | 'SPARE_PART' | 'ALL';
  brand?: string;
  model?: string;
  ptaStatus?: string;
  city?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  ramGB?: number;
  storage?: string;
  sort?: 'latest' | 'price_asc' | 'price_desc';
}

export interface RequestFilters {
  search?: string;
  category?: 'LAPTOP' | 'PHONE' | 'ALL';
  urgency?: string;
  city?: string;
}

export interface CreateListingInput {
  title: string;
  category: Category;
  itemType: ItemType;
  deviceId?: string | null;
  partCatalogId?: string | null;
  userId?: string | null;
  brand: string;
  model: string;
  partName?: string | null;
  partNumber?: string | null;
  price: number;
  condition: string;
  ptaStatus?: string | null;
  batteryHealth?: number | null;
  ramGB?: number | null;
  storage?: string | null;
  cameraSpec?: string | null;
  screenSize?: string | null;
  specsLockedNotes?: string | null;
  city: string;
  locationArea?: string;
  sellerName: string;
  sellerPhone: string;
  description?: string;
  images?: string[];
  isFeatured?: boolean;
}

export interface CreateRequestInput {
  title: string;
  category: Category;
  deviceId?: string | null;
  partCatalogId?: string | null;
  userId?: string | null;
  brand: string;
  model: string;
  partType: string;
  partNumber?: string | null;
  acceptableConditions: string[];
  maxBudgetPKR: number;
  urgency: RequestUrgency;
  description: string;
  photoUrl?: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerWhatsapp: string;
  city: string;
  locationArea?: string | null;
}

export interface SubmitQuoteInput {
  requestId: string;
  offeredPrice: number;
  condition: string;
  notes: string;
  photoUrl?: string | null;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  city: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
