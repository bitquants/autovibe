'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Edit2, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import type { Platform, ScheduledPost } from '@/types';
import { ScheduleModal } from './ScheduleModal';

interface ScheduledPostsListProps {
  refreshTrigger?: number;
}

const PLATFORM_CONFIG: Record<Platform, { name: string; icon: typeof Facebook; color: string; bgColor: string }> = {
  twitter: { name: 'X', icon: Twitter, color: '#fafafa', bgColor: 'bg-[#fafafa]/10' },
  instagram: { name: 'IG', icon: Instagram, color: '#e4405f', bgColor: 'bg-[#e4405f]/10' },
  facebook: { name: 'FB', icon: Facebook, color: '#1877f2', bgColor: 'bg-[#1877f2]/10' },
  youtube: { name: 'YT', icon: Youtube, color: '#ff0000', bgColor: 'bg-[#ff0000]/10' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof AlertCircle; color: string; bgColor: string }> = {
  pending: { label: 'Pending', icon: Clock, color: '#22d3ee', bgColor: 'bg-[#22d3ee]/10' },
  processing: { label: 'Processing', icon: Loader2, color: '#fbbf24', bgColor: 'bg-[#fbbf24]/10' },
  published: { label: 'Published', icon: CheckCircle2, color: '#4ade80', bgColor: 'bg-[#4ade80]/10' },
  failed: { label: 'Failed', icon: XCircle, color: '#ef4444', bgColor: 'bg-red-500/10' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: '#71717a', bgColor: 'bg-[#27272a]' },
};

export function ScheduledPostsList({ refreshTrigger = 0 }: ScheduledPostsListProps) {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published'>('all');
  const [monthlyCount, setMonthlyCount] = useState(0);
  const MONTHLY_LIMIT = 30;

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/schedule');
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled posts');
      }
      const data = await response.json();
      setPosts(data.posts || []);
      
      // Calculate monthly count from pending and published posts this month
      const now = new Date();
      const currentMonthPosts = (data.posts || []).filter((post: ScheduledPost) => {
        const postDate = new Date(post.scheduled_for);
        return postDate.getMonth() === now.getMonth() && 
               postDate.getFullYear() === now.getFullYear() &&
               ['pending', 'published'].includes(post.status);
      });
      setMonthlyCount(currentMonthPosts.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async (post: Partial<ScheduledPost>) => {
    if (post.id) {
      // Update existing post
      const response = await fetch(`/api/schedule/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update post');
      }
    } else {
      // Create new post
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to schedule post');
      }
    }
    await fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (post: ScheduledPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'processing'].includes(post.status);
    if (filter === 'published') return ['published', 'failed', 'cancelled'].includes(post.status);
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#22d3ee] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Monthly Limit Indicator */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#18181b] border border-[#27272a]/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#22d3ee]" />
          <span className="text-[12px] text-[#a1a1aa]">
            Monthly Schedule Limit
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-24 h-2 bg-[#27272a] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  monthlyCount >= MONTHLY_LIMIT ? 'bg-red-500' : 'bg-[#22d3ee]'
                }`}
                style={{ width: `${Math.min((monthlyCount / MONTHLY_LIMIT) * 100, 100)}%` }}
              />
            </div>
          </div>
          <span className={`text-[12px] font-medium ${
            monthlyCount >= MONTHLY_LIMIT ? 'text-red-400' : 'text-[#fafafa]'
          }`}>
            {monthlyCount}/{MONTHLY_LIMIT}
          </span>
        </div>
      </div>
      
      {monthlyCount >= MONTHLY_LIMIT && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-[12px] text-red-400">
            You've reached the monthly limit of {MONTHLY_LIMIT} scheduled posts. 
            Upgrade your plan or wait until next month to schedule more.
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'published'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
              filter === f
                ? 'bg-[#22d3ee]/10 text-[#22d3ee]'
                : 'text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && posts.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded">
                {posts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error - Only show for actual errors, not empty state */}
      {error && !error.includes('Failed to fetch') && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-[#3f3f46] mx-auto mb-3" />
          <p className="text-[13px] text-[#71717a]">
            {filter === 'all' 
              ? 'No scheduled posts yet' 
              : `No ${filter} posts found`}
          </p>
          <p className="text-[11px] text-[#52525b] mt-1 mb-4">
            Schedule your first post now
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => window.location.href = '/generate'}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#22d3ee]/10 text-[#22d3ee] text-[12px] font-medium hover:bg-[#22d3ee]/20 transition-colors"
            >
              Generate Content
            </button>
            <button
              onClick={() => {
                // Open schedule modal via custom event
                window.dispatchEvent(new CustomEvent('openScheduleModal'));
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#27272a]/50 text-[#a1a1aa] text-[12px] font-medium hover:bg-[#27272a]/30 transition-colors"
            >
              Schedule First Post
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => {
              const platformConfig = PLATFORM_CONFIG[post.platform];
              const PlatformIcon = platformConfig.icon;
              const statusConfig = STATUS_CONFIG[post.status];
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50 hover:border-[#3f3f46] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Platform Icon */}
                    <div className={`w-10 h-10 rounded-lg ${platformConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <PlatformIcon className="w-5 h-5" style={{ color: platformConfig.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] text-[#fafafa] line-clamp-2">
                          {post.content}
                        </p>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusConfig.bgColor} flex-shrink-0`}>
                          <StatusIcon className={`w-3 h-3 ${post.status === 'processing' ? 'animate-spin' : ''}`} style={{ color: statusConfig.color }} />
                          <span className="text-[10px] font-medium" style={{ color: statusConfig.color }}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Hashtags */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <p className="text-[11px] text-[#71717a] mt-1.5">
                          {post.hashtags.slice(0, 3).join(' ')}
                          {post.hashtags.length > 3 && ` +${post.hashtags.length - 3} more`}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-[11px] text-[#71717a]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.scheduled_for)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(post.scheduled_for)}
                          </span>
                        </div>

                        {/* Actions */}
                        {post.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-1.5 rounded-md text-[#71717a] hover:text-[#22d3ee] hover:bg-[#22d3ee]/10 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              className="p-1.5 rounded-md text-[#71717a] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Error Message */}
                      {post.error_message && (
                        <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {post.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSchedule={handleSchedule}
        existingPost={editingPost}
      />
    </div>
  );
}
