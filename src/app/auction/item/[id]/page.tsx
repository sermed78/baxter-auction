import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BidForm from '../../BidForm';
import { getSession } from '@/lib/session';
import Link from 'next/link';

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await prisma.auctionItem.findUnique({
        where: { id: id },
        include: {
            bids: {
                orderBy: { amount: 'desc' },
                include: { user: true }
            }
        }
    });

    if (!item) notFound();

    const session = await getSession();
    const currentBid = item.bids[0]?.amount || item.startingBid;
    const minBid = item.bids.length > 0 ? item.bids[0].amount + 1 : item.startingBid;
    const timeLeft = new Date(item.endTime).getTime() - Date.now();
    const isExpired = timeLeft < 0;

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/auction" className="inline-block mb-6 text-sm text-gray-500 hover:text-gray-900">
                &larr; Back to Auction
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* Left: Image */}
                <div className="relative aspect-square md:aspect-auto bg-gray-100 border-r border-gray-200">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="p-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{item.title}</h1>
                        <p className="text-sm text-gray-500">
                            Ends on {new Date(item.endTime).toLocaleDateString()}
                        </p>
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        {item.description}
                    </p>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-gray-500 uppercase">Current Bid</span>
                            <span className="text-2xl font-mono font-bold text-[#003D87]">
                                {currentBid.toLocaleString('sv-SE')} kr
                            </span>
                        </div>

                        {!isExpired ? (
                            session ? (
                                <BidForm itemId={item.id} minBid={minBid} userId={session.id} />
                            ) : (
                                <div className="text-center pt-2">
                                    <Link href="/" className="text-[#003D87] font-medium hover:underline">
                                        Log in to place a bid
                                    </Link>
                                </div>
                            )
                        ) : (
                            <div className="text-center p-2 bg-gray-200 rounded text-gray-600 font-medium">
                                Auction Closed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
