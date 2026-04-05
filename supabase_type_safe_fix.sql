-- ==========================================
-- TWEETFORGE PRO: TYPE-SAFE MASTER SCRIPT
-- ==========================================

-- 1. FIX COLUMN TYPES
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='user_id' AND data_type='text') THEN
        ALTER TABLE public.user_settings ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tweets' AND column_name='user_id' AND data_type='text') THEN
        ALTER TABLE public.tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scheduled_tweets' AND column_name='user_id' AND data_type='text') THEN
        ALTER TABLE public.scheduled_tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

-- 2. RESET POLICIES
DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users manage own tweets" ON public.tweets;
DROP POLICY IF EXISTS "Users manage own schedules" ON public.scheduled_tweets;

-- 3. APPLY TYPE-SAFE POLICIES
CREATE POLICY "Users manage own settings" ON public.user_settings 
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users manage own tweets" ON public.tweets 
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users manage own schedules" ON public.scheduled_tweets 
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 4. FINAL PERMISSIONS UNLOCK
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tweets ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.user_settings TO anon, authenticated;
GRANT ALL ON public.tweets TO anon, authenticated;
GRANT ALL ON public.scheduled_tweets TO anon, authenticated;
