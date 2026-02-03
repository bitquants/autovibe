-- Migration: Add scheduled posts table for content queue
-- Created: 2026-02-01

-- Scheduled posts table
CREATE TABLE scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'youtube')),
  content TEXT NOT NULL,
  hashtags TEXT[],
  media_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
  error_message TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  platform_post_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX idx_scheduled_posts_user_status ON scheduled_posts(user_id, status);
CREATE INDEX idx_scheduled_posts_pending ON scheduled_posts(status, scheduled_for) WHERE status = 'pending';

-- Row Level Security
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Users can view their own scheduled posts
CREATE POLICY "Users can view own scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scheduled posts
CREATE POLICY "Users can insert own scheduled posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scheduled posts
CREATE POLICY "Users can update own scheduled posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own scheduled posts
CREATE POLICY "Users can delete own scheduled posts"
  ON scheduled_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON scheduled_posts TO authenticated;
GRANT ALL ON scheduled_posts TO service_role;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduled_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_scheduled_posts_updated_at();

-- Function to get upcoming scheduled posts for a user
CREATE OR REPLACE FUNCTION get_upcoming_posts(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  platform TEXT,
  content TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.platform,
    LEFT(sp.content, 100) || CASE WHEN LENGTH(sp.content) > 100 THEN '...' ELSE '' END as content,
    sp.scheduled_for,
    sp.status
  FROM scheduled_posts sp
  WHERE sp.user_id = p_user_id
    AND sp.status IN ('pending', 'processing')
    AND sp.scheduled_for > NOW()
  ORDER BY sp.scheduled_for ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_upcoming_posts(UUID, INTEGER) TO authenticated;
