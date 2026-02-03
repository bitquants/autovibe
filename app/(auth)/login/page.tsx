'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, Loader2, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleOAuthLogin = async (provider: 'facebook' | 'twitter' | 'google') => {
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#22d3ee]/10 mb-4">
            <Sparkles className="w-5 h-5 text-[#22d3ee]" />
          </div>
          <h1 className="text-xl font-medium text-[#fafafa]">Welcome back</h1>
          <p className="text-[13px] text-[#71717a] mt-1">
            Sign in to continue to AutoVibe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[#a1a1aa]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-md bg-[#18181b] border border-[#27272a] text-[13px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/20 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[#a1a1aa]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-9 px-3 pr-10 rounded-md bg-[#18181b] border border-[#27272a] text-[13px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/20 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#a1a1aa] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 rounded-md bg-[#22d3ee] text-[#09090b] text-[13px] font-medium hover:bg-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272a]" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-[#09090b] px-2 text-[#71717a]">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleOAuthLogin('facebook')}
            disabled={isLoading}
            className="flex items-center justify-center h-9 rounded-md bg-[#1877f2]/10 border border-[#1877f2]/20 text-[#1877f2] hover:bg-[#1877f2]/20 transition-colors disabled:opacity-50"
          >
            <Facebook className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOAuthLogin('twitter')}
            disabled={isLoading}
            className="flex items-center justify-center h-9 rounded-md bg-[#1da1f2]/10 border border-[#1da1f2]/20 text-[#1da1f2] hover:bg-[#1da1f2]/20 transition-colors disabled:opacity-50"
          >
            <Twitter className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center h-9 rounded-md bg-[#ea4335]/10 border border-[#ea4335]/20 text-[#ea4335] hover:bg-[#ea4335]/20 transition-colors disabled:opacity-50"
          >
            <Youtube className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-6 text-center text-[13px] text-[#71717a]">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-[#22d3ee] hover:text-[#06b6d4] transition-colors"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
