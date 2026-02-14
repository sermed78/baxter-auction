'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { resend } from '@/lib/resend';

const itemSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.string().optional().or(z.literal('')),
    startingBid: z.coerce.number().min(0, "Starting bid must be positive"),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
}).refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

export async function createItem(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const file = formData.get('image') as File | null;
    let imageUrl = '';

    if (file && file.size > 0) {
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blob = await put(filename, file, {
                access: 'public',
            });
            imageUrl = blob.url;
        } else {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
        }
    }

    const data = itemSchema.parse({
        title: formData.get('title'),
        description: formData.get('description'),
        imageUrl: imageUrl,
        startingBid: formData.get('startingBid'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
    });

    await prisma.auctionItem.create({
        data: {
            ...data,
            currentBid: data.startingBid,
        },
    });

    revalidatePath('/admin');
    revalidatePath('/auction');
    redirect('/admin');
}

export async function updateItem(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const itemId = formData.get('itemId') as string;
    if (!itemId) throw new Error('Item ID required');

    const item = await prisma.auctionItem.findUnique({
        where: { id: itemId },
        include: { bids: true }
    });

    if (!item) throw new Error('Item not found');

    // Removed restriction: Admins can edit ended auctions (e.g. to extend time)
    // if (new Date(item.endTime) < new Date()) {
    //     throw new Error('Cannot edit an auction that has already ended');
    // }

    const file = formData.get('image') as File | null;
    let imageUrl = item.imageUrl;

    if (file && file.size > 0) {
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blob = await put(filename, file, {
                access: 'public',
            });
            imageUrl = blob.url;
        } else {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
        }
    }

    // Parse other fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startTime = new Date(formData.get('startTime') as string);
    const endTime = new Date(formData.get('endTime') as string);

    // Simplified: Admins can always edit starting bid
    const startingBid = parseFloat(formData.get('startingBid') as string);

    await prisma.auctionItem.update({
        where: { id: itemId },
        data: {
            title,
            description,
            imageUrl,
            startTime,
            endTime,
            startingBid
        }
    });

    revalidatePath('/admin');
    revalidatePath(`/auction`);
    redirect('/admin');
}

export async function deleteItem(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    await prisma.auctionItem.delete({ where: { id } });
    revalidatePath('/admin');
    revalidatePath('/auction');
}

export async function closeAuction(id: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const item = await prisma.auctionItem.findUnique({
        where: { id },
        include: { bids: { orderBy: { amount: 'desc' }, take: 1, include: { user: true } } }
    });

    if (!item) throw new Error('Item not found');

    // Close auction by setting endTime to now
    await prisma.auctionItem.update({
        where: { id },
        data: { endTime: new Date() }
    });

    const winner = item.bids[0]?.user;
    if (winner && winner.email) {
        try {
            await resend.emails.send({
                from: 'Baxter Auction <updates@resend.dev>',
                to: winner.email,
                subject: `You won the auction: ${item.title}`,
                html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="text-align: center; padding: 20px 0;">
                        <h1 style="color: #003D87; margin: 0;">Baxter Sweden</h1>
                    </div>

                    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #111; margin-top: 0;">Congratulations! 🎉</h2>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">
                            We are pleased to inform you that you have won the auction for <strong>${item.title}</strong>.
                        </p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Winning Bid</p>
                            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #003D87;">${item.bids[0].amount.toLocaleString('sv-SE')} kr</p>
                        </div>

                        <h3 style="color: #111;">Next Steps</h3>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">
                            To arrange for payment and collection of your item, please reach out to <strong>Lina Douglah</strong> directly.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:lina_douglah@baxter.com" style="background-color: #003D87; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Contact Lina Douglah</a>
                        </div>
                    </div>

                    <div style="text-align: center; padding-top: 20px; font-size: 12px; color: #9ca3af;">
                        <p>Baxter Sweden Auction House</p>
                    </div>
                </div>
            `
            });
            console.log(`Email sent to winner: ${winner.email}`);
        } catch (error) {
            console.error('Failed to send winner email:', error);
        }
    }

    revalidatePath('/admin');
    revalidatePath('/auction');
}

export async function updateUserTagId(userId: string, newTagId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    // Check if tag is taken
    const existing = await prisma.user.findUnique({
        where: { tagId: newTagId }
    });

    if (existing && existing.id !== userId) {
        throw new Error('Tag ID already taken');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { tagId: newTagId }
    });

    revalidatePath('/admin/users');
}

export async function resetAuction(itemId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const item = await prisma.auctionItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error('Item not found');

    // 1. Delete all bids
    await prisma.bid.deleteMany({
        where: { itemId }
    });

    // 2. Reset currentBid to startingBid and re-open if needed (optional)
    await prisma.auctionItem.update({
        where: { id: itemId },
        data: {
            currentBid: item.startingBid,
            // Optionally we could reset endTime here too, but usually just clearing bids is enough
        }
    });

    revalidatePath('/auction');
    revalidatePath(`/auction/item/${itemId}`);
    revalidatePath(`/admin/items/${itemId}/edit`);
    redirect(`/admin/items/${itemId}/edit`);
}
