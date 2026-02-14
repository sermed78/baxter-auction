'use client';

import { useState } from 'react';
import { placeBid } from '@/app/actions/auction';

export default function BidForm({
    itemId,
    minBid,
    userId
}: {
    itemId: string;
    minBid: number;
    userId: string;
}) {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (formData: FormData) => {
        const bidVal = parseFloat(formData.get('amount') as string);
        if (isNaN(bidVal) || bidVal < minBid) {
            setError(`Min bid: ${minBid.toLocaleString('sv-SE')} kr`);
            return;
        }
        setError('');
        await placeBid(formData);
        setAmount('');
    };

    return (
        <form action={handleSubmit} className="space-y-3">
            <div className="space-y-1">
                <input type="hidden" name="itemId" value={itemId} />

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">kr</span>
                    <input
                        name="amount"
                        type="number"
                        required
                        min={minBid}
                        step="1"
                        placeholder={minBid.toString()}
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError('');
                        }}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#003D87] focus:border-transparent outline-none transition-all"
                    />
                </div>
                {error && (
                    <p className="text-red-600 text-xs mt-1">
                        {error}
                    </p>
                )}
            </div>

            <button
                type="submit"
                className="w-full bg-[#003D87] hover:bg-[#002D65] text-white font-medium py-2 px-4 rounded transition-colors shadow-sm"
            >
                Place Bid
            </button>
        </form>
    );
}
