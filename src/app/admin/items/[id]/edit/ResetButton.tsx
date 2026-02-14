'use client';

import { resetAuction } from '@/app/actions/admin';
import { useState } from 'react';

export default function ResetButton({ itemId }: { itemId: string }) {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (confirm('ARE YOU SURE?\n\nThis will DELETE ALL BIDS and reset the current price to the starting bid.\nThis action cannot be undone.')) {
            setLoading(true);
            try {
                await resetAuction(itemId);
            } catch (e: any) {
                if (e.message === 'NEXT_REDIRECT') {
                    // Redirect is successful, do nothing (or explicitly reload if needed)
                    return;
                }
                alert('Error resetting auction: ' + e.message);
                setLoading(false);
            }
        }
    };

    return (
        <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-red-100 text-red-700 font-semibold py-3 px-4 rounded-md border border-red-200 hover:bg-red-200 transition-colors mt-8"
        >
            {loading ? 'Resetting...' : '⚠️ Reset Auction (Clear Bids)'}
        </button>
    );
}
