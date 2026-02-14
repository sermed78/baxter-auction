import { prisma } from '@/lib/prisma';
import { updateItem } from '@/app/actions/admin';
import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';

import ResetButton from './ResetButton';

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Removed debug logs as type is confirmed String

    const item = await prisma.auctionItem.findUnique({
        where: { id: id },
        include: { bids: true }
    });

    if (!item) notFound();

    const hasBids = item.bids.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-serif">Edit Auction Item</h2>

                <form action={updateItem} className="space-y-4">
                    <input type="hidden" name="itemId" value={item.id} />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input name="title" defaultValue={item.title} required className="w-full px-4 py-2 border rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea name="description" defaultValue={item.description} required rows={3} className="w-full px-4 py-2 border rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Image</label>
                        {item.imageUrl && (
                            <img src={item.imageUrl} alt="Current" className="h-20 w-auto mb-2 rounded border" />
                        )}
                        <label className="block text-xs text-slate-500">Upload new to replace (optional)</label>
                        <input name="image" type="file" accept="image/*" className="w-full px-4 py-2 border rounded-md" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Starting Bid (SEK)</label>
                            <input
                                name="startingBid"
                                type="number"
                                step="1"
                                defaultValue={item.startingBid}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <input
                                name="startTime"
                                type="datetime-local"
                                defaultValue={item.startTime ? new Date(item.startTime).toISOString().slice(0, 16) : ''}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <input
                                name="endTime"
                                type="datetime-local"
                                defaultValue={item.endTime.toISOString().slice(0, 16)}
                                required
                                className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary mt-4">
                        Save Changes
                    </button>
                </form>

                {hasBids && <ResetButton itemId={item.id} />}

                <div className="mt-4 border-t pt-4">
                    <a href="/admin" className="block text-center text-sm text-slate-500 hover:underline">
                        Cancel & Go Back
                    </a>
                </div>
            </div>
        </div>
    );
}
