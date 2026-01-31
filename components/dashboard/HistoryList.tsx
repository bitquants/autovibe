'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, FileText } from 'lucide-react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import type { ContentIdea, GeneratedPost, Platform } from '@/types';

interface IdeaWithPosts extends ContentIdea {
  generated_posts: GeneratedPost[];
}

interface HistoryListProps {
  ideas: IdeaWithPosts[];
}

const platformIcons: Record<Platform, typeof Facebook> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

const platformNames: Record<Platform, string> = {
  facebook: 'Facebook',
  twitter: 'X',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

export function HistoryList({ ideas }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (ideas.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 rounded-lg bg-[#27272a] flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-[#52525b]" />
        </div>
        <h3 className="text-[14px] font-medium text-[#a1a1aa]">No history yet</h3>
        <p className="text-[13px] text-[#52525b] mt-1">
          Start generating content to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea, index) => {
        const isExpanded = expandedId === idea.id;
        const postsCount = idea.generated_posts?.length || 0;

        return (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg bg-[#18181b] border border-[#27272a]/50 overflow-hidden"
          >
            {/* Header - Always visible */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : idea.id)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-[#27272a]/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#fafafa] line-clamp-1">{idea.idea}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#27272a] text-[#a1a1aa]">
                    {idea.niche}
                  </span>
                  <span className="text-[11px] text-[#52525b] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(idea.created_at)} at {formatTime(idea.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#71717a]">
                  {postsCount} {postsCount === 1 ? 'post' : 'posts'}
                </span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-[#71717a]" />
                </motion.div>
              </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && idea.generated_posts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#27272a]/50"
                >
                  <div className="p-4 space-y-3">
                    {idea.generated_posts.map((post) => {
                      const Icon = platformIcons[post.platform as Platform];

                      return (
                        <div
                          key={post.id}
                          className="p-3 rounded-md bg-[#09090b] border border-[#27272a]/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-3.5 h-3.5 text-[#71717a]" />
                            <span className="text-[11px] text-[#71717a] capitalize">
                              {platformNames[post.platform as Platform]}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                post.status === 'posted'
                                  ? 'bg-[#4ade80]/10 text-[#4ade80]'
                                  : post.status === 'edited'
                                  ? 'bg-[#fbbf24]/10 text-[#fbbf24]'
                                  : 'bg-[#71717a]/10 text-[#71717a]'
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#a1a1aa] whitespace-pre-wrap line-clamp-3">
                            {post.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
