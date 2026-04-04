import express from 'express';
import cors from 'cors';
import { TwitterApi } from 'twitter-api-v2';
import nodeCron from 'node-cron';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== AUTH ROUTES ====================

const CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3001/auth/callback';

app.get('/auth/twitter', async (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Twitter credentials not configured' });
  }

  const twitterClient = new TwitterApi({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(CALLBACK_URL, {
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  });

  // Store verifier in Supabase (expires in 10 mins)
  await supabase.from('temp_verifiers').insert([{ state, verifier: codeVerifier }]);
  
  res.json({ authUrl: url, state });
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.redirect('/?error=auth_failed');

  const { data: verifierData } = await supabase
    .from('temp_verifiers')
    .select('verifier')
    .eq('state', state)
    .single();

  if (!verifierData) return res.redirect('/?error=invalid_state');

  try {
    const twitterClient = new TwitterApi({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    const { accessToken, refreshToken, expiresIn } = await twitterClient.loginWithOAuth2({
      code: code,
      codeVerifier: verifierData.verifier,
      redirectUri: CALLBACK_URL,
    });

    const loggedClient = new TwitterApi(accessToken);
    const user = await loggedClient.v2.me();

    const userId = user.data.id;
    await supabase.from('user_sessions').upsert({
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
      user_data: user.data,
    });

    await supabase.from('temp_verifiers').delete().eq('state', state);

    res.redirect(`/?connected=true&user=${encodeURIComponent(JSON.stringify(user.data))}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect('/?error=auth_failed');
  }
});

app.get('/auth/status', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { data } = await supabase.from('user_sessions').select('user_data').eq('user_id', userId).single();
  
  if (data) {
    res.json({ connected: true, user: data.user_data });
  } else {
    res.json({ connected: false });
  }
});

app.post('/auth/disconnect', async (req, res) => {
  const userId = req.headers['x-user-id'];
  await supabase.from('user_sessions').delete().eq('user_id', userId);
  res.json({ success: true });
});

// ==================== TWEET ROUTES ====================

app.post('/api/tweet', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { text } = req.body;
  
  const { data: session } = await supabase.from('user_sessions').select('access_token').eq('user_id', userId).single();
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const client = new TwitterApi(session.access_token);
    const tweet = await client.v2.tweet(text);
    
    await supabase.from('tweets').insert([{
      content: text,
      status: 'posted',
      tweet_id: tweet.data.id,
      user_id: userId
    }]);

    res.json({ success: true, tweetId: tweet.data.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/tweets', async (req, res) => {
  const { data } = await supabase.from('tweets').select('*').order('created_at', { ascending: false });
  res.json(data || []);
});

app.post('/api/schedule', async (req, res) => {
  const { text, scheduledAt, userId } = req.body;
  await supabase.from('scheduled_tweets').insert([{
    content: text,
    scheduled_at: scheduledAt,
    user_id: userId,
    status: 'pending'
  }]);
  res.json({ success: true });
});

app.get('/api/scheduled', async (req, res) => {
  const { data } = await supabase.from('scheduled_tweets').select('*').order('scheduled_at', { ascending: true });
  res.json(data || []);
});

// ==================== INFLUENCER & REPLY ROUTES ====================

app.get('/api/influencers', async (req, res) => {
  const { data } = await supabase.from('influencers').select('*');
  res.json(data || []);
});

app.get('/api/influencer-tweets/:handle', async (req, res) => {
  const { handle } = req.params;
  const userId = req.headers['x-user-id'];
  const { data: session } = await supabase.from('user_sessions').select('access_token').eq('user_id', userId).single();
  
  if (!session) return res.status(401).json({ error: 'Auth required' });

  try {
    const client = new TwitterApi(session.access_token);
    const user = await client.v2.userByUsername(handle);
    if (!user.data) return res.status(404).json({ error: 'User not found' });
    
    const timeline = await client.v2.userTimeline(user.data.id, { 
      max_results: 5,
      'tweet.fields': ['public_metrics', 'created_at'] 
    });
    
    res.json(timeline.data.data || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/stats', async (req, res) => {
  const { count: posted } = await supabase.from('tweets').select('*', { count: 'exact', head: true }).eq('status', 'posted');
  const { count: queued } = await supabase.from('tweets').select('*', { count: 'exact', head: true }).eq('status', 'queued');
  const { count: influencers } = await supabase.from('influencers').select('*', { count: 'exact', head: true });
  
  res.json({
    totalTweets: (posted || 0) + (queued || 0),
    postedCount: posted || 0,
    queuedCount: queued || 0,
    influencersCount: influencers || 0,
  });
});

// ==================== SCHEDULER ====================

nodeCron.schedule('* * * * *', async () => {
  const now = new Date().toISOString();

  // Process scheduled
  const { data: pending } = await supabase
    .from('scheduled_tweets')
    .select('*, user_sessions(access_token)')
    .eq('status', 'pending')
    .lte('scheduled_at', now);

  if (pending) {
    for (const tweet of pending) {
      if (tweet.user_sessions?.access_token) {
        try {
          const client = new TwitterApi(tweet.user_sessions.access_token);
          await client.v2.tweet(tweet.content);
          await supabase.from('scheduled_tweets').update({ status: 'posted' }).eq('id', tweet.id);
        } catch (error) {
          await supabase.from('scheduled_tweets').update({ status: 'failed', error: error.message }).eq('id', tweet.id);
        }
      }
    }
  }

  // Hourly Auto-Generation
  const { data: config } = await supabase.from('settings').select('value').eq('key', 'last_generated').single();
  const lastGen = config ? new Date(config.value) : new Date(0);
  const msPerHour = 60 * 60 * 1000;
  
  if (Date.now() - lastGen.getTime() >= msPerHour) {
    const templates = [
      "Consistency is the only bridge between goals and accomplishment.",
      "The best way to predict the future is to create it.",
      "Growth happens outside your comfort zone. 🔥",
    ];
    const content = templates[Math.floor(Math.random() * templates.length)];
    
    await supabase.from('tweets').insert([{ content, status: 'queued' }]);
    await supabase.from('settings').upsert({ key: 'last_generated', value: new Date().toISOString() });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

