import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

export const api = {
  // Auth & Multi-User Support
  signUp: async (email: string, pass: string) => {
    return await supabase.auth.signUp({ email, password: pass });
  },

  signIn: async (email: string, pass: string) => {
    return await supabase.auth.signInWithPassword({ email, password: pass });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    return await supabase.auth.getSession();
  },

  // Persistent Settings
  getSettings: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
    return data;
  },

  updateSettings: async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('user_settings').update(updates).eq('user_id', user.id);
  },

  // Real Identity Sync
  getAuthStatus: async () => {
     const settings = await api.getSettings();
     if (!settings || !settings.twitter_handle) {
        return { connected: false, user: null };
     }

     try {
       const res = await fetch(`https://unavatar.io/twitter/${settings.twitter_handle}?json=true`);
       const data = await res.json();
       return {
         connected: true,
         user: {
           id: settings.user_id || 'unknown',
           name: data.display_name || data.name || settings.twitter_handle,
           username: settings.twitter_handle,
           profile_image_url: `https://unavatar.io/twitter/${settings.twitter_handle}`,
           public_metrics: {
             followers_count: data.followers_count || 0,
             following_count: data.following_count || 0,
             tweet_count: data.statuses_count || 0,
             listed_count: 0
           }
         }
       } as { connected: boolean, user: TwitterUser };
     } catch (e) {
       return { 
         connected: true, 
         user: { 
           id: settings.user_id || 'unknown',
           name: settings.twitter_handle, 
           username: settings.twitter_handle 
         } 
       } as { connected: boolean, user: TwitterUser };
     }
  },

  connectTwitter: async (handle: string) => {
    // In a real OAuth flow we'd use X's api, but for this serverless version
    // we save the handle and sync the unavatar metrics to "Connect".
    await api.updateSettings({ twitter_handle: handle.replace('@', ''), last_sync: new Date() });
    return { success: true };
  },

  disconnect: async () => {
    await api.updateSettings({ twitter_handle: null });
  },

  // Cloud Content Engine (User-Specific)
  getTweets: async () => {
    const { data } = await supabase
      .from('tweets')
      .select('*')
      .order('created_at', { ascending: false })
    
    return (data || []).map((t: any) => ({
      id: t.id,
      content: t.content,
      tags: t.tags || [],
      status: t.status as 'queued' | 'draft' | 'posted',
      createdAt: new Date(t.created_at),
      tweetId: t.tweet_id
    }))
  },

  addTweet: async (content: string, tags: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('tweets').insert([{
      content,
      tags,
      status: 'queued',
      user_id: user?.id
    }]).select()
    return { success: !error, data: data?.[0] }
  },

  postTweet: async (content: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`
    window.open(url, '_blank')
    return { success: true }
  },

  deleteTweet: async (id: string) => {
    const { error } = await supabase.from('tweets').delete().eq('id', id)
    return { success: !error }
  },

  getStats: async () => {
    const { data: tweets } = await supabase.from('tweets').select('status')
    const list = (tweets || []) as { status: string }[];
    return {
      totalTweets: list.length,
      queuedCount: list.filter(t => t.status === 'queued').length,
      postedCount: list.filter(t => t.status === 'posted').length
    }
  },

  scheduleTweet: async (content: string, scheduledAt: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('scheduled_tweets').insert([{
      text: content,
      scheduled_at: scheduledAt,
      status: 'pending',
      user_id: user?.id
    }]).select()
    return { success: !error, data: data?.[0] }
  },

  getScheduledTweets: async () => {
    const { data } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .order('scheduled_at', { ascending: true })
    
    return (data || []).map((t: any) => ({
      id: t.id,
      text: t.text,
      scheduledAt: t.scheduled_at,
      status: t.status
    }))
  },

  cancelScheduledTweet: async (id: string) => {
    const { error } = await supabase.from('scheduled_tweets').delete().eq('id', id)
    return { success: !error }
  },

  // Influencer Tracking (Always provides default list)
  getInfluencers: async () => {
    try {
      const { data } = await supabase.from('influencers').select('*');
      if (data && data.length > 0) return data;
      
      // Fallback: The "Global Impression Fleet"
      return [
        { id: '1', name: 'Elon Musk', handle: 'elonmusk', niche: 'Technology' },
        { id: '2', name: 'Fabrizio Romano', handle: 'FabrizioRomano', niche: 'Sports' },
        { id: '3', name: 'Davido', handle: 'davido', niche: 'Entertainment' },
        { id: '4', name: 'Olamide', handle: 'Olamide', niche: 'Entertainment' },
        { id: '5', name: 'Wizkid', handle: 'wizkidayo', niche: 'Entertainment' },
        { id: '6', name: 'Burna Boy', handle: 'burnaboy', niche: 'Entertainment' },
        { id: '7', name: 'Don Jazzy', handle: 'DONJAZZY', niche: 'Naija Tech/Ent' },
        { id: '8', name: 'MrMacaroni', handle: 'mrmacaronii', niche: 'Comedy' },
        { id: '9', name: 'Tunde Ednut', handle: 'TundeEdnut', niche: 'Entertainment' },
        { id: '10', name: 'Victor Osimhen', handle: 'victorosimhen9', niche: 'Sports' }
      ];
    } catch (e) {
       return [];
    }
  },

  getInfluencerTweets: async (handle: string) => {
    const mocks: Record<string, any[]> = {
      'elonmusk': [
        { id: 'm1', text: "Mars is looking more possible every day. Humanity must become multi-planetary. 🚀", created_at: new Date().toISOString() },
        { id: 'm2', text: "X is the future of everything. Decentralized truth is the only way.", created_at: new Date(Date.now() - 3600000).toISOString() }
      ],
      'davido': [
        { id: 'd1', text: "Naija! The energy is unmatched. New music loading... 🇳🇬🥂", created_at: new Date().toISOString() },
        { id: 'd2', text: "Always stay focused. God is the greatest. 🙏💎", created_at: new Date(Date.now() - 7200000).toISOString() }
      ]
    }
    return (mocks[handle] || [
      { id: 'g1', text: `Always keep moving. The world never waits. 🔥 @${handle}`, created_at: new Date().toISOString() },
      { id: 'g2', text: `Greatness is a journey, not a destination. 🚀⚓️ @${handle}`, created_at: new Date(Date.now() - 3600000).toISOString() }
    ]).map(t => ({
      id: t.id,
      text: t.text,
      createdAt: new Date(t.created_at)
    }))
  },

  generateReply: async (_tweetText: string, tone = 'agree') => {
    const templates: Record<string, string[]> = {
      agree: ["Exactly! 💯", "Spot on observation.", "True! Consistency wins."],
      insight: ["Great point. I'd add that timing is key.", "Interesting take!", "Powerful insight."],
      nigerian: ["Normally! Correct talk. 🇳🇬", "Facts only.", "No cap! 🚀"]
    }
    const current = templates[tone] || templates.agree
    return { suggestions: current.sort(() => 0.5 - Math.random()).slice(0, 3) }
  },
}
