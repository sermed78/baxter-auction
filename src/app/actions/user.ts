'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function placeBid(itemId: string, amount: number) {
    const session = await getSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const item = await prisma.auctionItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error('Item not found');

    if (new Date() > item.endTime) {
        throw new Error('Auction ended');
    }

    if (amount <= item.currentBid) {
        throw new Error('Bid must be higher than current bid');
    }

    // Create Bid
    await prisma.bid.create({
        data: {
            amount,
            itemId,
            userId: session.id,
        },
    });

    // Update Item
    await prisma.auctionItem.update({
        where: { id: itemId },
        data: { currentBid: amount },
    });

    revalidatePath('/auction');
    revalidatePath('/admin');
    return { success: true };
}
