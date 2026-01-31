'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Link, Check, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import type { SocialAccount, Platform } from '@/types';

interface AccountConnectionsProps {
  accounts: SocialAccount[];
}

interface PlatformConfig {
  id: Platform;
  name: string;
  icon: typeof Facebook;
  color: string;
  bgColor: string;
  description: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Twitter,
    color: '#fafafa',
    bgColor: 'bg-[#fafafa]/10',
    description: 'Share short-form updates and engage with your audience',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#e4405f',
    bgColor: 'bg-[#e4405f]/10',
    description: 'Visual storytelling and community building',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877f2',
    bgColor: 'bg-[#1877f2]/10',
    description: 'Connect with communities and share longer content',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#ff0000',
    bgColor: 'bg-[#ff0000]/10',
    description: 'Video content and detailed descriptions',
  },
];

export function AccountConnections({ accounts }: AccountConnectionsProps) {
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));

  const handleConnect = async (platform: Platform) => {
    setConnecting(platform);

    // In a real implementation, this would initiate OAuth flow
    // For now, we'll simulate the OAuth flow
    const oauthUrls: Record<Platform, string> = {
      twitter: `https://twitter.com/i/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_APP_URL + '/api/auth/twitter/callback'
      )}&scope=tweet.read%20tweet.write%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain`,
      facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_APP_URL + '/api/auth/facebook/callback'
      )}&scope=pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish`,
      instagram: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_APP_URL + '/api/auth/instagram/callback'
      )}&scope=instagram_basic,instagram_content_publish`,
      youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(
        process.env.NEXT_PUBLIC_APP_URL + '/api/auth/youtube/callback'
      )}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code`,
    };

    // Open OAuth popup or redirect
    window.open(oauthUrls[platform], '_blank', 'width=600,height=700');

    setTimeout(() => setConnecting(null), 1000);
  };

  const handleDisconnect = async (platform: Platform) => {
    // In a real implementation, this would revoke the token
    console.log('Disconnect', platform);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50">
        <h2 className="text-[13px] font-medium text-[#fafafa] mb-1">Connected Accounts</h2>
        <p className="text-[12px] text-[#71717a]">
          Connect your social media accounts to enable cross-platform content generation.
        </p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map((platform) => {
          const isConnected = connectedPlatforms.has(platform.id);
          const account = accounts.find((a) => a.platform === platform.id);
          const Icon = platform.icon;

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50 flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-5 h-5" style={{ color: platform.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-medium text-[#fafafa]">
                    {platform.name}
                  </h3>
                  {isConnected && (
                    <span className="flex items-center gap-1 text-[11px] text-[#4ade80]">
                      <Check className="w-3 h-3" />
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#71717a] mt-0.5">
                  {isConnected ? (
                    <span className="text-[#a1a1aa]">@{account?.account_name}</span>
                  ) : (
                    platform.description
                  )}
                </p>
              </div>

              <button
                onClick={() =>
                  isConnected
                    ? handleDisconnect(platform.id)
                    : handleConnect(platform.id)
                }
                disabled={connecting === platform.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  isConnected
                    ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-400'
                    : 'bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {connecting === platform.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isConnected ? (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Disconnect</span>
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Connect</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-[#fbbf24]/5 border border-[#fbbf24]/20">
        <p className="text-[12px] text-[#fbbf24]">
          <strong>Note:</strong> OAuth integration requires setting up developer apps on each platform.
          This is a demo implementation showing the UI structure.
        </p>
      </div>
    </div>
  );
}
