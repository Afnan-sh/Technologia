import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateReputation } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        device: true,
        partCatalog: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            isVerifiedShop: true,
            shopName: true,
            shopAddress: true,
            businessHours: true,
            phone: true,
            whatsappNumber: true,
            city: true,
            avatarUrl: true,
            reviewsReceived: {
              include: {
                reviewer: {
                  select: { id: true, name: true, role: true, isVerifiedShop: true, avatarUrl: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
            listings: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    // Increment views
    await prisma.listing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    let sellerStats = null;
    if (listing.user) {
      sellerStats = calculateReputation(listing.user.reviewsReceived);
      sellerStats.activeListingsCount = listing.user.listings.length;
    }

    const enrichedListing = {
      ...listing,
      sellerStats,
      isVerifiedShop: Boolean(listing.user?.isVerifiedShop || listing.user?.role === 'SHOPKEEPER'),
    };

    return NextResponse.json({ success: true, listing: enrichedListing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch listing' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...(body.isFeatured !== undefined && { isFeatured: Boolean(body.isFeatured) }),
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json({ success: false, error: 'Failed to update listing' }, { status: 500 });
  }
}
