'use client';

import { createItem } from '@/app/actions/admin';
import Link from 'next/link';

export default function NewItemPage() {
    return (
        <main className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full premium-card space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Add Auction Item</h1>
                    <Link href="/admin" className="text-slate-500 hover:text-slate-900">Cancel</Link>
                </div>

                <form action={createItem} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input name="title" required className="w-full px-4 py-2 border rounded-md" placeholder="e.g. Vintage Armchair" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea name="description" required rows={4} className="w-full px-4 py-2 border rounded-md" placeholder="Detailed description..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image (Optional)</label>
                        <input name="image" type="file" accept="image/*" className="w-full px-4 py-2 border rounded-md" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Starting Bid (SEK)</label>
                            <input name="startingBid" type="number" step="1" required className="w-full px-4 py-2 border rounded-md" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <input name="startTime" type="datetime-local" required className="w-full px-4 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <input name="endTime" type="datetime-local" required className="w-full px-4 py-2 border rounded-md" />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary">Create Item</button>
                </form>
            </div>
        </main>
    );
}
