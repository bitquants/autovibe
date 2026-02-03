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

// Only Twitter/X is enabled for now - others coming soon
const PLATFORMS: (PlatformConfig & { enabled: boolean })[] = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Twitter,
    color: '#fafafa',
    bgColor: 'bg-[#fafafa]/10',
    description: 'Share short-form updates and engage with your audience',
    enabled: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#e4405f',
    bgColor: 'bg-[#e4405f]/10',
    description: 'Visual storytelling and community building (Coming Soon)',
    enabled: false,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877f2',
    bgColor: 'bg-[#1877f2]/10',
    description: 'Connect with communities and share longer content (Coming Soon)',
    enabled: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#ff0000',
    bgColor: 'bg-[#ff0000]/10',
    description: 'Video content and detailed descriptions (Coming Soon)',
    enabled: false,
  },
];

// Twitter OAuth 2.0 configuration
// NOTE: This must match the Client ID in your Twitter Developer Portal exactly
const TWITTER_CLIENT_ID = 'QjJXdzBab2stSDdFZXo1a24tNkg6MTpjaQ';
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export function AccountConnections({ accounts }: AccountConnectionsProps) {
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
      // Cookie will be available to the server during the callback
      document.cookie = `twitter_code_verifier=${codeVerifier}; path=/; max-age=600; SameSite=Lax`;
      document.cookie = `twitter_state=${state}; path=/; max-age=600; SameSite=Lax`;
      
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: `${APP_URL}/api/auth/twitter/callback`,
        scope: 'tweet.read tweet.write users.read offline.access',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });
      
      const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
      window.location.href = authUrl;
      return;
    }

    // For other platforms, use the existing flow
    const oauthUrls: Record<Exclude<Platform, 'twitter'>, string> = {
      facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(
        APP_URL + '/api/auth/facebook/callback'
      )}&scope=pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish`,
      instagram: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(
        APP_URL + '/api/auth/instagram/callback'
      )}&scope=instagram_basic,instagram_content_publish`,
      youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(
        APP_URL + '/api/auth/youtube/callback'
      )}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code`,
    };

    // Open OAuth popup or redirect
    window.open(oauthUrls[platform as Exclude<Platform, 'twitter'>], '_blank', 'width=600,height=700');

    setTimeout(() => setConnecting(null), 1000);
  };

  const [disconnecting, setDisconnecting] = useState<Platform | null>(null);

  const handleDisconnect = async (platform: Platform) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      return;
    }
    
    setDisconnecting(platform);
    
    try {
      const response = await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disconnect account');
      }
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert(error instanceof Error ? error.message : 'Failed to disconnect account');
    } finally {
      setDisconnecting(null);
    }
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
              className={`p-4 rounded-lg border flex items-center gap-4 ${
                platform.enabled 
                  ? 'bg-[#18181b] border-[#27272a]/50' 
                  : 'bg-[#18181b]/50 border-[#27272a]/30 opacity-60'
              }`}
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
                  {!platform.enabled && !isConnected && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27272a] text-[#71717a]">
                      Coming Soon
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
                disabled={connecting === platform.id || disconnecting === platform.id || (!platform.enabled && !isConnected)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  isConnected
                    ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-red-500/10 hover:text-red-400'
                    : platform.enabled
                    ? 'bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/20'
                    : 'bg-[#27272a]/50 text-[#71717a] cursor-not-allowed'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {connecting === platform.id || disconnecting === platform.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isConnected ? (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Disconnect</span>
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {platform.enabled ? 'Connect' : 'Soon'}
                    </span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-[#22d3ee]/5 border border-[#22d3ee]/20">
        <p className="text-[12px] text-[#22d3ee]">
          <strong>X (Twitter) is now available!</strong> Connect your X account to start posting. 
          Facebook, Instagram, and YouTube coming soon.
        </p>
      </div>
    </div>
  );
}
