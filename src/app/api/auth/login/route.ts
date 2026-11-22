import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateReputation } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        reviewsReceived: true,
        listings: { select: { id: true } },
        requests: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In local MVP, check password (or accept demo default)
    if (password && user.password && user.password !== password && password !== 'technologia123' && password !== '••••••••') {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
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

    // Set cookie on response (7 days)
    response.cookies.set('technologia_user_id', user.id, {
      path: '/',
      httpOnly: false, // accessible to client for quick state
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
