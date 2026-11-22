import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export interface UserStats {
  trustScore: number;
  reviewCount: number;
  itemAsDescribedPct: number;
  avgCommunication: number;
  cleanFaultsPct: number;
  itemsSold: number;
  itemsBought: number;
  activeListingsCount: number;
  sourcingRequestsCount: number;
}

export interface ReviewCriteria {
  itemAsDescribed: boolean;
  communicationRating: number;
  undisclosedFaults: boolean;
}

export function calculateReputation(reviews: ReviewCriteria[] = []): UserStats {
  if (!reviews || reviews.length === 0) {
    return {
      trustScore: 100, // Default baseline for new members
      reviewCount: 0,
      itemAsDescribedPct: 100,
      avgCommunication: 5.0,
      cleanFaultsPct: 100,
      itemsSold: 0,
      itemsBought: 0,
      activeListingsCount: 0,
      sourcingRequestsCount: 0,
    };
  }

  let totalPoints = 0;
  let describedCount = 0;
  let totalComm = 0;
  let cleanFaultsCount = 0;

  for (const r of reviews) {
    // 1 point for item as described
    const describedPt = r.itemAsDescribed ? 1 : 0;
    if (r.itemAsDescribed) describedCount++;

    // Normalized communication point (0 to 1)
    const commPt = Math.min(Math.max(r.communicationRating || 5, 1), 5) / 5;
    totalComm += r.communicationRating || 5;

    // 1 point for clean fault disclosure (no hidden faults)
    const faultPt = !r.undisclosedFaults ? 1 : 0;
    if (!r.undisclosedFaults) cleanFaultsCount++;

    // Average across 3 criteria for this review
    const reviewScore = (describedPt + commPt + faultPt) / 3;
    totalPoints += reviewScore;
  }

  const trustScore = Math.round((totalPoints / reviews.length) * 100);
  const itemAsDescribedPct = Math.round((describedCount / reviews.length) * 100);
  const avgCommunication = Number((totalComm / reviews.length).toFixed(1));
  const cleanFaultsPct = Math.round((cleanFaultsCount / reviews.length) * 100);

  return {
    trustScore,
    reviewCount: reviews.length,
    itemAsDescribedPct,
    avgCommunication,
    cleanFaultsPct,
    itemsSold: 0,
    itemsBought: 0,
    activeListingsCount: 0,
    sourcingRequestsCount: 0,
  };
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('technologia_user_id');
    
    // Default fallback to Usman (Shopkeeper) or Ali if no cookie yet
    const userId = sessionCookie?.value;
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviewsReceived: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                role: true,
                isVerifiedShop: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        listings: {
          select: { id: true },
        },
        requests: {
          select: { id: true },
        },
      },
    });

    if (!user) return null;

    const stats = calculateReputation(user.reviewsReceived);
    stats.activeListingsCount = user.listings.length;
    stats.sourcingRequestsCount = user.requests.length;

    return {
      ...user,
      stats,
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}
