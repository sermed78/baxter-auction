'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugLink, setDebugLink] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setDebugLink(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, firstName, surname }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Magic link sent! Check your email.');
                if (data.debugLink) {
                    setDebugLink(data.debugLink);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-8 border border-gray-100">
                <div className="flex flex-col items-center space-y-4">
                    <Image src="/logo.png" alt="Baxter Logo" width={100} height={100} className="object-contain" />
                    <p className="text-sm text-slate-600 text-center">
                        Welcome to Baxter Sweden digital auction house. <br />Register to sign in.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Surname"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#003D87] hover:bg-[#002D65] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Sending Link...' : 'Sign In with Email'}
                    </button>
                    <p className="text-xs text-center text-slate-400">
                        Secure passwordless access
                    </p>
                </form>

                {debugLink && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                        <p className="font-bold text-yellow-800 mb-2">Development Mode Link:</p>
                        <p className="break-all font-mono text-xs text-slate-600 mb-2">{debugLink}</p>
                        <a href={debugLink} className="text-blue-600 hover:underline font-medium">Click here to Login directly</a>
                    </div>
                )}
            </div>
        </main>
    );
}
