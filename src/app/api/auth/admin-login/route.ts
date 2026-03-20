import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/session';
import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs'; // Uncomment when using hashing

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // DEBUG: Check what DATABASE_URL Vercel is using
        console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 40) + '...');

        // DEBUG: Check if ANY users exist
        const allUsers = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log('ALL USERS IN DB:', JSON.stringify(allUsers));

        const user = await prisma.user.findUnique({ where: { email } });

        console.log('LOGIN ATTEMPT:', { email, foundUser: !!user, role: user?.role, storedPw: user?.password, inputPw: password });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password (plain text comparison)
        const isValid = password === user.password;
        console.log('PASSWORD CHECK:', { isValid, stored: user.password, input: password });

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create Session
        const session = await encrypt({
            id: user.id,
            email: user.email,
            role: user.role,
            tagId: user.tagId,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        });

        const res = NextResponse.json({ success: true });

        res.cookies.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: '/',
        });

        return res;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
