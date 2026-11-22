'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { cleanWhatsAppNumber } from '@/lib/utils';
import { CreateRequestInput, SubmitQuoteInput, ActionResult } from '@/types';

export async function createRequestAction(
  input: CreateRequestInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const {
      title,
      category,
      deviceId,
      partCatalogId,
      userId,
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
      buyerWhatsapp,
      city,
      locationArea,
    } = input;

    if (!title || !category || !brand || !model || !partType || !maxBudgetPKR || !buyerName || !buyerPhone || !city) {
      return { success: false, error: 'Please fill in all required request fields.' };
    }

    let currentUserId = userId;
    if (!currentUserId) {
      const user = await getCurrentUser();
      currentUserId = user?.id || null;
    }

    const cleanWhatsapp = cleanWhatsAppNumber(buyerWhatsapp || buyerPhone);

    const request = await prisma.partRequest.create({
      data: {
        title,
        category,
        deviceId: deviceId || null,
        partCatalogId: partCatalogId || null,
        userId: currentUserId || null,
        brand,
        model,
        partType,
        partNumber: partNumber || null,
        acceptableConditions: JSON.stringify(acceptableConditions || ['Working Pull / Used']),
        maxBudgetPKR: Number(maxBudgetPKR),
        urgency: urgency || 'Flexible',
        description: description || '',
        photoUrl: photoUrl || null,
        buyerName,
        buyerPhone,
        buyerWhatsapp: cleanWhatsapp,
        city,
        locationArea: locationArea || null,
        status: 'OPEN',
      },
    });

    revalidatePath('/requests');
    revalidatePath('/home');
    revalidatePath('/requests/laptops');
    revalidatePath('/requests/phones');

    return { success: true, data: { id: request.id } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit sourcing request.';
    console.error('Error creating sourcing request action:', error);
    return { success: false, error: message };
  }
}

export async function submitQuoteAction(
  input: SubmitQuoteInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const {
      requestId,
      offeredPrice,
      condition,
      notes,
      photoUrl,
      sellerName,
      sellerPhone,
      sellerWhatsapp,
      city,
    } = input;

    if (!requestId || !offeredPrice || !condition || !notes || !sellerName || !sellerPhone || !city) {
      return { success: false, error: 'Please fill in all quote fields.' };
    }

    const cleanWhatsapp = cleanWhatsAppNumber(sellerWhatsapp || sellerPhone);

    const quote = await prisma.requestQuote.create({
      data: {
        requestId,
        offeredPrice: Number(offeredPrice),
        condition,
        notes,
        photoUrl: photoUrl || null,
        sellerName,
        sellerPhone,
        sellerWhatsapp: cleanWhatsapp,
        city,
      },
    });

    revalidatePath(`/requests/${requestId}`);
    revalidatePath('/requests');

    return { success: true, data: { id: quote.id } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit quote.';
    console.error('Error submitting quote action:', error);
    return { success: false, error: message };
  }
}
