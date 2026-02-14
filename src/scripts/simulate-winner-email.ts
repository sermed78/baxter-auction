
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing in .env');
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    const toEmail = 'sermed78@gmail.com';

    // Mock Data
    const itemTitle = "Royal Danish Armchair";
    const winningBid = 8500;
    const adminName = "Lina Douglah";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log(`Sending SIMULATED Winner Email to: ${toEmail}`);

    try {
        const data = await resend.emails.send({
            from: 'Baxter Auction <updates@resend.dev>',
            to: toEmail,
            subject: `You won the auction: ${itemTitle}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="text-align: center; padding: 20px 0;">
                        <h1 style="color: #003D87; margin: 0;">Baxter Sweden</h1>
                    </div>

                    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #111; margin-top: 0;">Congratulations! 🎉</h2>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">
                            We are pleased to inform you that you have won the auction for <strong>${itemTitle}</strong>.
                        </p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Winning Bid</p>
                            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: #003D87;">${winningBid.toLocaleString('sv-SE')} kr</p>
                        </div>

                        <h3 style="color: #111;">Next Steps</h3>
                        <p style="font-size: 16px; line-height: 1.5; color: #555;">
                            To arrange for payment and collection of your item, please reach out to <strong>${adminName}</strong> directly.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="mailto:lina_douglah@baxter.com" style="background-color: #003D87; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Contact ${adminName}</a>
                        </div>
                    </div>

                    <div style="text-align: center; padding-top: 20px; font-size: 12px; color: #9ca3af;">
                        <p>Baxter Sweden Auction House</p>
                    </div>
                </div>
            `
        });

        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('✅ Simulation Email Sent!');
            console.log('ID:', data.data?.id);
        }
    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

main();
