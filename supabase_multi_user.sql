-- TWEETFORGE PRO: MULTI-USER EMPIRE UPGRADE
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create User Settings Table (For Persistence)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_generate BOOLEAN DEFAULT true,
  notifications BOOLEAN DEFAULT false,
  frequency INTEGER DEFAULT 60,
  twitter_handle TEXT,
  target_niche TEXT DEFAULT 'Tech & Motivation',
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Link Tweets to Users
ALTER TABLE tweets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Link Influencers to Users
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security (PROTECT USER DATA)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

-- 5. Create Security Policies (Users only see THEIR OWN data)
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tweets" ON tweets
  FOR ALL USING (auth.uid() = user_id);

-- 6. Trigger to create settings on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
