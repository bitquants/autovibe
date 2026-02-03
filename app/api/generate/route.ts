import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent, createPlatformPrompt, generateMockContent } from '@/lib/moonshot';
import { PLATFORM_PROMPTS, type Platform, type GenerateResponse } from '@/types';
import { CREDIT_COSTS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { idea, niche, platforms } = body as { idea: string; niche: string; platforms: Platform[] };

    if (!idea || !niche || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure user has a profile before checking credits
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile with default credits
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          credits: 500,
          subscription_tier: 'free',
          subscription_status: 'inactive',
        });

      if (createError) {
        console.error('Failed to create profile:', createError);
        return NextResponse.json(
          { error: 'Failed to initialize user profile' },
          { status: 500 }
        );
      }
    }

    // Check and deduct credits
    const { data: hasCredits, error: creditsError } = await supabase.rpc(
      'deduct_credits',
      {
        p_user_id: user.id,
        p_amount: CREDIT_COSTS.perGeneration,
        p_description: `Generated content for: ${idea.substring(0, 50)}...`,
      }
    );

    if (creditsError || !hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Generate a unique ID for this idea (in-memory storage as fallback)
    const ideaId = crypto.randomUUID();
    let ideaData = { id: ideaId, idea, niche, user_id: user.id };

    // Try to save the content idea to database
    try {
      const { data: savedIdea, error: ideaError } = await supabase
        .from('content_ideas')
        .insert({
          user_id: user.id,
          idea,
          niche,
        })
        .select()
        .single();

      if (!ideaError && savedIdea) {
        ideaData = savedIdea;
      } else {
        console.warn('Database save failed, using in-memory storage:', ideaError);
      }
    } catch (dbError) {
      console.warn('Database error, continuing with in-memory storage:', dbError);
    }

    // Generate content for each platform
    const generatedPosts: GenerateResponse['posts'] = [];

    for (const platform of platforms) {
      try {
        let content: string;
        let useMockData = false;

        // Try to use real AI generation first
        try {
          const messages = createPlatformPrompt(
            platform,
            niche,
            idea,
            PLATFORM_PROMPTS[platform]
          );
          content = await generateContent(messages);
        } catch (apiError) {
          console.warn(`API failed for ${platform}, using mock data:`, apiError);
          content = generateMockContent(platform, niche, idea);
          useMockData = true;
        }

        // Extract hashtags from the content
        const hashtagRegex = /#\w+/g;
        const hashtags = content.match(hashtagRegex)?.map(tag => tag.slice(1)) || [];

        // Clean content by removing hashtags for storage
        const cleanContent = content.replace(hashtagRegex, '').trim();

        // Generate image prompt
        let imagePrompt: string;
        try {
          const imagePromptMessages = [
            {
              role: 'system' as const,
              content: `You are an expert at creating image generation prompts. Create a detailed, vivid prompt for an image that would accompany social media content about ${niche}.`,
            },
            {
              role: 'user' as const,
              content: `Create a concise image generation prompt (max 100 words) for this content idea: "${idea}" for ${platform}. Focus on visual elements, style, mood, and composition. Return ONLY the prompt, no explanations.`,
            },
          ];
          imagePrompt = await generateContent(imagePromptMessages);
        } catch (imgError) {
          // Fallback image prompts for each platform
          const fallbackPrompts: Record<Platform, string> = {
            twitter: `A bold, eye-catching graphic with the text "${idea.substring(0, 30)}..." in modern typography, vibrant colors, professional design, high contrast, social media optimized, 16:9 aspect ratio`,
            instagram: `Aesthetic Instagram-style image featuring ${niche} theme, warm lighting, professional photography style, clean composition, engaging visual, square format, lifestyle aesthetic`,
            facebook: `Engaging Facebook post image showing ${niche} concept, friendly and approachable style, community-focused visual, professional but warm, landscape orientation`,
            youtube: `YouTube thumbnail design with bold text "${idea.substring(0, 25)}...", high contrast colors, excited face expression, professional graphic design, 16:9 aspect ratio, click-worthy`,
          };
          imagePrompt = fallbackPrompts[platform];
        }

        // Try to save generated post to database (optional)
        try {
          await supabase
            .from('generated_posts')
            .insert({
              idea_id: ideaData.id,
              platform,
              content: cleanContent,
              hashtags,
              image_prompt: imagePrompt.trim(),
              status: 'draft',
            });
        } catch (postError) {
          console.warn('Failed to save post to database (non-critical):', postError);
        }

        generatedPosts.push({
          platform,
          content: cleanContent,
          hashtags,
          image_prompt: imagePrompt.trim(),
          mediaSuggestion: useMockData ? 'Mock content (API unavailable)' : undefined,
        });
      } catch (error) {
        console.error(`Error generating content for ${platform}:`, error);
        // Continue with other platforms even if one fails
      }
    }

    return NextResponse.json({ posts: generatedPosts });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
