'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Facebook, Twitter, Instagram, Youtube, Plus } from 'lucide-react';
import type { SocialAccount, Platform } from '@/types';

interface ConnectedAccountsProps {
  accounts: SocialAccount[];
}

const platformIcons: Record<Platform, typeof Facebook> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

const platformColors: Record<Platform, string> = {
  facebook: '#1877f2',
  twitter: '#fafafa',
  instagram: '#e4405f',
  youtube: '#ff0000',
};

export function ConnectedAccounts({ accounts }: ConnectedAccountsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-5 rounded-lg bg-[#18181b] border border-[#27272a]/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13px] font-medium text-[#fafafa]">Connected Accounts</h2>
        <Link
          href="/settings"
          className="text-[12px] text-[#71717a] hover:text-[#22d3ee] transition-colors flex items-center gap-1"
        >
          Manage
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[13px] text-[#71717a]">No accounts connected</p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 mt-3 text-[12px] text-[#22d3ee] hover:text-[#06b6d4] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Connect your first account
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account, index) => {
            const Icon = platformIcons[account.platform];
            const color = platformColors[account.platform];

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3 p-3 rounded-md bg-[#09090b] border border-[#27272a]/30"
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#fafafa] truncate">
                    {account.account_name}
                  </p>
                  <p className="text-[11px] text-[#71717a] capitalize">
                    {account.platform}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
