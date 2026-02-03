'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';import { Coins, Sparkles, Zap, Building2, Check } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { PaymentMethodsSection } from './PaymentMethodsSection';
import type { Profile } from '@/types';

interface CreditsDisplayProps {
  profile: Profile;
}

export function CreditsDisplay({ profile }: CreditsDisplayProps) {  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tier = SUBSCRIPTION_TIERS[profile.subscription_tier];
  const creditsPercentage = (profile.credits / tier.credits) * 100;

  if (!mounted) {
    return (      <div className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50 animate-pulse">
        <div className="h-16 bg-[#27272a] rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-cyan-400/10 flex items-center justify-center">
            <Coins className="w-4 h-4 text-cyan-400" />
          </div>          <div>
            <p className="text-[13px] font-medium text-[#fafafa]">
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

      {/* Credits bar */}      <div className="h-2 rounded-full bg-[#27272a] overflow-hidden">
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
    </motion.div>
  );
}

interface SubscriptionTierCardProps {
  tier: 'free' | 'pro' | 'enterprise';
  currentTier: string;
  onSubscribe?: (tier: 'pro' | 'enterprise') => void;
  isLoading?: boolean;
}

export function SubscriptionTierCard({
  tier,
  currentTier,
  onSubscribe,
  isLoading,
}: SubscriptionTierCardProps) {
  const tierData = SUBSCRIPTION_TIERS[tier];
  const isCurrent = currentTier === tier;
  const isPro = tier === 'pro';
  const isEnterprise = tier === 'enterprise';

  const Icon = isPro ? Zap : isEnterprise ? Building2 : Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-lg border ${
        isCurrent
          ? 'bg-cyan-400/5 border-cyan-400/30'
          : 'bg-[#18181b] border-[#27272a]/50 hover:border-[#27272a]'
      } transition-colors`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center ${
              isPro
                ? 'bg-purple-500/10'
                : isEnterprise
                ? 'bg-amber-500/10'
                : 'bg-cyan-400/10'
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                isPro
                  ? 'text-purple-400'
                  : isEnterprise
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            />
          </div>
          <div>
            <h3 className="text-[14px] font-medium text-[#fafafa]">
              {tierData.name}
            </h3>
            <p className="text-[12px] text-[#71717a]">
              {tierData.credits} credits/month
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-medium text-[#fafafa]">
            ${tierData.price}
          </p>
          <p className="text-[11px] text-[#71717a]">/month</p>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {tierData.features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-[12px] text-[#a1a1aa]"
          >
            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <button
          disabled
          className="w-full py-2 rounded-md text-[12px] font-medium bg-cyan-400/20 text-cyan-400 cursor-default"
        >
          Current Plan
        </button>
      ) : tier !== 'free' ? (
        <button
          onClick={() => onSubscribe?.(tier as 'pro' | 'enterprise')}
          disabled={isLoading}
          className="w-full py-2 rounded-md text-[12px] font-medium bg-[#27272a] text-[#fafafa] hover:bg-[#3f3f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Upgrade'}
        </button>
      ) : (
        <button
          disabled
          className="w-full py-2 rounded-md text-[12px] font-medium bg-[#27272a]/50 text-[#71717a] cursor-not-allowed"
        >
          Downgrade
        </button>
      )}
    </motion.div>
  );
}

interface BillingSettingsProps {
  profile: Profile;
}

export function BillingSettings({ profile }: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (tier: 'pro' | 'enterprise') => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setMessage('Subscription cancelled successfully');
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[14px] font-medium text-[#fafafa] mb-1">
          Subscription
        </h2>
        <p className="text-[12px] text-[#71717a]">
          Manage your subscription and billing
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-[12px] ${
            message.includes('error') || message.includes('Failed')
              ? 'bg-red-500/10 text-red-400'
              : 'bg-green-500/10 text-green-400'
          }`}
        >
          {message}
        </div>
      )}

      {/* Current subscription info */}
      {profile.subscription_tier !== 'free' && (
        <div className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#fafafa]">
                Current Plan: {SUBSCRIPTION_TIERS[profile.subscription_tier].name}
              </p>
              <p className="text-[12px] text-[#71717a]">
                Status:{' '}
                <span
                  className={
                    profile.subscription_status === 'active'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }
                >
                  {profile.subscription_status}
                </span>
              </p>
              {profile.subscription_period_end && (
                <p className="text-[11px] text-[#52525b] mt-1">
                  Renews on{' '}
                  {new Date(profile.subscription_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-md text-[12px] font-medium text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tier selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(SUBSCRIPTION_TIERS) as Array<'free' | 'pro' | 'enterprise'>).map(
          (tier) => (
            <SubscriptionTierCard
              key={tier}
              tier={tier}
              currentTier={profile.subscription_tier}
              onSubscribe={handleSubscribe}
              isLoading={isLoading}
            />
          )
        )}
      </div>

      {/* Payment Methods Section */}
      <div className="pt-6 border-t border-[#27272a]/50">
        <PaymentMethodsSection />
      </div>
    </div>
  );
}
