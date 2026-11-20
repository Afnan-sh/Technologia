import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || searchParams.get('threadId');

    if (sessionId) {
      // 1. Try chatSession first
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          listing: true,
          request: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (session) {
        // Mark unread as 0
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { unreadBuyer: 0 },
        });
        return NextResponse.json({ success: true, session, thread: session });
      }

      // 2. Try legacy chatThread
      const thread = await prisma.chatThread.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (thread) {
        return NextResponse.json({ success: true, thread, session: thread });
      }

      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
    }

    // Return all chat sessions
    const sessions = await prisma.chatSession.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        listing: true,
        request: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (sessions.length > 0) {
      return NextResponse.json({ success: true, count: sessions.length, sessions, threads: sessions });
    }

    // Fallback to legacy chatThread
    const legacyThreads = await prisma.chatThread.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, count: legacyThreads.length, sessions: legacyThreads, threads: legacyThreads });
  } catch (error: any) {
    console.error('Error in messages GET:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      threadId, 
      listingId, 
      requestId, 
      senderRole, 
      senderName, 
      text, 
      isPrompt 
    } = body;

    const activeId = sessionId || threadId;

    // Case 1: Posting message to an existing session
    if (activeId && text) {
      const isSession = await prisma.chatSession.findUnique({ where: { id: activeId } });
      if (isSession) {
        const message = await prisma.chatSessionMessage.create({
          data: {
            sessionId: activeId,
            senderRole: senderRole || 'BUYER',
            senderName: senderName || (senderRole === 'SELLER' ? 'Seller' : 'You'),
            text,
            isPrompt: Boolean(isPrompt),
          },
        });

        await prisma.chatSession.update({
          where: { id: activeId },
          data: {
            lastMessage: text,
            lastMessageAt: new Date(),
            unreadSeller: senderRole === 'BUYER' ? { increment: 1 } : undefined,
            unreadBuyer: senderRole === 'SELLER' ? { increment: 1 } : undefined,
          },
        });

        return NextResponse.json({ success: true, message });
      }

      // Legacy fallback
      const message = await prisma.chatMessage.create({
        data: {
          threadId: activeId,
          senderRole: senderRole || 'BUYER',
          senderName: senderName || (senderRole === 'SELLER' ? 'Seller' : 'You'),
          text,
          isPrompt: Boolean(isPrompt),
        },
      });

      await prisma.chatThread.update({
        where: { id: activeId },
        data: {
          lastMessage: text,
          lastMessageAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message });
    }

    // Case 2: Initiating a session from a Listing
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
      }

      // Check if session already exists for this listing
      let session = await prisma.chatSession.findFirst({
        where: { listingId: listing.id },
      });

      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            listingId: listing.id,
            title: `Discussion: ${listing.title}`,
            buyerName: senderName || 'You (Buyer)',
            sellerName: listing.sellerName,
            sellerWhatsapp: listing.whatsappNumber,
            itemPrice: listing.price,
            itemCity: listing.city,
            lastMessage: text || 'Assalam-o-Alaikum! Is this item available?',
            unreadBuyer: 0,
            unreadSeller: 1,
            messages: {
              create: [
                {
                  senderRole: 'BUYER',
                  senderName: senderName || 'You (Buyer)',
                  text: text || 'Assalam-o-Alaikum! Is this item available?',
                  isPrompt: Boolean(isPrompt),
                },
              ],
            },
          },
        });
      }

      return NextResponse.json({ success: true, sessionId: session.id, threadId: session.id });
    }

    // Case 3: Initiating a session from a Sourcing Request
    if (requestId) {
      const request = await prisma.partRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }

      let session = await prisma.chatSession.findFirst({
        where: { requestId: request.id },
      });

      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            requestId: request.id,
            title: `Request Offer: ${request.title}`,
            buyerName: request.buyerName,
            sellerName: senderName || 'You (Seller)',
            sellerWhatsapp: request.buyerWhatsapp,
            itemPrice: request.maxBudgetPKR,
            itemCity: request.city,
            lastMessage: text || 'Assalam-o-Alaikum! I have this part available.',
            unreadBuyer: 1,
            unreadSeller: 0,
            messages: {
              create: [
                {
                  senderRole: 'SELLER',
                  senderName: senderName || 'You (Seller)',
                  text: text || 'Assalam-o-Alaikum! I have this part available for inspection.',
                  isPrompt: Boolean(isPrompt),
                },
              ],
            },
          },
        });
      }

      return NextResponse.json({ success: true, sessionId: session.id, threadId: session.id });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in messages POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
