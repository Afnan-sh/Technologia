import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateReputation } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      password, 
      name, 
      role = 'ENTHUSIAST', 
      isVerifiedShop = false,
      shopName, 
      shopAddress, 
      businessHours, 
      phone, 
      whatsappNumber, 
      city = 'Lahore' 
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      );
    }

    const isShop = role === 'SHOPKEEPER' || Boolean(isVerifiedShop);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: password || 'technologia123',
        name: name.trim(),
        role: isShop ? 'SHOPKEEPER' : 'ENTHUSIAST',
        isVerifiedShop: isShop,
        shopName: isShop ? (shopName || `${name}'s Tech Store`) : null,
        shopAddress: isShop ? shopAddress : null,
        businessHours: isShop ? (businessHours || 'Mon - Sat: 11:00 AM - 9:00 PM') : null,
        phone: phone || null,
        whatsappNumber: whatsappNumber || phone || null,
        city,
        avatarUrl: isShop 
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      },
      include: {
        reviewsReceived: true,
        listings: true,
        requests: true,
      },
    });

    const stats = calculateReputation([]);

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
