import { prisma } from '@/lib/prisma';
import { updateUserTagId } from '@/app/actions/admin';
import Link from 'next/link';

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-serif font-bold text-slate-900">User Management</h1>
                    <Link href="/admin" className="btn-primary bg-slate-600 hover:bg-slate-700">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tag ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {user.firstName} {user.surname}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">
                                        {user.tagId || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <form action={async (formData) => {
                                            'use server';
                                            const newTag = formData.get('tagId') as string;
                                            await updateUserTagId(user.id, newTag);
                                        }} className="flex gap-2">
                                            <input
                                                name="tagId"
                                                defaultValue={user.tagId || ''}
                                                className="w-20 px-2 py-1 border rounded text-sm"
                                                placeholder="Tag ID"
                                            />
                                            <button type="submit" className="text-blue-600 hover:text-blue-900 text-xs font-medium">
                                                Update
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
