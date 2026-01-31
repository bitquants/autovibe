'use client';

import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Check } from 'lucide-react';
import type { Platform } from '@/types';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onToggle: (platform: Platform) => void;
}

const PLATFORMS: { id: Platform; name: string; icon: typeof Facebook; color: string }[] = [
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#fafafa' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#e4405f' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877f2' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#ff0000' },
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
            onClick={() => onToggle(platform.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-3 rounded-md border text-left transition-all ${
              isSelected
                ? 'bg-[#22d3ee]/10 border-[#22d3ee]/50'
                : 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]'
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
