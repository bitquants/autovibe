'use client';

import { useState, useEffect } from 'react';
import { Coins, Zap, Building2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';

interface CreditsWidgetProfile {
  credits: number;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
}

interface CreditsWidgetProps {
  profile: CreditsWidgetProfile;
}

export function CreditsWidget({ profile }: CreditsWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tier = SUBSCRIPTION_TIERS[profile.subscription_tier];
  const creditsPercentage = (profile.credits / tier.credits) * 100;

  if (!mounted) {
    return (
      <div className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50 animate-pulse">
        <div className="h-16 bg-[#27272a] rounded" />
      </div>
    );
  }

  const getTierIcon = () => {
    switch (profile.subscription_tier) {
      case 'pro':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'enterprise':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTierColor = () => {
    switch (profile.subscription_tier) {
      case 'pro':
        return 'text-purple-400';
      case 'enterprise':
        return 'text-amber-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-md bg-[#27272a] flex items-center justify-center`}>
            {getTierIcon()}
          </div>
          <div>
            <p className={`text-[13px] font-medium ${getTierColor()}`}>
              {profile.credits} Credits
            </p>
            <p className="text-[11px] text-[#71717a]">
              {tier.name} Plan
            </p>
          </div>
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full ${
            profile.subscription_status === 'active'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-[#27272a] text-[#71717a]'
          }`}
        >
          {profile.subscription_status === 'active' ? 'Active' : 'Free'}
        </span>
      </div>

      {/* Credits bar */}
      <div className="h-2 rounded-full bg-[#27272a] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(creditsPercentage, 100)}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-full rounded-full ${
            creditsPercentage > 50
              ? 'bg-cyan-400'
              : creditsPercentage > 20
              ? 'bg-yellow-400'
              : 'bg-red-400'
          }`}
        />
      </div>

      <p className="text-[11px] text-[#71717a] mt-2">
        {profile.credits} / {tier.credits} credits remaining
      </p>

      {profile.credits < 3 && (
        <p className="text-[11px] text-yellow-400 mt-1">
          Running low! Upgrade to get more credits.
        </p>
      )}
    </motion.div>
  );
}