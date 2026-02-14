
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
    console.log(`Attempting to send test email to: ${toEmail}`);
    console.log('Using API Key starting with:', process.env.RESEND_API_KEY?.substring(0, 5) + '...');

    try {
        const data = await resend.emails.send({
            from: 'Baxter Auction <updates@resend.dev>', // Default testing domain
            to: toEmail,
            subject: 'Baxter Auction - Test Notification',
            html: `
                <h1>Test Notification</h1>
                <p>This is a test email from the Baxter Auction system.</p>
                <p>If you received this, the email configuration for <strong>${toEmail}</strong> is working correctly.</p>
                <p>Time: ${new Date().toLocaleString()}</p>
            `
        });

        if (data.error) {
            console.error('Resend API returned an error:', data.error);
        } else {
            console.log('✅ Email sent successfully!');
            console.log('ID:', data.data?.id);
        }
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
}

main();
