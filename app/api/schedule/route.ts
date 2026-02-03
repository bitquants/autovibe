import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/schedule - Get scheduled posts for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    let query = supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true })
      .limit(limit);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: posts, error } = await query;
    
    if (error) {
      console.error('Error fetching scheduled posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error in schedule API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get monthly scheduled posts count
async function getMonthlyScheduledPostsCount(supabase: any, userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  
  const { count, error } = await supabase
    .from('scheduled_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('scheduled_for', startOfMonth)
    .lte('scheduled_for', endOfMonth)
    .in('status', ['pending', 'published']);
  
  if (error) {
    console.error('Error counting scheduled posts:', error);
    return 0;
  }
  
  return count || 0;
}

// POST /api/schedule - Create a new scheduled post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { platform, content, hashtags, media_url, scheduled_for } = body;
    
    // Validate required fields
    if (!platform || !content || !scheduled_for) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, content, scheduled_for' },
        { status: 400 }
      );
    }
    
    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduled_for);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }
    
    // Note: No maximum date limit - users can schedule as far in advance as needed
    
    // Check monthly limit (30 posts per month)
    const monthlyCount = await getMonthlyScheduledPostsCount(supabase, user.id);
    const MONTHLY_LIMIT = 30;
    
    if (monthlyCount >= MONTHLY_LIMIT) {
      return NextResponse.json(
        { error: `You have reached the monthly limit of ${MONTHLY_LIMIT} scheduled posts. Please upgrade your plan or wait until next month.` },
        { status: 403 }
      );
    }
    
    // Create scheduled post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        platform,
        content,
        hashtags: hashtags || [],
        media_url,
        scheduled_for: scheduled_for,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating scheduled post:', error);
      return NextResponse.json(
        { error: 'Failed to create scheduled post' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error in schedule API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
