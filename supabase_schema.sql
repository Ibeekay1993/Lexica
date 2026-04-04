-- 1. Tweets table
CREATE TABLE IF NOT EXISTS public.tweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    tags TEXT[],
    status TEXT DEFAULT 'queued',
    created_at TIMESTAMPTZ DEFAULT now(),
    tweet_id TEXT,
    user_id TEXT
);

-- 2. User Sessions table (for OAuth tokens)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    user_id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    user_data JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Scheduled Tweets table
CREATE TABLE IF NOT EXISTS public.scheduled_tweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    user_id TEXT REFERENCES public.user_sessions(user_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Temp Verifiers (for OAuth flow)
CREATE TABLE IF NOT EXISTS public.temp_verifiers (
    state TEXT PRIMARY KEY,
    verifier TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Influencers table
CREATE TABLE IF NOT EXISTS public.influencers (
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Settings table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initial Influencers
INSERT INTO public.influencers (handle, name) VALUES 
('john322226', 'Lobistar'),
('DamiForeign', 'Dami Foreign'),
('Wizarab', 'Wizarab'),
('DrOlufunmilayo', 'Dr Olufunmilayo'),
('DavidHundeyin', 'David Hundeyin'),
('DanielRegha', 'Daniel Regha'),
('korty_eo', 'Korty EO'),
('SympLySimi', 'Simi'),
('burnaboy', 'Burna Boy'),
('wizkidayo', 'Wizkid'),
('temsbaby', 'Tems'),
('asakemusik', 'Asake'),
('FisayoSushi', 'Fisayo Sushi'),
('lindaikeji', 'Linda Ikeji'),
('instablog9ja', 'Instablog9ja'),
('channelstv', 'Channels TV'),
('yabaleftonline', 'YabaLeftOnline'),
('Postsubman', 'Postsubman'),
('OloriSupergal', 'Olori Supergal'),
('bellanaija', 'BellaNaija'),
('PulseNigeria247', 'Pulse Nigeria'),
('MobilePunch', 'Punch Newspapers'),
('vanguardnews', 'Vanguard News'),
('TheNationNews', 'The Nation'),
('DailyPostNGR', 'Daily Post Nigeria')
ON CONFLICT (handle) DO NOTHING;
