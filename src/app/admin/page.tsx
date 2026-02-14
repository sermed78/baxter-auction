import { prisma } from '@/lib/prisma';
import { deleteItem, closeAuction } from '@/app/actions/admin';
import Link from 'next/link';


export default async function AdminDashboard() {
    const items = await prisma.auctionItem.findMany({ orderBy: { createdAt: 'desc' } });
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        orderBy: { email: 'asc' }
    });

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <Link href="/" className="px-4 py-2 text-slate-600 hover:text-slate-900">View Site</Link>
                    </div>
                </div>

                {/* Auction Items Section */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-800">Auction Items</h2>
                        <Link href="/admin/items/new" className="btn-primary">
                            + Add New Item
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {items.length === 0 ? (
                            <p className="text-slate-500 italic">No items yet.</p>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
                                    <div className="space-y-1">
                                        {/* Link to Edit Page */}
                                        <Link href={`/admin/items/${item.id}/edit`} className="hover:underline hover:text-blue-600 block">
                                            <h3 className="font-semibold text-lg">{item.title} ✏️</h3>
                                        </Link>
                                        <p className="text-slate-500 text-sm">
                                            Target End: {item.endTime.toLocaleDateString()}
                                            {new Date(item.endTime) < new Date() && <span className="text-red-600 font-bold ml-2">(Ended)</span>}
                                            {new Date(item.endTime) > new Date() && <span className="text-green-600 font-bold ml-2">(Active)</span>}
                                        </p>
                                        <p className="text-slate-900 mt-1">Starting Bid: {item.startingBid} kr</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <form action={async () => {
                                            'use server';
                                            await closeAuction(item.id);
                                        }}>
                                            <button className="text-slate-600 hover:text-slate-900 text-sm font-medium px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">
                                                Close
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            'use server';
                                            await deleteItem(item.id);
                                        }}>
                                            <button className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded border border-red-200 hover:bg-red-50">
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Bidders Section */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-800">Registered Users</h2>
                        <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium">
                            Manage Users &rarr;
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Tag ID</th>
                                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 text-sm text-slate-900">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-900 font-mono bg-slate-50 inline-block m-2 rounded px-2">{user.tagId}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{user.createdAt.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <div className="p-6 text-center text-slate-500">No users registered yet.</div>}
                    </div>
                </section>

            </div>
        </main>
    );
}
