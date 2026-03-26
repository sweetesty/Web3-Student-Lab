'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setLocalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-black relative px-4 py-12 overflow-hidden">
      {/* Abstract Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform -rotate-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-wide uppercase">
            Initialize <span className="text-red-600">Session</span>
          </h1>
          <p className="text-gray-400 font-medium">Access your secure Web3 learning node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || localError) && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-500 text-sm font-bold text-center">{error || localError}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider"
            >
              Network ID (Email)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors placeholder-gray-600"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-gray-300 uppercase tracking-wider"
              >
                Passphrase
              </label>
              <a
                href="#"
                className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                Recover Key?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-white/20 bg-black text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-lg font-black tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] ${
              isSubmitting
                ? 'bg-red-900 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] transform hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? 'Authenticating...' : 'Connect node'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400">
            Node uninitialized?{' '}
            <Link
              href="/auth/register"
              className="text-red-500 hover:text-red-400 font-bold tracking-wide uppercase"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
