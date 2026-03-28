'use client';

import { deleteUser } from '@/app/actions/admin';

export default function DeleteUserButton({ userId, userEmail }: { userId: string; userEmail: string }) {
    return (
        <button
            type="button"
            className="text-red-600 hover:text-red-900 text-xs font-medium ml-2"
            onClick={async () => {
                if (confirm(`Delete user ${userEmail}?`)) {
                    await deleteUser(userId);
                }
            }}
        >
            Delete
        </button>
    );
}
