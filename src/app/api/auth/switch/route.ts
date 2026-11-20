import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateReputation } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 2,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        avatarUrl: true,
      },
    });
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target, email, userId } = body;

    let user;
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

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: userInclude,
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: userInclude,
      });
    } else if (target === 'user2' || target === 'user_2' || target === 'ali') {
      user = await prisma.user.findUnique({
        where: { email: 'ali@technologia.pk' },
        include: userInclude,
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: 'usman@technologia.pk' },
        include: userInclude,
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        include: userInclude,
      });
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
