'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Facebook, Twitter, Instagram, Youtube, Plus, Loader2 } from 'lucide-react';
import type { SocialAccount, Platform } from '@/types';
import { useState } from 'react';

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

const platformNames: Record<Platform, string> = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

// Only Twitter/X is enabled for now
const PLATFORMS: { id: Platform; enabled: boolean }[] = [
  { id: 'twitter', enabled: true },
  { id: 'instagram', enabled: false },
  { id: 'facebook', enabled: false },
  { id: 'youtube', enabled: false },
];

export function ConnectedAccounts({ accounts }: ConnectedAccountsProps) {
  const [connecting, setConnecting] = useState<Platform | null>(null);
  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  const generateCodeChallenge = async (codeVerifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64Digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const handleConnect = async (platform: Platform) => {
    setConnecting(platform);

    if (platform === 'twitter') {
      // Twitter OAuth 2.0 PKCE flow
      const state = generateRandomString(32);
      const codeVerifier = generateRandomString(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code verifier and state in cookies for the callback to access
      document.cookie = `twitter_code_verifier=${codeVerifier}; path=/; max-age=600; SameSite=Lax`;
      document.cookie = `twitter_state=${state}; path=/; max-age=600; SameSite=Lax`;
      
      const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const TWITTER_CLIENT_ID = 'QjJXdzBab2stSDdFZXo1a24tNkg6MTpjaQ';
      
      // Build the URL manually to ensure proper encoding
      const authUrl = 'https://twitter.com/i/oauth2/authorize?' + 
        'response_type=code&' +
        'client_id=' + encodeURIComponent(TWITTER_CLIENT_ID) + '&' +
        'redirect_uri=' + encodeURIComponent(`${APP_URL}/api/auth/twitter/callback`) + '&' +
        'scope=' + encodeURIComponent('tweet.read tweet.write users.read offline.access') + '&' +
        'state=' + encodeURIComponent(state) + '&' +
        'code_challenge=' + encodeURIComponent(codeChallenge) + '&' +
        'code_challenge_method=S256';
      
      window.location.href = authUrl;
      return;
    }

    // For other platforms, show coming soon
    alert(`${platformNames[platform]} integration coming soon!`);
    setConnecting(null);
  };

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
        <div className="space-y-4">
          <p className="text-[13px] text-[#71717a] text-center">Connect your first account</p>
          
          {/* Quick Connect Grid */}
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((platform) => {
              const Icon = platformIcons[platform.id];
              const color = platformColors[platform.id];
              const isEnabled = platform.enabled;
              
              return (
                <button
                  key={platform.id}
                  onClick={() => isEnabled && handleConnect(platform.id)}
                  disabled={!isEnabled || connecting === platform.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    isEnabled
                      ? 'bg-[#09090b] border-[#27272a]/50 hover:border-[#3f3f46] hover:bg-[#0f0f10] cursor-pointer'
                      : 'bg-[#09090b]/50 border-[#27272a]/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    {connecting === platform.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color }} />
                    ) : (
                      <Icon className="w-4 h-4" style={{ color }} />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[12px] text-[#fafafa] font-medium">
                      {platformNames[platform.id]}
                    </p>
                    <p className="text-[10px] text-[#71717a]">
                      {isEnabled ? 'Click to connect' : 'Coming soon'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#22d3ee] hover:text-[#06b6d4] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            More connection options
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
          
          {/* Add more accounts hint */}
          {accounts.length < 4 && (
            <Link
              href="/settings"
              className="flex items-center justify-center gap-1.5 p-2 rounded-md border border-dashed border-[#27272a]/50 text-[12px] text-[#71717a] hover:text-[#22d3ee] hover:border-[#22d3ee]/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Connect more accounts
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}
