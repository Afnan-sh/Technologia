import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: true, savedListings: [], savedIds: [] });
    }

    const saved = await prisma.savedListing.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                isVerifiedShop: true,
                shopName: true,
                reviewsReceived: true,
              },
            },
            device: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const savedIds = saved.map((s) => s.listingId);
    const listings = saved.map((s) => s.listing);

    return NextResponse.json({
      success: true,
      savedListings: listings,
      savedIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error fetching saved listings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to save items' },
        { status: 401 }
      );
    }

    const { listingId } = await req.json();
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'listingId is required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    if (existing) {
      // Toggle off
      await prisma.savedListing.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        saved: false,
        message: 'Item removed from saved items',
      });
    } else {
      // Toggle on
      await prisma.savedListing.create({
        data: {
          userId: user.id,
          listingId,
        },
      });
      return NextResponse.json({
        success: true,
        saved: true,
        message: 'Item saved to your dashboard',
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Save toggle error';
    console.error('Save toggle error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
