import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
    title: 'Baxter Sweden Auction',
    description: 'Premium furniture auction',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="bg-white text-slate-900 min-h-screen antialiased" suppressHydrationWarning>
                {children}
                <Toaster position="top-center" theme="light" />
            </body>
        </html>
    );
}
