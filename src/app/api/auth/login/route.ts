import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { resend } from '@/lib/resend';

function generateTagId() {
    return Math.floor(100 + Math.random() * 900).toString(); // 100-999
}

export async function POST(request: Request) {
    try {
        const { email, firstName, surname } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create new user with unique tag ID
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

            user = await prisma.user.create({
                data: {
                    email,
                    firstName,
                    surname,
                    tagId,
                    role: 'USER',
                },
            });
        } else {
            // Update existing user names if provided
            if (firstName || surname) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { firstName, surname }
                });
            }
        }

        // Generate Magic Link Token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: token,
                magicLinkExpires: expiresAt,
            },
        });

        // Send Email via Resend
        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

        // Debug: Check if API key is present (don't log full key)
        const key = process.env.RESEND_API_KEY;
        console.log(`[DEBUG] Resend Key loaded: ${!!key}, Length: ${key?.length}`);

        try {
            const result = await resend.emails.send({
                from: 'Baxter Auction <onboarding@resend.dev>',
                to: email,
                subject: 'Your Login Link',
                html: `<p>Click here to login: <a href="${magicLink}">${magicLink}</a></p>`
            });

            console.log('[DEBUG] Resend API Response:', JSON.stringify(result, null, 2));

            if (result.error) {
                console.error('[ERROR] Resend returned an error:', result.error);
                // Fallback log if Resend returns an error object (it might not throw)
                console.log(`\n=== FALLBACK MAGIC LINK FOR ${email} ===\n${magicLink}\n==============================\n`);
            } else {
                console.log(`Email successfully sent to ${email} with ID: ${result.data?.id}`);
            }

        } catch (emailError) {
            console.error('[CRITICAL] Exception during email sending:', emailError);
            console.log(`\n=== FALLBACK MAGIC LINK FOR ${email} ===\n${magicLink}\n==============================\n`);
        }

        return NextResponse.json({
            success: true,
            debugLink: process.env.NODE_ENV === 'development' ? magicLink : undefined
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
