import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Please sign in to check your saved search alerts',
      }, { status: 401 });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const simulationResults = [];

    for (const s of savedSearches) {
      let criteria: any = {};
      try {
        criteria = JSON.parse(s.criteria);
      } catch {
        criteria = {};
      }

      // Build prisma where query
      const where: any = {};
      if (criteria.category && criteria.category !== 'ALL') {
        where.category = criteria.category.toUpperCase();
      }
      if (criteria.brand && criteria.brand !== 'ALL') {
        where.brand = { contains: criteria.brand };
      }
      if (criteria.city && criteria.city !== 'ALL') {
        where.city = criteria.city;
      }
      if (criteria.ram) {
        where.ramGB = Number(criteria.ram);
      }
      if (criteria.maxPrice) {
        where.price = { lte: Number(criteria.maxPrice) };
      }

      const matchingListings = await prisma.listing.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          brand: true,
          model: true,
          price: true,
          city: true,
          ramGB: true,
          condition: true,
        },
      });

      simulationResults.push({
        id: s.id,
        name: s.name,
        targetType: s.targetType,
        criteria,
        matchCount: matchingListings.length,
        matchingItems: matchingListings,
        simulatedAlert: matchingListings.length > 0
          ? `[Simulated Alert] Found ${matchingListings.length} matching ad(s) for "${s.name}". Push & WhatsApp notification simulated.`
          : `No new ads currently match this alert criteria.`,
        lastChecked: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      totalSearches: savedSearches.length,
      alerts: simulationResults,
    });
  } catch (error: any) {
    console.error('Alerts check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
