-- ==========================================
-- TWEETFORGE PRO: THE ULTIMATE MASTER SCRIPT
-- ==========================================

-- 1. TABLES SETUP
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_generate BOOLEAN DEFAULT true,
    notifications BOOLEAN DEFAULT false,
    frequency INTEGER DEFAULT 60,
    twitter_handle TEXT,
    target_niche TEXT DEFAULT 'Viral Tech',
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    tags TEXT[],
    status TEXT DEFAULT 'queued',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scheduled_tweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SECURITY (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tweets ENABLE ROW LEVEL SECURITY;

-- 3. SMART POLICY CREATION
DO $$ 
BEGIN
    -- User Settings Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own settings') THEN
        CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Tweets Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own tweets') THEN
        CREATE POLICY "Users manage own tweets" ON public.tweets FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Scheduled Tweets Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own schedules') THEN
        CREATE POLICY "Users manage own schedules" ON public.scheduled_tweets FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. AUTO-SETTING GENERATOR (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. FINAL UNLOCK
GRANT ALL ON public.user_settings TO anon, authenticated;
GRANT ALL ON public.tweets TO anon, authenticated;
GRANT ALL ON public.scheduled_tweets TO anon, authenticated;
