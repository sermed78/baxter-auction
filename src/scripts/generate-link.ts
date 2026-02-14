import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const email = 'ldouglah@gmail.com'; // Change this to generate for others
    console.log(`Generating magic link for: ${email}`);

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error('User not found!');
            return;
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: token,
                magicLinkExpires: expiresAt,
            },
        });

        const magicLink = `http://localhost:3000/api/auth/verify?token=${token}`;

        console.log('\n==================================================');
        console.log(`User: ${user.firstName} ${user.surname} (${user.email})`);
        console.log('MAGIC LINK (Copy and paste into browser):');
        console.log(magicLink);
        console.log('==================================================\n');

    } catch (e) {
        console.error(`Error: ${e}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
