import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { cleanWhatsAppNumber } from '@/lib/utils';
import { calculateReputation } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const itemType = searchParams.get('itemType')?.trim() || '';
    const brand = searchParams.get('brand')?.trim() || '';
    const model = searchParams.get('model')?.trim() || '';
    const ptaStatus = searchParams.get('ptaStatus')?.trim() || '';
    const city = searchParams.get('city')?.trim() || '';
    const condition = searchParams.get('condition')?.trim() || '';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const ramGB = searchParams.get('ramGB') ? parseInt(searchParams.get('ramGB')!) : undefined;
    const storage = searchParams.get('storage')?.trim() || '';
    const sort = searchParams.get('sort') || 'latest';

    const where: Prisma.ListingWhereInput = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (itemType && itemType !== 'ALL') {
      where.itemType = itemType;
    }

    if (brand && brand !== 'ALL') {
      where.brand = { equals: brand };
    }

    if (model && model !== 'ALL') {
      where.model = { contains: model };
    }

    if (ptaStatus && ptaStatus !== 'ALL') {
      where.ptaStatus = ptaStatus;
    }

    if (city && city !== 'ALL') {
      where.city = city;
    }

    if (condition && condition !== 'ALL') {
      where.condition = condition;
    }

    if (ramGB) {
      where.ramGB = ramGB;
    }

    if (storage && storage !== 'ALL') {
      where.storage = { contains: storage };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
        { partName: { contains: search } },
        { partNumber: { contains: search } },
        { description: { contains: search } },
        { locationArea: { contains: search } },
      ];
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { viewsCount: 'desc' };
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        orderBy,
      ],
      include: {
        device: true,
        partCatalog: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            isVerifiedShop: true,
            shopName: true,
            shopAddress: true,
            businessHours: true,
            avatarUrl: true,
            reviewsReceived: true,
          },
        },
      },
    });

    const enrichedListings = listings.map((l) => {
      let trustScore = 100;
      let reviewCount = 0;
      if (l.user?.reviewsReceived && l.user.reviewsReceived.length > 0) {
        const rep = calculateReputation(l.user.reviewsReceived);
        trustScore = rep.trustScore;
        reviewCount = rep.reviewCount;
      }
      return {
        ...l,
        sellerTrustScore: trustScore,
        sellerReviewCount: reviewCount,
        isVerifiedShop: Boolean(l.user?.isVerifiedShop || l.user?.role === 'SHOPKEEPER'),
      };
    });

    return NextResponse.json({ success: true, count: enrichedListings.length, listings: enrichedListings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      category,
      itemType,
      deviceId,
      partCatalogId,
      userId,
      brand,
      model,
      partName,
      partNumber,
      price,
      condition,
      ptaStatus,
      batteryHealth,
      ramGB,
      storage,
      cameraSpec,
      screenSize,
      specsLockedNotes,
      city,
      locationArea,
      sellerName,
      sellerPhone,
      description,
      images,
      isFeatured,
    } = body;

    if (!title || !category || !itemType || !brand || !model || !price || !city || !sellerPhone || !sellerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required ad fields' },
        { status: 400 }
      );
    }

    // Check user cookie if userId not passed
    let sellerUserId = userId;
    if (!sellerUserId) {
      const cookieStore = req.cookies.get('technologia_user_id');
      sellerUserId = cookieStore?.value || null;
    }

    const cleanWhatsapp = cleanWhatsAppNumber(sellerPhone);

    const imageArray = Array.isArray(images) && images.length > 0 
      ? images 
      : [category === 'LAPTOP' ? 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'];

    // Auto-fetch device if specs missing
    let finalCamera = cameraSpec;
    let finalScreen = screenSize;
    if (deviceId && (!finalCamera || !finalScreen)) {
      const dev = await prisma.deviceCatalog.findUnique({ where: { id: deviceId } });
      if (dev) {
        if (!finalCamera && dev.cameraSummary) finalCamera = dev.cameraSummary;
        if (!finalScreen && dev.screenSize) finalScreen = dev.screenSize;
      }
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        category,
        itemType,
        deviceId: deviceId || null,
        partCatalogId: partCatalogId || null,
        userId: sellerUserId || null,
        brand,
        model,
        partName: partName || null,
        partNumber: partNumber || null,
        price: parseInt(price),
        condition,
        ptaStatus: category === 'PHONE' ? ptaStatus || null : null,
        batteryHealth: batteryHealth ? parseInt(batteryHealth) : null,
        ramGB: ramGB ? parseInt(ramGB) : null,
        storage: storage || null,
        cameraSpec: finalCamera || null,
        screenSize: finalScreen || null,
        specsLockedNotes: specsLockedNotes || null,
        city,
        locationArea: locationArea || '',
        sellerName,
        sellerPhone,
        whatsappNumber: cleanWhatsapp,
        description: description || '',
        images: JSON.stringify(imageArray),
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ success: false, error: 'Failed to create listing' }, { status: 500 });
  }
}
