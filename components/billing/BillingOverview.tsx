'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, CreditCard, Zap, Calendar, TrendingUp, Wallet } from 'lucide-react';
import type { Profile } from '@/types';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';

interface BillingOverviewProps {
  profile: Profile;
}

export function BillingOverview({ profile }: BillingOverviewProps) {
  const [mounted, setMounted] = useState(false);

  // Calculate usage percentage
  const tier = SUBSCRIPTION_TIERS[profile.subscription_tier];
  const creditsUsed = tier.credits - profile.credits;
  const usagePercentage = Math.min((creditsUsed / tier.credits) * 100, 100);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Credits Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Credits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-[11px] text-[#71717a] uppercase tracking-wide">Available Credits</p>
              <p className="text-2xl font-semibold text-[#fafafa]">{profile.credits.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[#27272a] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - usagePercentage}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full rounded-full bg-cyan-400"
            />
          </div>
          <p className="text-[11px] text-[#71717a] mt-2">
            {profile.credits.toLocaleString()} of {tier.credits.toLocaleString()} remaining
          </p>
        </motion.div>

        {/* Monthly Usage */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-lg bg-[#18181b] border border-[#27272a]/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] text-[#71717a] uppercase tracking-wide">Monthly Usage</p>
              <p className="text-2xl font-semibold text-[#fafafa]">{creditsUsed.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-[#27272a] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`h-full rounded-full ${
                  usagePercentage > 80 ? 'bg-red-400' : usagePercentage > 50 ? 'bg-yellow-400' : 'bg-purple-400'
                }`}
              />
            </div>
            <span className="text-[11px] text-[#71717a]">{usagePercentage.toFixed(0)}%</span>
          </div>
          <p className="text-[11px] text-[#71717a] mt-2">
            {creditsUsed.toLocaleString()} credits used this month
          </p>
        </motion.div>

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-lg bg-[#18181b] border border-[#27272a]/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              profile.subscription_tier === 'enterprise' 
                ? 'bg-amber-500/10' 
                : profile.subscription_tier === 'pro' 
                ? 'bg-purple-500/10' 
                : 'bg-cyan-400/10'
            }`}>
              <Zap className={`w-5 h-5 ${
                profile.subscription_tier === 'enterprise' 
                  ? 'text-amber-400' 
                  : profile.subscription_tier === 'pro' 
                  ? 'text-purple-400' 
                  : 'text-cyan-400'
              }`} />
            </div>
            <div>
              <p className="text-[11px] text-[#71717a] uppercase tracking-wide">Current Plan</p>
              <p className="text-2xl font-semibold text-[#fafafa]">{tier.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#a1a1aa]">
              {tier.credits.toLocaleString()} credits/month
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              profile.subscription_status === 'active'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-[#27272a] text-[#71717a]'
            }`}>
              {profile.subscription_status === 'active' ? 'Active' : 'Free'}
            </span>
          </div>
          {profile.subscription_period_end && (
            <p className="text-[11px] text-[#71717a] mt-2">
              Renews on {formatDate(profile.subscription_period_end)}
            </p>
          )}
        </motion.div>
      </div>

      {/* Billing Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-lg bg-[#18181b] border border-[#27272a]/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-4 h-4 text-[#71717a]" />
          <h3 className="text-[14px] font-medium text-[#fafafa]">Billing Summary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#27272a]/50">
              <span className="text-[13px] text-[#71717a]">Plan</span>
              <span className="text-[13px] text-[#fafafa]">{tier.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#27272a]/50">
              <span className="text-[13px] text-[#71717a]">Monthly Price</span>
              <span className="text-[13px] text-[#fafafa]">
                {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#27272a]/50">
              <span className="text-[13px] text-[#71717a]">Credits Included</span>
              <span className="text-[13px] text-[#fafafa]">{tier.credits.toLocaleString()}/month</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#27272a]/50">
              <span className="text-[13px] text-[#71717a]">Status</span>
              <span className={`text-[13px] ${
                profile.subscription_status === 'active' ? 'text-green-400' : 'text-[#71717a]'
              }`}>
                {profile.subscription_status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            {profile.subscription_period_end && (
              <div className="flex items-center justify-between py-2 border-b border-[#27272a]/50">
                <span className="text-[13px] text-[#71717a]">Next Billing Date</span>
                <span className="text-[13px] text-[#fafafa]">{formatDate(profile.subscription_period_end)}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-[#27272a]/50">
              <span className="text-[13px] text-[#71717a]">Payment Method</span>
              <span className="text-[13px] text-[#fafafa] flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {profile.stripe_customer_id ? 'Saved' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
