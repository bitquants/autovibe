'use client';

import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Check } from 'lucide-react';
import type { Platform } from '@/types';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onToggle: (platform: Platform) => void;
}

// Only Twitter/X is available - others are hidden for now
const PLATFORMS: { id: Platform; name: string; icon: typeof Facebook; color: string; enabled: boolean }[] = [
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#fafafa', enabled: true },
];

export function PlatformSelector({
  selectedPlatforms,
  onToggle,
}: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PLATFORMS.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform.id);
        const Icon = platform.icon;

        return (
          <motion.button
            key={platform.id}
            type="button"
            onClick={() => platform.enabled && onToggle(platform.id)}
            whileHover={platform.enabled ? { scale: 1.02 } : {}}
            whileTap={platform.enabled ? { scale: 0.98 } : {}}
            disabled={!platform.enabled}
            className={`relative p-3 rounded-md border text-left transition-all ${
              isSelected
                ? 'bg-[#22d3ee]/10 border-[#22d3ee]/50'
                : platform.enabled
                ? 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
                : 'bg-[#18181b]/50 border-[#27272a]/50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${platform.color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: platform.color }} />
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-4 h-4 rounded-full bg-[#22d3ee] flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-[#09090b]" />
                </motion.div>
              )}
            </div>
            <p className="mt-2 text-[11px] font-medium text-[#fafafa]">
              {platform.name}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
