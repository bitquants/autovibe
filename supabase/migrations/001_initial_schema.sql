-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Connected social accounts
CREATE TABLE social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'youtube')),
  account_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content ideas storage
CREATE TABLE content_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  idea TEXT NOT NULL,
  niche TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated posts
CREATE TABLE generated_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES content_ideas(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[],
  image_prompt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'edited', 'posted', 'scheduled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_content_ideas_user_id ON content_ideas(user_id);
CREATE INDEX idx_generated_posts_idea_id ON generated_posts(idea_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Social accounts policies
CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Content ideas policies
CREATE POLICY "Users can view own content ideas"
  ON content_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content ideas"
  ON content_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content ideas"
  ON content_ideas FOR DELETE
  USING (auth.uid() = user_id);

-- Generated posts policies
CREATE POLICY "Users can view own generated posts"
  ON generated_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content_ideas
      WHERE content_ideas.id = generated_posts.idea_id
      AND content_ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own generated posts"
  ON generated_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_ideas
      WHERE content_ideas.id = generated_posts.idea_id
      AND content_ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own generated posts"
  ON generated_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM content_ideas
      WHERE content_ideas.id = generated_posts.idea_id
      AND content_ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own generated posts"
  ON generated_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM content_ideas
      WHERE content_ideas.id = generated_posts.idea_id
      AND content_ideas.user_id = auth.uid()
    )
  );
