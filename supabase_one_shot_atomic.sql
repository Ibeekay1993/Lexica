-- ==========================================
-- TWEETFORGE PRO: THE ONE-SHOT ATOMIC FIX
-- ==========================================

DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users manage settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users manage own tweets" ON public.tweets;
DROP POLICY IF EXISTS "Users manage tweets" ON public.tweets;
DROP POLICY IF EXISTS "Users manage own schedules" ON public.scheduled_tweets;
DROP POLICY IF EXISTS "Users manage schedules" ON public.scheduled_tweets;

ALTER TABLE public.tweets DROP CONSTRAINT IF EXISTS tweets_user_id_fkey;
ALTER TABLE public.scheduled_tweets DROP CONSTRAINT IF EXISTS scheduled_tweets_user_id_fkey;
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        ALTER TABLE public.scheduled_tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        ALTER TABLE public.user_settings ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Types already correct or converted.';
    END;
END $$;

ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tweets ADD CONSTRAINT tweets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.scheduled_tweets ADD CONSTRAINT scheduled_tweets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tweets" ON public.tweets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own schedules" ON public.scheduled_tweets FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON public.user_settings TO anon, authenticated;
GRANT ALL ON public.tweets TO anon, authenticated;
GRANT ALL ON public.scheduled_tweets TO anon, authenticated;
