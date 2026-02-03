'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Facebook, Twitter, Instagram, Youtube, Loader2 } from 'lucide-react';
import type { Platform, ScheduledPost } from '@/types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (post: Partial<ScheduledPost>) => Promise<void>;
  initialContent?: string;
  initialPlatform?: Platform;
  existingPost?: ScheduledPost | null;
}

const PLATFORM_CONFIG: Record<Platform, { name: string; icon: typeof Facebook; color: string }> = {
  twitter: { name: 'X (Twitter)', icon: Twitter, color: '#fafafa' },
  instagram: { name: 'Instagram', icon: Instagram, color: '#e4405f' },
  facebook: { name: 'Facebook', icon: Facebook, color: '#1877f2' },
  youtube: { name: 'YouTube', icon: Youtube, color: '#ff0000' },
};

// Only show Twitter/X in the platform selector
const AVAILABLE_PLATFORMS: Platform[] = ['twitter'];

export function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  initialContent = '',
  initialPlatform = 'twitter',
  existingPost = null,
}: ScheduleModalProps) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [content, setContent] = useState(initialContent);
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when modal opens or existingPost changes
  useEffect(() => {
    if (isOpen) {
      if (existingPost) {
        setPlatform(existingPost.platform);
        setContent(existingPost.content);
        setHashtags(existingPost.hashtags?.join(' ') || '');
        const date = new Date(existingPost.scheduled_for);
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
      } else {
        setPlatform(initialPlatform);
        setContent(initialContent);
        setHashtags('');
        // Default to today at current time + 1 hour
        const defaultDate = new Date();
        defaultDate.setHours(defaultDate.getHours() + 1);
        setScheduledDate(defaultDate.toISOString().split('T')[0]);
        setScheduledTime(defaultDate.toTimeString().slice(0, 5));
      }
      setError('');
    }
  }, [isOpen, existingPost, initialContent, initialPlatform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time');
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledFor <= new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSchedule({
        id: existingPost?.id,
        platform,
        content: content.trim(),
        hashtags: hashtags.split(/\s+/).filter(h => h.startsWith('#')),
        scheduled_for: scheduledFor.toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule post');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="bg-[#18181b] border border-[#27272a]/50 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]/50">
                <h2 className="text-[15px] font-medium text-[#fafafa]">
                  {existingPost ? 'Edit Scheduled Post' : 'Schedule Post'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Platform Selection */}
                <div>
                  <label className="block text-[12px] font-medium text-[#a1a1aa] mb-2">
                    Platform
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {AVAILABLE_PLATFORMS.map((p) => {
                      const config = PLATFORM_CONFIG[p];
                      const Icon = config.icon;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-medium transition-all ${
                            platform === p
                              ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]'
                              : 'border-[#27272a]/50 bg-[#27272a]/30 text-[#a1a1aa] hover:border-[#3f3f46]'
                          }`}
                        >
                          <Icon className="w-4 h-4" style={{ color: config.color }} />
                          {config.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-[12px] font-medium text-[#a1a1aa] mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-[#27272a]/30 border border-[#27272a]/50 rounded-lg text-[13px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#22d3ee]/50 resize-none"
                    placeholder="Write your post content..."
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[11px] text-[#71717a]">
                      {content.length} characters
                    </span>
                    {platform === 'twitter' && content.length > 280 && (
                      <span className="text-[11px] text-red-400">
                        Exceeds 280 character limit
                      </span>
                    )}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-[12px] font-medium text-[#a1a1aa] mb-2">
                    Hashtags (optional)
                  </label>
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#27272a]/30 border border-[#27272a]/50 rounded-lg text-[13px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#22d3ee]/50"
                    placeholder="#hashtag1 #hashtag2 #hashtag3"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#a1a1aa] mb-2">
                      <Calendar className="w-3.5 h-3.5 inline mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 bg-[#27272a]/30 border border-[#27272a]/50 rounded-lg text-[13px] text-[#fafafa] focus:outline-none focus:border-[#22d3ee]/50 cursor-pointer"
                    />
                    <p className="text-[10px] text-[#71717a] mt-1">
                      Schedule any future date
                    </p>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#a1a1aa] mb-2">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#27272a]/30 border border-[#27272a]/50 rounded-lg text-[13px] text-[#fafafa] focus:outline-none focus:border-[#22d3ee]/50"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-[12px] text-red-400">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#27272a]/50 text-[#a1a1aa] text-[13px] font-medium hover:bg-[#27272a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#22d3ee] text-[#09090b] text-[13px] font-medium hover:bg-[#06b6d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {existingPost ? 'Updating...' : 'Scheduling...'}
                      </>
                    ) : (
                      existingPost ? 'Update Schedule' : 'Schedule Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
