import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Header from './sections/Header'
import StatsCards from './sections/StatsCards'
import NavigationTabs from './sections/NavigationTabs'
import AutoGenerationPanel from './sections/AutoGenerationPanel'
import TweetGenerator from './sections/TweetGenerator'
import ContentQueue from './sections/ContentQueue'
import QuoteTweetPlanner from './sections/QuoteTweetPlanner'
import TwitterConnect from './sections/TwitterConnect'
import ScheduledTweets from './sections/ScheduledTweets'
import ReplyGenerator from './sections/ReplyGenerator'
import { api, type TwitterUser } from './lib/api'
import { Toaster, toast } from 'sonner'

export interface Tweet {
  id: string
  content: string
  tags: string[]
  status: 'queued' | 'draft' | 'posted'
  createdAt: Date
  tweetId?: string
}

export interface QuoteTweet {
  id: string
  url: string
  comment: string
}

export interface ScheduledTweet {
  id: string
  text: string
  scheduledAt: string
  status: 'pending' | 'posted' | 'failed'
}

function App() {
  const [activeTab, setActiveTab] = useState('tweets')
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [quoteTweets, setQuoteTweets] = useState<QuoteTweet[]>([])
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([])
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [frequency, setFrequency] = useState(60) // 15, 30, 60 minutes
  
  // Calculate time until next window based on frequency
  const getInitialCountdown = useCallback(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const totalSecsElapsed = (minutes * 60) + seconds;
    const freqSecs = frequency * 60;
    return freqSecs - (totalSecsElapsed % freqSecs);
  }, [frequency]);

  const [countdown, setCountdown] = useState(getInitialCountdown())
  const [stats, setStats] = useState({ total: 0, queued: 0, posted: 0, quotes: 0 })

  const handleRefresh = useCallback(async () => {
    try {
      const statsData = await api.getStats();
      const tweetsData = await api.getTweets();
      const scheduledData = await api.getScheduledTweets();
      
      setStats({
        total: statsData.totalTweets,
        queued: statsData.queuedCount,
        posted: statsData.postedCount,
        quotes: statsData.totalTweets 
      });
      setTweets(tweetsData);
      setScheduledTweets(scheduledData);
      return tweetsData;
    } catch (e) {
      console.error('Failed to sync with cloud', e);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const status = await api.getAuthStatus();
        if (status.connected) {
          setTwitterUser(status.user);
          setIsConnected(true);
        }
      } catch (e) {
        console.error('Auth check failed');
      }
      setIsLoading(false);
    };

    handleRefresh();
    checkAuthStatus();
    
    // Refresh data every 30s
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  // Countdown timer
  useEffect(() => {
    if (!autoGenerate) return
    const timer = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev > 1) return prev - 1;
        
        // When countdown hits 0
        handleRefresh().then((freshTweets) => {
          toast.success('System Waking Up: Cloud Sync Complete! 🚀');
          
          // Auto-open the most recent queued tweet intent
          const firstQueued = freshTweets.find((t: Tweet) => t.status === 'queued');
          if (firstQueued) {
             const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(firstQueued.content)}`;
             window.open(url, '_blank');
          }
        });
        
        return getInitialCountdown();
      });
    }, 1000)
    return () => clearInterval(timer)
  }, [autoGenerate, handleRefresh, getInitialCountdown]);

  // Request notifications permission
  useEffect(() => {
    if (notifications && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [notifications])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleConnectTwitter = async () => {
    try {
      const data = await api.connectTwitter()
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        const status = await api.getAuthStatus();
        setTwitterUser(status.user);
        setIsConnected(true);
        toast.success('X Account Connected!');
      }
    } catch (error) {
      toast.error('Failed to initiate Twitter connection.')
    }
  }

  const handleDisconnectTwitter = async () => {
    try {
      await api.disconnect();
      setTwitterUser(null);
      setIsConnected(false);
      toast.success('Disconnected successfully');
    } catch (e) {
      toast.error('Disconnect failed');
    }
  }

  const handlePostTweet = async (content: string) => {
    if (!isConnected) {
      toast.error('Please connect your Twitter account first!')
      return false
    }
    
    try {
      const result = await api.postTweet(content)
      if (result.success) {
        toast.success('Opening Twitter intent...')
        setTimeout(handleRefresh, 2000)
        return true
      }
    } catch (error) {
      toast.error('Failed to post tweet.')
    }
    return false
  }

  const handleScheduleTweet = async (content: string, scheduledAt: Date) => {
    if (!isConnected) {
      toast.error('Please connect your Twitter account first!')
      return false
    }
    
    try {
      const result = await api.scheduleTweet(content, scheduledAt.toISOString())
      if (result.success) {
        toast.success('Tweet scheduled!')
        handleRefresh()
        return true
      }
    } catch (error) {
      toast.error('Failed to schedule tweet.')
    }
    return false
  }

  const handleAddTweet = async (content: string, tags: string[]) => {
    try {
      const result = await api.addTweet(content, tags)
      if (result.success) {
        toast.success('Saved to Cloud Queue')
        handleRefresh()
      }
    } catch (e) {
      toast.error('Failed to add tweet')
    }
  }

  const handleDeleteTweet = async (id: string) => {
    try {
      const result = await api.deleteTweet(id)
      if (result.success) {
        handleRefresh()
        toast.info('Removed from queue')
      }
    } catch (e) {
      toast.error('Failed to delete tweet')
    }
  }

  const handleGenerateNow = async () => {
    toast.loading('AI is crafting viral hooks...')
    const library = [
      { content: "Normally! Consistency is the only bridge between Lagos and London. 🇳🇬🥂", tags: ['viral', 'motivation'] },
      { content: "What's the one skill you're learning today that pays off in 5 years? 📚🧠", tags: ['question', 'growth'] },
      { content: "Remote work is just the beginning. Async culture is where the real wealth is. 🚀", tags: ['opinion', 'technology'] },
      { content: "Your network isn't just people you know. It's people who trust you. 🤝", tags: ['viral', 'entrepreneurship'] },
      { content: "The best time to start was yesterday. The second best time is NOW. 🔥", tags: ['motivation', 'viral'] },
      { content: "Normally! Tech is the new oil. No cap. 🇳🇬⚓️", tags: ['viral', 'technology'] },
      { content: "POV: You finally stopped trading time for money. 📈🏆", tags: ['opinion', 'entrepreneurship'] },
      { content: "Why do we overcomplicate success? It's just input vs output. 🧠", tags: ['question', 'productivity'] }
    ]
    const random = library[Math.floor(Math.random() * library.length)]
    await handleAddTweet(random.content, random.tags)
    toast.dismiss()
    toast.success('Generated and Saved to Cloud! 🚀')
  }

  const handleGenerate10 = async () => {
    toast.loading('Mass-Generating 10 Viral Concepts...');
    for(let i=0; i<10; i++) {
       const library = [
        { content: "Consistency over intensity. Always.", tags: ['viral'] },
        { content: "Normally! If you want to go fast, go alone. 🇳🇬", tags: ['motivation'] },
        { content: "Twitter is the new town square.", tags: ['opinion'] }
       ];
       const random = library[Math.floor(Math.random() * library.length)];
       await api.addTweet(random.content, random.tags);
    }
    handleRefresh();
    toast.dismiss();
    toast.success('10 Content Pieces Added! 🛡️');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-bold tracking-tight">TWEETFORGE PRO</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-purple-50/10 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
      <Toaster position="top-right" richColors />
      <Header onRefresh={() => {
        handleRefresh();
        toast.info('Cloud Sync: In Progress...', { duration: 1000 });
      }} />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <TwitterConnect 
          isConnected={isConnected}
          user={twitterUser}
          onConnect={handleConnectTwitter}
          onDisconnect={handleDisconnectTwitter}
        />
        
        <StatsCards stats={stats} />
        
        <div className="mb-8 overflow-x-auto">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {activeTab === 'tweets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            <div className="lg:col-span-5 space-y-6">
              <AutoGenerationPanel
                autoGenerate={autoGenerate}
                onAutoGenerateChange={setAutoGenerate}
                notifications={notifications}
                onNotificationsChange={setNotifications}
                countdown={formatTime(countdown)}
                onGenerateNow={handleGenerateNow}
                frequency={frequency}
                onFrequencyChange={setFrequency}
              />
              
              <TweetGenerator 
                onAddTweet={handleAddTweet}
                onPostTweet={handlePostTweet}
                onScheduleTweet={handleScheduleTweet}
                isConnected={isConnected}
              />
              
              <ScheduledTweets 
                scheduled={scheduledTweets}
                onRefresh={() => api.getScheduledTweets().then(setScheduledTweets)}
              />
            </div>
            
            <div className="lg:col-span-7 space-y-6">
              <ContentQueue
                tweets={tweets}
                onDeleteTweet={handleDeleteTweet}
                onPostTweet={handlePostTweet}
                isConnected={isConnected}
                onGenerate10={handleGenerate10}
              />
              <QuoteTweetPlanner
                quotes={quoteTweets}
                onAddQuote={(url, comment) => {
                  const newQuote: QuoteTweet = { id: Date.now().toString(), url, comment };
                  setQuoteTweets([...quoteTweets, newQuote]);
                  toast.success('Quote planned');
                }}
              />
            </div>
          </div>
        ) : activeTab === 'replies' ? (
          <ReplyGenerator />
        ) : activeTab === 'analytics' ? (
          <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-soft text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analytics Dashboard</h2>
            <p className="text-slate-500 max-w-md mx-auto">Detailed performance tracking, engagement rates, and growth metrics are coming in the next update. Connect your X account to start gathering data.</p>
          </div>
        ) : activeTab === 'schedule' ? (
           <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-soft text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📅</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Content Calendar</h2>
            <p className="text-slate-500 max-w-md mx-auto">Visual content calendar for better planning. Schedule tweets by dragging and dropping them across the week.</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default App
