'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            toast.success('Logged in successfully');
            router.push('/admin');
            router.refresh();
        } catch (error) {
            toast.error('Login Failed', {
                description: 'Please check your email and password.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full premium-card space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
                    <p className="text-slate-500 mt-2">Secure access for administrators</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-[#C0A062] focus:border-[#C0A062]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-[#C0A062] focus:border-[#C0A062]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </main>
    );
}
