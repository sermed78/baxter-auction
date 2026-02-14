import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'sermed78@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            email: true,
            magicLinkToken: true,
            magicLinkExpires: true,
            updatedAt: true
        }
    });
    console.log(JSON.stringify(user, null, 2));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
