
-- 7. User Settings table (The Dashboard Brain)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    twitter_handle TEXT,
    auto_generate BOOLEAN DEFAULT true,
    notifications BOOLEAN DEFAULT false,
    frequency INTEGER DEFAULT 60,
    last_sync TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own settings' AND tablename = 'user_settings') THEN
        CREATE POLICY "Users manage own settings" ON public.user_settings 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8. Fix existing tables if needed
DO $$ 
BEGIN
    -- Ensure tweets.user_id is UUID for proper Auth integration
    BEGIN
        ALTER TABLE public.tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not convert tweets.user_id to UUID, skipping...';
    END;

    -- Ensure scheduled_tweets.user_id is UUID
    BEGIN
        ALTER TABLE public.scheduled_tweets ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not convert scheduled_tweets.user_id to UUID, skipping...';
    END;
END $$;
