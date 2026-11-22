import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateReputation } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { roleType = 'shopkeeper' } = await req.json();

    let targetEmail = 'usman@hafeezcentre.pk';
    if (roleType === 'enthusiast') {
      targetEmail = 'ali@technologia.pk';
    } else if (roleType === 'shopkeeper-karachi') {
      targetEmail = 'zubair@applevault.pk';
    }

    const userInclude = {
      reviewsReceived: {
        include: {
          reviewer: {
            select: { id: true, name: true, role: true, isVerifiedShop: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' as const },
      },
      listings: true,
      requests: true,
    };

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: userInclude,
    });

    if (!user) {
      // Fallback to any user
      user = await prisma.user.findFirst({
        include: userInclude,
      });
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'No users found' }, { status: 404 });
    }

    const stats = calculateReputation(user.reviewsReceived);
    stats.activeListingsCount = user.listings.length;
    stats.sourcingRequestsCount = user.requests.length;

    const response = NextResponse.json({
      success: true,
      user: {
        ...user,
        stats,
      },
    });

    response.cookies.set('technologia_user_id', user.id, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Demo sign in failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
