'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2, Clock, CheckCircle, Copy, Check, ExternalLink, Calendar, X, FileText, ImageIcon, Hash, Coins, AlertTriangle } from 'lucide-react';
import type { Platform, GenerateResponse } from '@/types';
import { GeneratedPosts } from './GeneratedPosts';
import { CREDIT_COSTS } from '@/lib/stripe';
import { CreditInsufficientModal } from '@/components/billing/CreditInsufficientModal';

const NICHE_OPTIONS = [
  'Business',
  'Technology',
  'Fitness',
  'Health',
  'Lifestyle',
  'Fashion',
  'Food',
  'Travel',
  'Finance',
  'Education',
  'Entertainment',
  'Marketing',
  'Design',
  'Photography',
  'Other',
];

const ALL_PLATFORMS: Platform[] = ['twitter', 'instagram', 'facebook', 'youtube'];

const PLATFORM_URLS: Record<Platform, string> = {
  twitter: 'https://twitter.com/compose/tweet',
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  youtube: 'https://studio.youtube.com/',
};

interface GeneratedContent {
  id: string;
  idea: string;
  niche: string;
  createdAt: Date;
  posts: GenerateResponse['posts'];
  selectedPlatforms: Platform[];
}

interface ScheduledPost {
  id: string;
  contentId: string;
  platform: Platform;
  scheduledFor: Date;
  content: string;
}

