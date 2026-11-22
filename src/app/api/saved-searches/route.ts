import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: true, savedSearches: [] });
    }

    const searches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      savedSearches: searches,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error retrieving saved searches';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to save your search' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, criteria, targetType = 'LISTINGS', ...rest } = body;

    const finalCriteria = criteria || (Object.keys(rest).length > 0 ? rest : null);

    if (!name || !finalCriteria) {
      return NextResponse.json(
        { success: false, error: 'Search name and criteria are required' },
        { status: 400 }
      );
    }

    const criteriaStr = typeof finalCriteria === 'string' ? finalCriteria : JSON.stringify(finalCriteria);

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: name.trim(),
        criteria: criteriaStr,
        targetType,
        alertEmail: true,
      },
    });

    return NextResponse.json({
      success: true,
      savedSearch,
      message: `Alert activated for "${name}"`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Save search error';
    console.error('Save search error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    await prisma.savedSearch.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Saved search removed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error deleting saved search';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
