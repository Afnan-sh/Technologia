import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cleanWhatsAppNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const urgency = searchParams.get('urgency')?.trim() || '';
    const city = searchParams.get('city')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (urgency && urgency !== 'ALL') {
      where.urgency = urgency;
    }

    if (city && city !== 'ALL') {
      where.city = city;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { partType: { contains: search } },
        { partNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const requests = await prisma.partRequest.findMany({
      where,
      orderBy: [
        { urgency: 'desc' }, // Urgent first
        { createdAt: 'desc' },
      ],
      include: {
        device: true,
        partCatalog: true,
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { quotes: true },
        },
      },
    });

    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      category,
      deviceId,
      partCatalogId,
      brand,
      model,
      partType,
      partNumber,
      acceptableConditions,
      maxBudgetPKR,
      urgency,
      description,
      photoUrl,
      buyerName,
      buyerPhone,
      city,
      locationArea,
    } = body;

    if (!title || !category || !brand || !model || !partType || !maxBudgetPKR || !buyerName || !buyerPhone || !city) {
      return NextResponse.json(
        { success: false, error: 'Missing required request fields' },
        { status: 400 }
      );
    }

    const cleanWhatsapp = cleanWhatsAppNumber(buyerPhone);

    const conditionsString = Array.isArray(acceptableConditions)
      ? JSON.stringify(acceptableConditions)
      : JSON.stringify(['Working Pull / Used']);

    const request = await prisma.partRequest.create({
      data: {
        title,
        category,
        deviceId: deviceId || null,
        partCatalogId: partCatalogId || null,
        brand,
        model,
        partType,
        partNumber: partNumber || null,
        acceptableConditions: conditionsString,
        maxBudgetPKR: parseInt(maxBudgetPKR),
        urgency: urgency || 'Flexible',
        description: description || '',
        photoUrl: photoUrl || null,
        buyerName,
        buyerPhone,
        buyerWhatsapp: cleanWhatsapp,
        city,
        locationArea: locationArea || '',
        status: 'OPEN',
      },
      include: {
        quotes: true,
      },
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ success: false, error: 'Failed to create request' }, { status: 500 });
  }
}
