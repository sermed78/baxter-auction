'use client';

export default function LogoutButton() {
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    };

    return (
        <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
        >
            Sign Out
        </button>
    );
}
