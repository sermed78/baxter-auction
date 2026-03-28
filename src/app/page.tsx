'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, firstName, surname, password }),
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = '/auction';
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
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
                        Welcome to Baxter Sweden digital auction house. <br />Register or sign in below.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                        {error}
                    </div>
                )}

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
                    <div>
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#003D87] hover:bg-[#002D65] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <p className="text-xs text-center text-slate-400">
                        New users will be registered automatically
                    </p>
                </form>
            </div>
        </main>
    );
}
