-- ==========================================
-- TWEETFORGE PRO: SURGICAL TYPE FIX
-- ==========================================

ALTER TABLE public.tweets DROP CONSTRAINT IF EXISTS tweets_user_id_fkey;
ALTER TABLE public.scheduled_tweets DROP CONSTRAINT IF EXISTS scheduled_tweets_user_id_fkey;
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tweets' AND column_name='user_id') THEN
        ALTER TABLE public.tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scheduled_tweets' AND column_name='user_id') THEN
        ALTER TABLE public.scheduled_tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='user_id') THEN
        ALTER TABLE public.user_settings ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    END IF;
END $$;

ALTER TABLE public.tweets 
  ADD CONSTRAINT tweets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.scheduled_tweets 
  ADD CONSTRAINT scheduled_tweets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_settings 
  ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users manage own tweets" ON public.tweets;
DROP POLICY IF EXISTS "Users manage own schedules" ON public.scheduled_tweets;

CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tweets" ON public.tweets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own schedules" ON public.scheduled_tweets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tweets ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.user_settings TO anon, authenticated;
GRANT ALL ON public.tweets TO anon, authenticated;
GRANT ALL ON public.scheduled_tweets TO anon, authenticated;
