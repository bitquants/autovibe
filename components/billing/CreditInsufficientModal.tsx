'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, AlertTriangle, Zap, ArrowRight, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';

interface CreditInsufficientModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
}

export function CreditInsufficientModal({ isOpen, onClose, currentCredits }: CreditInsufficientModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = () => {
    setIsLoading(true);
    router.push('/settings');
    onClose();
  };

  const handleGetCredits = () => {
    setIsLoading(true);
    router.push('/settings');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="p-6 rounded-xl bg-[#18181b] border border-[#27272a] shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#fafafa]">Insufficient Credits</h3>
                    <p className="text-[13px] text-[#71717a]">
                      You need more credits to generate content
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Credits */}
              <div className="p-4 rounded-lg bg-[#27272a]/50 border border-[#3f3f46] mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-cyan-400" />
                    <span className="text-[14px] text-[#a1a1aa]">Current Balance</span>
                  </div>
                  <span className="text-2xl font-semibold text-[#fafafa]">{currentCredits}</span>
                </div>
                <div className="mt-2 text-[12px] text-[#71717a]">
                  Each generation costs 1 credit and creates content for 4 platforms
                </div>
              </div>

              {/* Upgrade Options */}
              <div className="space-y-3 mb-6">
                <p className="text-[13px] font-medium text-[#a1a1aa] mb-3">Upgrade to get more credits:</p>
                
                {/* Pro Plan */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#fafafa] group-hover:text-purple-300 transition-colors">
                          {SUBSCRIPTION_TIERS.pro.name} Plan
                        </p>
                        <p className="text-[12px] text-[#71717a]">
                          {SUBSCRIPTION_TIERS.pro.credits.toLocaleString()} credits/month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-semibold text-[#fafafa]">
                        ${SUBSCRIPTION_TIERS.pro.price}
                      </span>
                      <span className="text-[12px] text-[#71717a]">/mo</span>
                      <ArrowRight className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.button>

                {/* Enterprise Plan */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#fafafa] group-hover:text-amber-300 transition-colors">
                          {SUBSCRIPTION_TIERS.enterprise.name} Plan
                        </p>
                        <p className="text-[12px] text-[#71717a]">
                          {SUBSCRIPTION_TIERS.enterprise.credits.toLocaleString()} credits/month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-semibold text-[#fafafa]">
                        ${SUBSCRIPTION_TIERS.enterprise.price}
                      </span>
                      <span className="text-[12px] text-[#71717a]">/mo</span>
                      <ArrowRight className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-md text-[13px] font-medium text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleGetCredits}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-md text-[13px] font-medium bg-cyan-400 text-[#18181b] hover:bg-cyan-300 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Get More Credits'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
