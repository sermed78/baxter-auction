import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { magicLinkToken: token },
    });

    if (!user || !user.magicLinkExpires || user.magicLinkExpires < new Date()) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Create Session
    const session = await encrypt({
        id: user.id,
        email: user.email,
        role: user.role,
        tagId: user.tagId,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });

    // Clear token to prevent reuse
    await prisma.user.update({
        where: { id: user.id },
        data: {
            magicLinkToken: null,
            magicLinkExpires: null,
        },
    });

    const res = NextResponse.redirect(new URL('/auction', request.url));

    res.cookies.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: '/',
    });

    return res;
}
