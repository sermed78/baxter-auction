import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

function generateTagId() {
    return Math.floor(100 + Math.random() * 900).toString(); // 100-999
}

export async function POST(request: Request) {
    try {
        const { email, firstName, surname, password } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // New user — register
            let tagId = generateTagId();
            let isUnique = false;
            let attempts = 0;

            while (!isUnique && attempts < 10) {
                const existing = await prisma.user.findUnique({ where: { tagId } });
                if (!existing) {
                    isUnique = true;
                } else {
                    tagId = generateTagId();
                    attempts++;
                }
            }

            if (!isUnique) {
                return NextResponse.json({ error: 'System busy, try again.' }, { status: 500 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            user = await prisma.user.create({
                data: {
                    email,
                    firstName,
                    surname,
                    tagId,
                    role: 'USER',
                    password: hashedPassword,
                },
            });
        } else {
            // Existing user — verify password
            if (!user.password) {
                return NextResponse.json({ error: 'Account exists but has no password. Contact admin.' }, { status: 400 });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
            }

            // Update name if provided
            if (firstName || surname) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { firstName, surname },
                });
            }
        }

        // Create session
        const session = await encrypt({
            id: user.id,
            email: user.email,
            role: user.role,
            tagId: user.tagId,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        });

        const cookieStore = await cookies();
        cookieStore.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: '/',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
