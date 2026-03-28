'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

import { resend } from '@/lib/resend';

export async function placeBid(formData: FormData): Promise<{ error?: string }> {
    const session = await getSession();
    if (!session) {
        return { error: 'You must be logged in to place a bid' };
    }

    const itemId = formData.get('itemId') as string;
    const amount = parseFloat(formData.get('amount') as string);

    if (!itemId || isNaN(amount)) {
        return { error: 'Invalid bid data' };
    }

    const item = await prisma.auctionItem.findUnique({
        where: { id: itemId },
        include: { bids: { orderBy: { amount: 'desc' }, take: 1, include: { user: true } } },
    });

    if (!item) {
        return { error: 'Item not found' };
    }

    if (new Date() < new Date(item.startTime)) {
        return { error: 'Auction has not started yet' };
    }

    if (new Date(item.endTime) < new Date()) {
        return { error: 'Auction has ended' };
    }

    const currentBid = item.bids[0]?.amount || item.startingBid;

    if (item.bids.length > 0 && amount <= currentBid) {
        return { error: 'Bid must be higher than the current bid' };
    }

    if (amount < item.startingBid) {
        return { error: 'Bid must be at least the starting bid' };
    }

    // Check for outbid and send notification
    const previousHighestBid = item.bids[0];
    if (previousHighestBid && previousHighestBid.userId !== session.id) {
        try {
            await resend.emails.send({
                from: 'Baxter Auction <noreply@baxterauction.se>',
                to: previousHighestBid.user.email,
                subject: `You have been outbid on ${item.title}`,
                html: `
                    <h1>Outbid Alert</h1>
                    <p>A new bid of <strong>${amount.toLocaleString('sv-SE')} kr</strong> has been placed on <strong>${item.title}</strong>.</p>
                    <p>Your bid was: ${previousHighestBid.amount.toLocaleString('sv-SE')} kr.</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auction/item/${item.id}">Click here to place a new bid</a></p>
                `
            });
        } catch (error) {
            console.error('Failed to send outbid notification:', error);
        }
    }

    await prisma.bid.create({
        data: {
            amount,
            itemId,
            userId: session.id as string,
        },
    });

    // Update the item's currentBid
    await prisma.auctionItem.update({
        where: { id: itemId },
        data: { currentBid: amount },
    });

    revalidatePath(`/auction`);
    revalidatePath(`/auction/item/${itemId}`);
    return {};
}
