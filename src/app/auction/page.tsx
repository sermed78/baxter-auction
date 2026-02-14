import { prisma } from '@/lib/prisma';
import AuctionList from './AuctionList';

export default async function AuctionPage() {
    const items = await prisma.auctionItem.findMany({
        where: {
            endTime: { gt: new Date() }
        },
        orderBy: { endTime: 'asc' },
        include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
    });

    return <AuctionList items={items} />;
}
