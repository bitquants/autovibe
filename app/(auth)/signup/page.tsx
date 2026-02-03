'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Create user profile immediately after signup
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName,
          credits: 500,
          subscription_tier: 'free',
          subscription_status: 'inactive',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't block signup if profile creation fails, it will be created on first login
      }
    }

    setSuccess(true);
    setIsLoading(false);

    // Auto-redirect after a moment
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 mb-4">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <h1 className="text-xl font-medium text-[#fafafa]">Account created!</h1>
          <p className="text-[13px] text-[#71717a] mt-1">
            Redirecting you to the dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="text-xl font-medium text-[#fafafa]">Create account</h1>
          <p className="text-[13px] text-[#71717a] mt-1">
            Start generating content with AI
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
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-md bg-[#18181b] border border-[#27272a] text-[13px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/20 transition-colors"
              placeholder="John Doe"
            />
          </div>

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
                minLength={8}
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
            <p className="text-[11px] text-[#52525b]">
              Must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 rounded-md bg-[#22d3ee] text-[#09090b] text-[13px] font-medium hover:bg-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#71717a]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[#22d3ee] hover:text-[#06b6d4] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
