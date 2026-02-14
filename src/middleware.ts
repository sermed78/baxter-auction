import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from '@/lib/session';

export async function middleware(request: NextRequest) {
    // Update session expiry if valid
    await updateSession(request);

    const sessionCookie = request.cookies.get('session')?.value;
    let user = null;

    if (sessionCookie) {
        user = await decrypt(sessionCookie);
    }

    const path = request.nextUrl.pathname;

    // Protect /auction route
    if (path.startsWith('/auction')) {
        if (!user) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protect /admin route
    if (path.startsWith('/admin')) {
        if (path === '/admin/login') return NextResponse.next();

        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        if (user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/auction/:path*', '/admin/:path*'],
};
