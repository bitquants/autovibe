export type Platform = 'facebook' | 'twitter' | 'instagram' | 'youtube';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: Platform;
  account_name: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  platform_user_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentIdea {
  id: string;
  user_id: string;
  idea: string;
  niche: string;
  created_at: string;
}

export interface GeneratedPost {
  id: string;
  idea_id: string;
  platform: Platform;
  content: string;
  contentType?: string;
  hashtags: string[];
  image_prompt: string | null;
  mediaSuggestion?: string;
  status: 'draft' | 'edited' | 'posted' | 'scheduled';
  created_at: string;
  updated_at: string;
}

export interface GenerateRequest {
  idea: string;
  niche: string;
  platforms: Platform[];
}

export interface GenerateResponse {
  posts: {
    platform: Platform;
    content: string;
    contentType?: string;
    hashtags: string[];
    image_prompt: string;
    mediaSuggestion?: string;
  }[];
}

export const PLATFORM_CONFIG: Record<Platform, { name: string; color: string; icon: string }> = {
  facebook: { name: 'Facebook', color: '#1877f2', icon: 'Facebook' },
  twitter: { name: 'X (Twitter)', color: '#000000', icon: 'Twitter' },
  instagram: { name: 'Instagram', color: '#e4405f', icon: 'Instagram' },
  youtube: { name: 'YouTube', color: '#ff0000', icon: 'Youtube' },
};

export const PLATFORM_PROMPTS: Record<Platform, string> = {
  twitter: `Create content for X (Twitter) with TWO options:

OPTION 1 - Single Post:
- Under 280 characters, punchy and direct
- Strong hook in first 2-3 words
- 2-3 relevant hashtags
- Clear call-to-action

OPTION 2 - Thread (if the idea needs more depth):
- Start with "THREAD:" followed by a compelling hook tweet
- Number each tweet (1/5, 2/5, etc.)
- Each tweet under 280 characters
- Progressive revelation - build curiosity
- End with a summary tweet and CTA

Also suggest: What type of image/media would work best with this post?`,

  instagram: `Create Instagram content with TWO parts:

PART 1 - Content Type Recommendation:
Suggest whether this should be:
- Single Image Post
- Carousel/Multi-image Post  
- Reel (short-form video)
- Story
- IGTV/Long-form video

Explain WHY this format fits the content.

PART 2 - Caption:
- Hook in the first line (attention-grabbing)
- Use emojis naturally throughout
- Line breaks for scannability
- 10-15 relevant hashtags (mix popular + niche)
- Clear call-to-action (save, share, comment, etc.)
- Suggest visual style/mood for the image/video

Also include: Specific image/video concept suggestion`,

  facebook: `Create Facebook content with TWO parts:

PART 1 - Post Type:
Recommend the best format:
- Standard text post with image
- Video post
- Link preview post
- Poll/Question post
- Live video announcement

PART 2 - Content:
- 2-3 paragraphs, conversational tone
- Focus on community engagement
- Ask an engaging question at the end
- 0-2 hashtags max
- Warm, personal voice
- Encourage comments and shares

Also suggest: What visual would accompany this post best?`,

  youtube: `Create YouTube content with THREE sections:

SECTION 1 - Video Type Recommendation:
Suggest the best format:
- Standard video (educational/tutorial)
- Short (under 60 seconds)
- Live stream
- Premiere
- Community post (if text-only)

SECTION 2 - Title Options (provide 3):
- SEO-optimized titles with keywords
- Click-worthy but not clickbait
- Include power words

SECTION 3 - Description:
- Attention-grabbing first 2 lines
- 3-5 chapter timestamps (suggest format: 00:00 Intro, etc.)
- Links section placeholder
- SEO keywords naturally integrated
- Subscribe and notification bell CTA
- 3-5 relevant hashtags

Also include: Thumbnail concept suggestion`,
};
