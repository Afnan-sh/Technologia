import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateReputation } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
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
            listing: {
              select: {
                id: true,
                title: true,
                model: true,
                brand: true,
                price: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        listings: {
          orderBy: { createdAt: 'desc' },
          include: {
            device: true,
          },
        },
        requests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const stats = calculateReputation(user.reviewsReceived);
    stats.activeListingsCount = user.listings.length;
    stats.sourcingRequestsCount = user.requests.length;

    // Remove password
    const { password, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: {
        ...safeUser,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
