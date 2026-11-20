import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const request = await prisma.partRequest.findUnique({
      where: { id },
      include: {
        device: true,
        partCatalog: true,
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('Error fetching request detail:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch request' }, { status: 500 });
  }
}
