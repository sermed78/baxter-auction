import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

// This runs on a schedule (Vercel Cron) to check for ended auctions
// and send winner emails automatically
export async function GET() {
    try {
        // Find auctions that ended but haven't been notified
        const endedItems = await prisma.auctionItem.findMany({
            where: {
                endTime: { lt: new Date() },
                winnerNotified: false,
            },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1,
                    include: { user: true }
                }
            }
        });

        for (const item of endedItems) {
            const winner = item.bids[0]?.user;

            if (winner && winner.email) {
                try {
                    await resend.emails.send({
                        from: 'Baxter Auction <noreply@baxterauction.se>',
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
                    console.log(`Winner email sent to ${winner.email} for ${item.title}`);
                } catch (error) {
                    console.error(`Failed to send winner email for ${item.title}:`, error);
                }
            }

            // Mark as notified regardless (even if no bids)
            await prisma.auctionItem.update({
                where: { id: item.id },
                data: { winnerNotified: true }
            });
        }

        return NextResponse.json({
            checked: endedItems.length,
            message: `Processed ${endedItems.length} ended auctions`
        });
    } catch (error) {
        console.error('Cron check-winners error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
