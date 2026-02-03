'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Sparkles, FileText, Hash } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RecentIdea {
  id: string;
  idea: string;
  niche: string;
  created_at: string;
  generated_posts?: { count: number }[];
}

interface RecentIdeasProps {
  ideas: RecentIdea[];
}

export function RecentIdeas({ ideas }: RecentIdeasProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (date: string) => {
    if (!mounted) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    if (!mounted) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-5 rounded-lg bg-[#18181b] border border-[#27272a]/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-[13px] font-medium text-[#fafafa]">Recent Generations</h2>
        </div>
        <Link
          href="/history"
          className="text-[12px] text-[#71717a] hover:text-[#22d3ee] transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-[#27272a] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-5 h-5 text-[#52525b]" />
          </div>
          <p className="text-[13px] text-[#71717a]">No content generated yet</p>
          <p className="text-[12px] text-[#52525b] mt-1">
            Start by generating your first content idea
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-1.5 mt-3 text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Generate Content
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-3 rounded-md bg-[#09090b] border border-[#27272a]/30 hover:border-[#27272a] transition-colors group cursor-pointer"
            >
              <p className="text-[13px] text-[#fafafa] line-clamp-2 group-hover:text-cyan-400 transition-colors">
                {idea.idea}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
                  {idea.niche}
                </span>
                <span className="text-[11px] text-[#52525b] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(idea.created_at)} at {formatTime(idea.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#27272a]/30">
                <span className="text-[11px] text-[#71717a] flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {idea.generated_posts?.[0]?.count || 4} posts
                </span>
                <span className="text-[11px] text-[#71717a] flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Generated
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
