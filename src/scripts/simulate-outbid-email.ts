
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
    const itemTitle = "Vintage Baxter Leather Sofa";
    const newBidAmount = 5500;
    const yourBidAmount = 5000;
    // Use a real ID if available, otherwise just use a placeholder
    const itemId = "cmllm78ke0002npezne7jdj3j";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log(`Sending SIMULATED Outbid Email to: ${toEmail}`);

    try {
        const data = await resend.emails.send({
            from: 'Baxter Auction <updates@resend.dev>',
            to: toEmail,
            subject: `You have been outbid on ${itemTitle}`,
            html: `
                <h1>Outbid Alert</h1>
                <p>A new bid of <strong>${newBidAmount.toLocaleString('sv-SE')} kr</strong> has been placed on <strong>${itemTitle}</strong>.</p>
                <p>Your bid was: ${yourBidAmount.toLocaleString('sv-SE')} kr.</p>
                <p><a href="${appUrl}/auction/item/${itemId}">Click here to place a new bid</a></p>
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
