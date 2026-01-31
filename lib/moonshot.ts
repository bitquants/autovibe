const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

export interface MoonshotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MoonshotResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateContent(
  messages: MoonshotMessage[],
  model: string = 'kimi-k2.5'
): Promise<string> {
  const apiKey = process.env.MOONSHOT_API_KEY;

  if (!apiKey) {
    throw new Error('MOONSHOT_API_KEY is not configured');
  }

  const response = await fetch(MOONSHOT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Moonshot API error: ${error}`);
  }

  const data: MoonshotResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

export function createPlatformPrompt(
  platform: string,
  niche: string,
  idea: string,
  platformInstructions: string
): MoonshotMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert social media content creator specializing in ${niche} content. Create engaging, platform-optimized posts that drive engagement and feel authentic to the platform's culture.`,
    },
    {
      role: 'user',
      content: `Create ${platform} content about this idea: "${idea}"

${platformInstructions}

Format your response clearly with headers and sections. Be specific and actionable.`,
    },
  ];
}

// Mock content generator for when API is unavailable
export function generateMockContent(platform: string, niche: string, idea: string): string {
  const mockContents: Record<string, string> = {
    twitter: `**OPTION 1 - Single Post:**

Just discovered the secret to ${idea.toLowerCase()}! 🚀

The key? Consistency beats perfection every single time.

Start small. Stay consistent. Watch the magic happen.

What's your biggest challenge with ${niche.toLowerCase()}? Drop a comment! 👇

#${niche.replace(/\s+/g, '')} #GrowthMindset #SuccessTips

---

**OPTION 2 - Thread:**

THREAD: The ${idea} framework that changed everything 🧵

1/5 Most people overcomplicate ${niche.toLowerCase()}. Here's the simple 3-step process that actually works:

2/5 Step 1: Identify your core value proposition
What makes YOU different? Write it down. This is your foundation.

3/5 Step 2: Create a content system
Batch create. Schedule ahead. Stop posting randomly.

4/5 Step 3: Engage authentically
Reply to every comment. Build real relationships. The algorithm rewards engagement.

5/5 The result? Sustainable growth that compounds over time.

Save this thread for later! Which step resonates most with you?

---

**Suggested Media:** Bold text graphic with key quote, or short video (< 30s) with quick tips`,

    instagram: `**PART 1 - Content Type Recommendation:**

📸 RECOMMENDED: Carousel Post (5-7 slides)

Why? This topic needs visual explanation. A carousel allows you to:
- Hook with cover image
- Break down the concept step-by-step
- End with a strong CTA
- High save/share potential

---

**PART 2 - Caption:**

Stop scrolling! This might be the ${niche} tip you needed today ✨

${idea}

I used to struggle with this too until I discovered this simple framework. Now I want to share it with you!

Save this post for when you need a reminder 📝

What's your biggest win this week? Share below! 👇

.
.
.
.
#${niche.replace(/\s+/g, '')} #ContentCreator #SocialMediaTips #EntrepreneurLife #BusinessGrowth #DigitalMarketing #SuccessMindset #MotivationDaily #InstaTips #GrowthHacking

---

**Visual Concept:** Clean, minimal design with your brand colors. Use bold typography for key points. Include your face in slide 1 for personal connection.`,

    facebook: `**PART 1 - Post Type:**

📱 RECOMMENDED: Standard text post with engaging image

This format works best for community discussion and shares.

---

**PART 2 - Content:**

Hey friends! 👋

I wanted to share something that's been on my mind lately about ${idea.toLowerCase()}.

After years in the ${niche} space, I've noticed a pattern. The people who succeed aren't necessarily the most talented - they're the most consistent. They show up every day, even when they don't feel like it.

Think about it: small actions compound over time. One post becomes ten. Ten become a hundred. And suddenly, you've built something meaningful.

So here's my question for you: What's one small action you can take TODAY to move closer to your goals? 

Drop your answer in the comments - I'd love to hear from you! And feel free to tag someone who needs to hear this message.

Let's support each other! 💙

---

**Suggested Visual:** Inspirational quote graphic or behind-the-scenes photo of your workspace`,

    youtube: `**SECTION 1 - Video Type Recommendation:**

🎥 RECOMMENDED: Standard Educational Video (8-12 minutes)

This topic needs depth and explanation. A mid-length video allows you to:
- Hook viewers in first 30 seconds
- Provide real value with examples
- Include visual demonstrations
- End with strong subscribe CTA

---

**SECTION 2 - Title Options:**

1. "The ${idea} Method That Changed My ${niche} Game Forever"
2. "How to Master ${idea} in 2024 (Step-by-Step Guide)"
3. "I Tried ${idea} for 30 Days - Here's What Happened"

---

**SECTION 3 - Description:**

🚀 In this video, I break down exactly how to implement ${idea.toLowerCase()} in your ${niche.toLowerCase()} strategy.

⏱️ TIMESTAMPS:
0:00 Intro - Why this matters
1:30 The big mistake most people make
3:45 Step 1: Setting up your foundation
5:20 Step 2: The implementation phase
7:10 Step 3: Optimization and scaling
9:30 Real examples and case studies
11:00 Final thoughts and next steps

📚 RESOURCES MENTIONED:
• [Add your resources here]
• [Tool recommendations]
• [Template downloads]

👋 LET'S CONNECT:
Subscribe and hit the notification bell so you never miss a video!

Drop a comment with your biggest takeaway - I read every single one.

#${niche.replace(/\s+/g, '')} #YouTubeTips #ContentStrategy #BusinessGrowth

---

**Thumbnail Concept:** Your face with excited expression + large text overlay showing the main benefit. Use high contrast colors (yellow/black or red/white). Include a "Before/After" visual element.`,
  };

  return mockContents[platform] || `Content for ${platform} about ${idea}`;
}
