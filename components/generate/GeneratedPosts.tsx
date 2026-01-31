'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Copy, Check, Edit2, Save, ImageIcon } from 'lucide-react';
import type { Platform } from '@/types';

interface GeneratedPost {
  platform: Platform;
  content: string;
  hashtags: string[];
  image_prompt: string;
}

interface GeneratedPostsProps {
  posts: GeneratedPost[];
}

const platformIcons: Record<Platform, typeof Facebook> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

const platformNames: Record<Platform, string> = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

const platformColors: Record<Platform, string> = {
  facebook: '#1877f2',
  twitter: '#fafafa',
  instagram: '#e4405f',
  youtube: '#ff0000',
};

export function GeneratedPosts({ posts }: GeneratedPostsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (post: GeneratedPost) => {
    const id = `${post.platform}`;
    setEditingId(id);
    setEditedContent((prev) => ({
      ...prev,
      [id]: post.content,
    }));
  };

  const handleSave = (post: GeneratedPost) => {
    const id = `${post.platform}`;
    setEditingId(null);
    // Here you would save to database
  };

  return (
    <div className="grid gap-4">
      {posts.map((post, index) => {
        const Icon = platformIcons[post.platform];
        const color = platformColors[post.platform];
        const id = `${post.platform}`;
        const isEditing = editingId === id;
        const content = isEditing ? editedContent[id] || post.content : post.content;

        return (
          <motion.div
            key={post.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-[12px] font-medium text-[#fafafa]">
                  {platformNames[post.platform]}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(content, id)}
                  className="p-1.5 rounded-md text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedId === id ? (
                    <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => (isEditing ? handleSave(post) : handleEdit(post))}
                  className="p-1.5 rounded-md text-[#71717a] hover:text-[#22d3ee] hover:bg-[#22d3ee]/10 transition-colors"
                  title={isEditing ? 'Save changes' : 'Edit post'}
                >
                  {isEditing ? (
                    <Save className="w-3.5 h-3.5" />
                  ) : (
                    <Edit2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            {isEditing ? (
              <textarea
                value={editedContent[id] || post.content}
                onChange={(e) =>
                  setEditedContent((prev) => ({ ...prev, [id]: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-md bg-[#09090b] border border-[#27272a] text-[13px] text-[#fafafa] focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/20 transition-colors resize-none min-h-[120px]"
              />
            ) : (
              <div className="text-[13px] text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            )}

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-[#27272a] text-[#22d3ee]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Image Prompt */}
            {post.image_prompt && (
              <div className="mt-3 p-2.5 rounded-md bg-[#09090b] border border-[#27272a]/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <ImageIcon className="w-3 h-3 text-[#71717a]" />
                  <span className="text-[11px] text-[#71717a]">Image Prompt</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] italic">
                  {post.image_prompt}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
