import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/session';

export default async function AuctionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        {/* Logo Removed */}
                        <div className="relative h-10 w-40">
                            <Image
                                src="/logo.png"
                                alt="Baxter Logo"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                    </Link>

                    {/* Centered Tag ID */}
                    {session && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Your Tag ID</p>
                            <p className="text-lg font-mono font-bold text-[#003D87]">{session.tagId}</p>
                        </div>
                    )}

                    <nav className="flex gap-6">
                        <Link href="/auction" className="text-sm font-medium text-gray-700 hover:text-[#003D87]">
                            Auction
                        </Link>
                        <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-[#003D87]">
                            Admin
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="border-t border-gray-200 mt-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Baxter Sweden Auction House
                </div>
            </footer>
        </div>
    );
}
