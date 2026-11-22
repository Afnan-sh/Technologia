import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to leave a review.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      revieweeId, 
      listingId, 
      itemAsDescribed, 
      communicationRating, 
      undisclosedFaults, 
      comment 
    } = body;

    if (!revieweeId) {
      return NextResponse.json(
        { success: false, error: 'Reviewee ID is required' },
        { status: 400 }
      );
    }

    if (revieweeId === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot review your own account.' },
        { status: 400 }
      );
    }

    const commRating = Math.min(Math.max(Number(communicationRating) || 5, 1), 5);

    const review = await prisma.review.create({
      data: {
        reviewerId: currentUser.id,
        revieweeId,
        listingId: listingId || null,
        itemAsDescribed: Boolean(itemAsDescribed),
        communicationRating: commRating,
        undisclosedFaults: Boolean(undisclosedFaults),
        comment: comment ? String(comment).trim() : null,
      },
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
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error creating review';
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
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
            price: true,
            brand: true,
            model: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error retrieving reviews';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
