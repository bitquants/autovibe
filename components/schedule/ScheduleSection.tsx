'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';
import { ScheduledPostsList } from './ScheduledPostsList';
import { ScheduleModal } from './ScheduleModal';
import type { ScheduledPost } from '@/types';

export function ScheduleSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const MONTHLY_LIMIT = 30;

  // Fetch monthly count on mount
  useEffect(() => {
    fetchMonthlyCount();
    
    // Listen for custom event to open modal from child components
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openScheduleModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openScheduleModal', handleOpenModal);
    };
  }, []);

  const fetchMonthlyCount = async () => {
    try {
      const response = await fetch('/api/schedule');
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const currentMonthPosts = (data.posts || []).filter((post: ScheduledPost) => {
          const postDate = new Date(post.scheduled_for);
          return postDate.getMonth() === now.getMonth() && 
                 postDate.getFullYear() === now.getFullYear() &&
                 ['pending', 'published'].includes(post.status);
        });
        setMonthlyCount(currentMonthPosts.length);
      }
    } catch (error) {
      console.error('Error fetching monthly count:', error);
    }
  };

  const handleSchedule = async (post: Partial<ScheduledPost>) => {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to schedule post');
    }
    
    // Trigger refresh of the list
    setRefreshTrigger(prev => prev + 1);
    fetchMonthlyCount();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#09090b] border border-[#27272a]/50 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#22d3ee]/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#22d3ee]" />
          </div>
          <div>
            <h2 className="text-[14px] font-medium text-[#fafafa]">Content Schedule</h2>
            <p className="text-[12px] text-[#71717a]">Manage your posting queue</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={monthlyCount >= MONTHLY_LIMIT}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22d3ee]/10 text-[#22d3ee] text-[12px] font-medium hover:bg-[#22d3ee]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={monthlyCount >= MONTHLY_LIMIT ? 'Monthly limit reached' : 'Schedule a new post'}
        >
          <Plus className="w-3.5 h-3.5" />
          New Post
          <span className="text-[10px] opacity-70">
            ({monthlyCount}/{MONTHLY_LIMIT})
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <ScheduledPostsList refreshTrigger={refreshTrigger} />
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSchedule={handleSchedule}
      />
    </motion.div>
  );
}
