'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth callback
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      router.push('/settings?error=' + encodeURIComponent(error));
      return;
    }

    if (code) {
      // In a real implementation, exchange the code for tokens
      // and save to Supabase
      console.log('OAuth code received:', code);
      router.push('/settings?success=true');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#22d3ee] mx-auto mb-4" />
        <p className="text-[13px] text-[#a1a1aa]">Completing authentication...</p>
      </motion.div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#22d3ee] mx-auto mb-4" />
          <p className="text-[13px] text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
