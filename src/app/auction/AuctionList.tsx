'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuctionItem, Bid } from '@prisma/client';

type ItemWithBids = AuctionItem & {
    bids: Bid[];
};

export default function AuctionList({ items }: { items: ItemWithBids[] }) {
    const [view, setView] = useState<'grid' | 'list'>('grid');

    if (items.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No active auctions at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Current Auctions</h1>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100 text-[#003D87]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Grid View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded ${view === 'list' ? 'bg-gray-100 text-[#003D87]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="List View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => {
                        const currentBid = item.bids[0]?.amount || item.startingBid;
                        const timeLeft = new Date(item.endTime).getTime() - Date.now();
                        const isEndingSoon = timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000;

                        return (
                            <Link href={`/auction/item/${item.id}`} key={item.id} className="group">
                                <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col h-full">
                                    <div className="relative aspect-[4/3] bg-gray-100">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}

                                        {isEndingSoon && (
                                            <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                                                Ends Soon
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#003D87] line-clamp-1 mb-2">
                                            {item.title}
                                        </h2>
                                        <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-4">
                                            {item.description}
                                        </p>

                                        <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Current Bid</p>
                                                <p className="text-lg font-mono font-medium text-gray-900">
                                                    {currentBid.toLocaleString('sv-SE')} kr
                                                </p>
                                            </div>
                                            <span className="text-[#003D87] text-sm font-medium">View Item &rarr;</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const currentBid = item.bids[0]?.amount || item.startingBid;
                        const timeLeft = new Date(item.endTime).getTime() - Date.now();
                        const isEndingSoon = timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000;

                        return (
                            <Link href={`/auction/item/${item.id}`} key={item.id} className="block group">
                                <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-row h-32 md:h-40">
                                    <div className="relative w-32 md:w-48 bg-gray-100 flex-shrink-0">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                        {isEndingSoon && (
                                            <div className="absolute top-1 right-1 bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                Ends Soon
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#003D87] line-clamp-1">
                                                {item.title}
                                            </h2>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1 hidden sm:block">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Current Bid</p>
                                                <p className="text-lg font-mono font-medium text-gray-900">
                                                    {currentBid.toLocaleString('sv-SE')} kr
                                                </p>
                                            </div>
                                            <span className="text-[#003D87] text-sm font-medium whitespace-nowrap ml-4">View &rarr;</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
