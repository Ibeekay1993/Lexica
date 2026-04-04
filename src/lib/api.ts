import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
}

export const api = {
  // Stats (Using direct Supabase queries)
  getStats: async () => {
    const { count: postedCount } = await supabase.from('tweets').select('*', { count: 'exact', head: true }).eq('status', 'posted')
    const { count: queuedCount } = await supabase.from('tweets').select('*', { count: 'exact', head: true }).eq('status', 'queued')
    const { count: influencersCount } = await supabase.from('influencers').select('*', { count: 'exact', head: true })
    
    return {
      totalTweets: (postedCount || 0) + (queuedCount || 0),
      postedCount: postedCount || 0,
      queuedCount: queuedCount || 0,
      influencersCount: influencersCount || 0,
    }
  },

  // Auth (Placeholder for serverless version)
  getAuthStatus: async () => {
    // In a real app, this would check Supabase Auth session
    return { connected: true, user: { id: 'user_1', name: 'Lexica User', username: 'lexica_pro' } }
  },

  connectTwitter: async () => {
    // For now, we just simulate connection
    return { authUrl: null, success: true }
  },

  disconnect: async () => {
    return { success: true }
  },

  // Tweets management
  getTweets: async () => {
    const { data } = await supabase
      .from('tweets')
      .select('*')
      .order('created_at', { ascending: false })
    
    return (data || []).map(t => ({
      id: t.id,
      content: t.content,
      tags: t.tags || [],
      status: t.status as 'queued' | 'draft' | 'posted',
      createdAt: new Date(t.created_at)
    }))
  },

  addTweet: async (content: string, tags: string[]) => {
    const { data, error } = await supabase.from('tweets').insert([{
      content,
      tags,
      status: 'queued'
    }]).select()
    return { success: !error, data: data?.[0] }
  },

  deleteTweet: async (id: string) => {
    const { error } = await supabase.from('tweets').delete().eq('id', id)
    return { success: !error }
  },

  postTweet: async (text: string) => {
    // Open Twitter intent directly (serverless)
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    
    // Mark as posted or add new entry
    await supabase.from('tweets').insert([{ 
      content: text, 
      status: 'posted' 
    }])
    return { success: true }
  },

  // Scheduling
  getScheduledTweets: async () => {
    const { data } = await supabase.from('scheduled_tweets').select('*').order('scheduled_at', { ascending: true })
    return (data || []).map(t => ({
      id: t.id,
      text: t.content,
      scheduledAt: t.scheduled_at,
      status: t.status
    }))
  },

  scheduleTweet: async (text: string, scheduledAt: string) => {
    const { error } = await supabase.from('scheduled_tweets').insert([{
      content: text,
      scheduled_at: scheduledAt,
      status: 'pending'
    }])
    return { success: !error }
  },

  // Influencer Tracking
  getInfluencers: async () => {
    const { data } = await supabase.from('influencers').select('*')
    return data || []
  },

  // Note: Influencer tweets require a Twitter API key.
  // In this serverless version, we provide high-quality mock data for the UI.
  getInfluencerTweets: async (handle: string) => {
    const mocks: Record<string, any[]> = {
      'john322226': [
        { id: '1', text: "Consistency is the only bridge between goals and accomplishment. Keep pushing! 🚀", created_at: new Date().toISOString() },
        { id: '2', text: "The tech ecosystem in Lagos is buzzing. The future is bright. 🇳🇬", created_at: new Date(Date.now() - 3600000).toISOString() }
      ],
      'DamiForeign': [
        { id: '3', text: "Success doesn't just happen. You have to be intentional. 🔥", created_at: new Date().toISOString() },
        { id: '4', text: "Always stay hungry for knowledge.", created_at: new Date(Date.now() - 7200000).toISOString() }
      ]
    }
    return mocks[handle] || [
      { id: '5', text: `Just posted a new update! Check it out directly on my X profile @${handle}`, created_at: new Date().toISOString() }
    ]
  },

  generateReply: async (tweetText: string, tone = 'agree') => {
    console.log('Generating reply for:', tweetText.slice(0, 50))
    const templates: Record<string, string[]> = {
      agree: ["Exactly! 💯", "Spot on observation.", "True! Consistency wins."],
      insight: ["Great point. I'd add that timing is key.", "Interesting take!", "Powerful insight."],
      nigerian: ["Normally! Correct talk. 🇳🇬", "Facts only.", "No cap! 🚀"]
    }
    const current = templates[tone] || templates.agree
    return { suggestions: current.sort(() => 0.5 - Math.random()).slice(0, 3) }
  },
}
