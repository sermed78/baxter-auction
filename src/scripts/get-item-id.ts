
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const item = await prisma.auctionItem.findFirst();
    if (item) {
        console.log(`FOUND_ITEM_ID: ${item.id}`);
        console.log(`FOUND_ITEM_TITLE: ${item.title}`);
    } else {
        console.log('NO_ITEMS_FOUND');
    }
}

main();
