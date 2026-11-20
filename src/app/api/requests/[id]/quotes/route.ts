import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cleanWhatsAppNumber } from '@/lib/utils';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const {
      offeredPrice,
      condition,
      notes,
      photoUrl,
      sellerName,
      sellerPhone,
      city,
    } = body;

    if (!offeredPrice || !condition || !notes || !sellerName || !sellerPhone) {
      return NextResponse.json(
        { success: false, error: 'Please provide price, condition, notes, seller name and phone number' },
        { status: 400 }
      );
    }

    const request = await prisma.partRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const cleanWhatsapp = cleanWhatsAppNumber(sellerPhone);

    const quote = await prisma.requestQuote.create({
      data: {
        requestId: id,
        offeredPrice: parseInt(offeredPrice),
        condition,
        notes,
        photoUrl: photoUrl || null,
        sellerName,
        sellerPhone,
        sellerWhatsapp: cleanWhatsapp,
        city: city || 'Pakistan',
      },
    });

    // Also create or link a chat thread between this seller and the buyer so they can converse immediately
    const threadId = `thread-req-${id}-${quote.id}`;
    await prisma.chatThread.create({
      data: {
        id: threadId,
        title: `${request.title.substring(0, 45)}... - ${sellerName}`,
        entityType: 'REQUEST',
        entityId: id,
        buyerName: request.buyerName,
        sellerName: sellerName,
        sellerWhatsapp: cleanWhatsapp,
        itemPrice: parseInt(offeredPrice),
        itemCity: city || request.city,
        lastMessage: `Submitted Quote: PKR ${parseInt(offeredPrice).toLocaleString()} - ${notes}`,
        unreadBuyer: 1,
        unreadSeller: 0,
        messages: {
          create: [
            {
              senderRole: 'SELLER',
              senderName: sellerName,
              text: `Assalam-o-Alaikum! I have this part available: PKR ${parseInt(offeredPrice).toLocaleString()} (${condition}). Note: ${notes}`,
              isPrompt: true,
            },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, quote, threadId }, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit quote' }, { status: 500 });
  }
}
