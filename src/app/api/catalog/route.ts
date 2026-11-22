import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    const where: Prisma.DeviceCatalogWhereInput = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (brand && brand !== 'ALL') {
      where.brand = brand;
    }
    if (search) {
      where.OR = [
        { model: { contains: search } },
        { brand: { contains: search } },
        { chipset: { contains: search } },
      ];
    }

    const devices = await prisma.deviceCatalog.findMany({
      where,
      include: {
        parts: true,
      },
      orderBy: [
        { brand: 'asc' },
        { releaseYear: 'desc' },
        { model: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, count: devices.length, devices });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch catalog' }, { status: 500 });
  }
}
