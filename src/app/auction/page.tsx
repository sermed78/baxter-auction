export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AuctionList from './AuctionList';

export default async function AuctionPage() {
    const items = await prisma.auctionItem.findMany({
        orderBy: { endTime: 'asc' },
        include: {
            bids: {
                orderBy: { amount: 'desc' },
                take: 1,
                include: { user: true }
            }
        }
    });

    return <AuctionList items={items} />;
}
