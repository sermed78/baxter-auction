import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    const email = 'sermed78@gmail.com';
    const password = 'testtest1';

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            role: 'ADMIN',
            tagId: null,
            password: password,
        },
    });

    console.log({ user });
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
