'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { cleanWhatsAppNumber, DEFAULT_IMAGES } from '@/lib/utils';
import { CreateListingInput, ActionResult } from '@/types';

export async function createListingAction(
  input: CreateListingInput
): Promise<ActionResult<{ id: string }>> {
  try {
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
    } = input;

    if (!title || !category || !itemType || !brand || !model || !price || !city || !sellerPhone || !sellerName) {
      return { success: false, error: 'Please fill in all required listing fields.' };
    }

    // Determine user ID
    let currentUserId = userId;
    if (!currentUserId) {
      const user = await getCurrentUser();
      currentUserId = user?.id || null;
    }

    const cleanWhatsapp = cleanWhatsAppNumber(sellerPhone);
    const imageArray = images && images.length > 0 
      ? images 
      : [category === 'LAPTOP' ? DEFAULT_IMAGES.laptop : DEFAULT_IMAGES.phone];

    // Auto-fetch catalog specs if missing
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
        userId: currentUserId || null,
        brand,
        model,
        partName: partName || null,
        partNumber: partNumber || null,
        price: Number(price),
        condition,
        ptaStatus: category === 'PHONE' ? ptaStatus || null : null,
        batteryHealth: batteryHealth ? Number(batteryHealth) : null,
        ramGB: ramGB ? Number(ramGB) : null,
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

    revalidatePath('/listings');
    revalidatePath('/home');
    revalidatePath('/buy/laptops');
    revalidatePath('/buy/phones');

    return { success: true, data: { id: listing.id } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish listing.';
    console.error('Error creating listing action:', error);
    return { success: false, error: message };
  }
}

export async function toggleSaveListingAction(
  listingId: string
): Promise<ActionResult<{ isSaved: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please sign in to save listings.' };
    }

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.savedListing.delete({
        where: { id: existing.id },
      });
      revalidatePath('/dashboard');
      return { success: true, data: { isSaved: false } };
    } else {
      await prisma.savedListing.create({
        data: {
          userId: user.id,
          listingId,
        },
      });
      revalidatePath('/dashboard');
      return { success: true, data: { isSaved: true } };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not update saved status.';
    console.error('Error toggling saved listing:', error);
    return { success: false, error: message };
  }
}

export async function toggleFeatureListingAction(
  listingId: string
): Promise<ActionResult<{ isFeatured: boolean }>> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return { success: false, error: 'Listing not found.' };
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: { isFeatured: !listing.isFeatured },
    });

    revalidatePath('/listings');
    revalidatePath(`/listings/${listingId}`);
    revalidatePath('/home');

    return { success: true, data: { isFeatured: updated.isFeatured } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update feature status.';
    return { success: false, error: message };
  }
}