export function GenerateForm() {
  const [idea, setIdea] = useState('');
  const [niche, setNiche] = useState('');
  const [customNiche, setCustomNiche] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([]);
  const [error, setError] = useState('');
  const [selectedPlatformsForUpload, setSelectedPlatformsForUpload] = useState<Platform[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Fetch current credits
    fetch('/api/credits/check')
      .then(res => res.json())
      .then(data => {
        if (data.credits !== undefined) {
          setCurrentCredits(data.credits);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          niche: niche === 'Other' ? customNiche : niche,
          platforms: ALL_PLATFORMS,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          setShowCreditModal(true);
          throw new Error(data.error || 'Insufficient credits. Please upgrade your plan.');
        }
        throw new Error(data.error || 'Failed to generate content');
      }

      const data: GenerateResponse = await response.json();
      
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        idea,
        niche: niche === 'Other' ? customNiche : niche,
        createdAt: new Date(),
        posts: data.posts,
        selectedPlatforms: ALL_PLATFORMS,
      };

      setGeneratedContent(newContent);
      setContentHistory((prev) => [newContent, ...prev]);
      setSelectedPlatformsForUpload([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlatformForUpload = (platform: Platform) => {
    setSelectedPlatformsForUpload((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCopy = async (content: string, platform: Platform) => {
    await navigator.clipboard.writeText(content);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleOpenPlatform = (platform: Platform) => {
    window.open(PLATFORM_URLS[platform], '_blank');
  };

  const handleSchedule = (platforms: Platform[]) => {
    if (platforms.length === 0 || !generatedContent) return;
    
    const newScheduledPosts: ScheduledPost[] = platforms.map((platform) => {
      const post = generatedContent.posts.find(p => p.platform === platform);
      return {
        id: Date.now().toString() + platform,
        contentId: generatedContent.id,
        platform,
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default: tomorrow
        content: post?.content || '',
      };
    });

    setScheduledPosts((prev) => [...prev, ...newScheduledPosts]);
    setShowScheduleModal(false);
    setSelectedPlatformsForUpload([]);
    alert(`Scheduled ${newScheduledPosts.length} posts for tomorrow!`);
  };

  const formatTime = (date: Date) => {
    if (!mounted) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    if (!mounted) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Generation Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-3 rounded-md border text-[13px] ${
              error.includes('credits')
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {error}
            {error.includes('credits') && (
              <a
                href="/settings"
                className="block mt-2 text-[12px] underline hover:text-yellow-300"
              >
                Upgrade your plan →
              </a>
            )}
          </motion.div>
        )}

        {/* Idea Input */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[#a1a1aa]">
            Content Idea
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your content idea..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-[13px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/20 transition-colors resize-none"
            required
          />
          <div className="flex justify-end">
            <span className="text-[11px] text-[#52525b]">{idea.length}/500</span>
          </div>
        </div>

        {/* Niche Selection */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[#a1a1aa]">
            Niche/Industry
          </label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-[13px] text-[#fafafa] focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/20 transition-colors appearance-none cursor-pointer"
            required
          >
            <option value="">Select a niche...</option>
            {NICHE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Niche Input */}
        <AnimatePresence>
          {niche === 'Other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <label className="text-[12px] font-medium text-[#a1a1aa]">
                Custom Niche
              </label>
              <input
                type="text"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                placeholder="Enter your niche..."
                className="w-full px-3 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-[13px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/20 transition-colors"
                required={niche === 'Other'}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credit Cost Info Box */}
        <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] text-[#a1a1aa]">
                We'll generate content optimized for <span className="text-cyan-400 font-medium">all platforms</span> (Twitter, Instagram, Facebook, YouTube). 
                After generation, you can copy and post to each platform.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#27272a] border border-[#3f3f46]">
              <Coins className="w-4 h-4 text-cyan-400" />
              <span className="text-[13px] font-medium text-[#fafafa]">{CREDIT_COSTS.perGeneration}</span>
              <span className="text-[11px] text-[#71717a]">credit</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating || !idea || !niche}
          className="w-full py-3 px-4 rounded-md bg-[#22d3ee] text-[#09090b] font-medium text-[13px] hover:bg-[#67e8f9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Content for All Platforms
            </>
          )}
        </button>
      </form>

      {/* Current Generation Results */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Content Info Header */}
            <div className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-medium text-[#fafafa]">Generated Content</h3>
                <span className="text-[11px] text-[#71717a] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(generatedContent.createdAt)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#71717a] uppercase tracking-wider">Idea:</span>
                  <span className="text-[13px] text-[#a1a1aa]">{generatedContent.idea}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#71717a] uppercase tracking-wider">Niche:</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
                    {generatedContent.niche}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#71717a] uppercase tracking-wider">Platforms:</span>
                  <span className="text-[13px] text-[#a1a1aa]">{generatedContent.posts.length} generated</span>
                </div>
              </div>

              {/* Platform Selection for Actions */}
              <div className="mt-4 pt-4 border-t border-[#27272a]/50">
                <p className="text-[12px] font-medium text-[#a1a1aa] mb-3">
                  Select platforms to post:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ALL_PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatformsForUpload.includes(platform);
                    const hasContent = generatedContent.posts.some(p => p.platform === platform);
                    
                    return (
                      <button
                        key={platform}
                        onClick={() => hasContent && togglePlatformForUpload(platform)}
                        disabled={!hasContent}
                        className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                          isSelected
                            ? 'bg-cyan-400 text-[#09090b]'
                            : hasContent
                            ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                            : 'bg-[#18181b] text-[#52525b] cursor-not-allowed'
                        }`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        {isSelected && <CheckCircle className="w-3 h-3 inline ml-1" />}
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    disabled={selectedPlatformsForUpload.length === 0}
                    className="py-2.5 px-4 rounded-md bg-[#27272a] text-[#a1a1aa] font-medium text-[13px] hover:bg-[#3f3f46] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule ({selectedPlatformsForUpload.length})
                  </button>
                  <button
                    onClick={() => {
                      selectedPlatformsForUpload.forEach(platform => {
                        const post = generatedContent.posts.find(p => p.platform === platform);
                        if (post) {
                          handleCopy(post.content, platform);
                          setTimeout(() => handleOpenPlatform(platform), 500);
                        }
                      });
                    }}
                    disabled={selectedPlatformsForUpload.length === 0}
                    className="py-2.5 px-4 rounded-md bg-cyan-400 text-[#09090b] font-medium text-[13px] hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copy & Open ({selectedPlatformsForUpload.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Posts with Copy/Open Buttons */}
            <div className="space-y-4">
              {generatedContent.posts.map((post, index) => (
                <motion.div
                  key={post.platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50"
                >
                  {/* Platform Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#fafafa] capitalize">
                        {post.platform}
                      </span>
                      {post.mediaSuggestion && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">
                          Mock Content
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(post.content, post.platform)}
                        className="p-2 rounded-md bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] transition-colors flex items-center gap-1.5 text-[12px]"
                      >
                        {copiedPlatform === post.platform ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenPlatform(post.platform)}
                        className="p-2 rounded-md bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-colors flex items-center gap-1.5 text-[12px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-3 rounded-md bg-[#09090b] border border-[#27272a]/30">
                    <pre className="text-[13px] text-[#a1a1aa] whitespace-pre-wrap font-sans">
                      {post.content}
                    </pre>
                  </div>

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
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content History */}
      {contentHistory.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#27272a]/50">
          <h3 className="text-[14px] font-medium text-[#fafafa] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#71717a]" />
            Recent Generations ({contentHistory.length})
          </h3>
          <div className="space-y-3">
            {contentHistory.slice(0, 5).map((content) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-[#18181b]/50 border border-[#27272a]/30 hover:border-[#27272a] transition-colors cursor-pointer"
                onClick={() => {
                  setGeneratedContent(content);
                  setSelectedPlatformsForUpload([]);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#fafafa] truncate">{content.idea}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">
                        {content.niche}
                      </span>
                      <span className="text-[11px] text-[#71717a]">
                        {content.posts.length} platforms
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#52525b] ml-4">
                    {formatTime(content.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Posts Section */}
      {scheduledPosts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#27272a]/50">
          <h3 className="text-[14px] font-medium text-[#fafafa] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Scheduled Posts ({scheduledPosts.length})
          </h3>
          <div className="space-y-2">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="p-3 rounded-lg bg-[#18181b]/50 border border-[#27272a]/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-medium text-[#fafafa] capitalize">
                    {post.platform}
                  </span>
                  <span className="text-[11px] text-[#71717a]">
                    {formatDate(post.scheduledFor)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleCopy(post.content, post.platform);
                    handleOpenPlatform(post.platform);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Post Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl bg-[#18181b] border border-[#27272a]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-medium text-[#fafafa]">Schedule Posts</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-1 rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-[13px] text-[#a1a1aa] mb-4">
                You're scheduling content for:
              </p>
              
              <div className="space-y-2 mb-6">
                {selectedPlatformsForUpload.map((platform) => (
                  <div key={platform} className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[#fafafa] capitalize">
                        {platform}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[12px] text-[#71717a] mb-4">
                Posts will be scheduled for tomorrow. You'll get a reminder to copy and paste the content.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#27272a] text-[#a1a1aa] font-medium text-[13px] hover:bg-[#3f3f46] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSchedule(selectedPlatformsForUpload)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-400 text-[#09090b] font-medium text-[13px] hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credit Insufficient Modal */}
      <CreditInsufficientModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        currentCredits={currentCredits}
      />
    </div>
  );
}
