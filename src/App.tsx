import { useState, useEffect } from 'react'
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
  const [countdown, setCountdown] = useState(3595)
  const [stats, setStats] = useState({ total: 0, queued: 0, posted: 0, quotes: 0 })

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await api.getStats();
        const tweetsData = await api.getTweets();
        const scheduledData = await api.getScheduledTweets();
        
        setStats({
          total: statsData.totalTweets,
          queued: statsData.queuedCount,
          posted: statsData.postedCount,
          quotes: quoteTweets.length
        });
        setTweets(tweetsData);
        setScheduledTweets(scheduledData);
      } catch (e) {
        console.error('Failed to fetch stats/tweets', e);
      }
    };

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

    fetchData();
    checkAuthStatus();
    
    // Refresh data every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!autoGenerate) return
    const timer = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev > 0) return prev - 1;
        
        // When countdown hits 0 (every hour)
        api.getTweets().then(newTweets => {
          if (newTweets.length > tweets.length) {
            setTweets(newTweets);
            if (notifications) {
              if (Notification.permission === 'granted') {
                new Notification('TweetForge Pro', {
                  body: 'A new tweet has been auto-generated and is ready to post! 🚀',
                  icon: '/favicon.ico'
                });
              } else {
                toast.success('New tweet auto-generated!');
              }
            }
          }
        }).catch(console.error);
        
        return 3599;
      });
    }, 1000)
    return () => clearInterval(timer)
  }, [autoGenerate, notifications, tweets.length])

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
        toast.success('Tweet posted successfully!')
        const updated = await api.getTweets()
        setTweets(updated)
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
        const scheduled = await api.getScheduledTweets()
        setScheduledTweets(scheduled)
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
        toast.success('Added to queue')
        const updated = await api.getTweets()
        setTweets(updated)
        
        // Refresh stats
        const statsData = await api.getStats()
        setStats(prev => ({
          ...prev,
          total: statsData.totalTweets,
          queued: statsData.queuedCount
        }))
      }
    } catch (e) {
      toast.error('Failed to add tweet')
    }
  }

  const handleDeleteTweet = async (id: string) => {
    try {
      const result = await api.deleteTweet(id)
      if (result.success) {
        setTweets(tweets.filter((t: Tweet) => t.id !== id))
        toast.info('Removed from queue')
        
        // Refresh stats
        const statsData = await api.getStats()
        setStats(prev => ({
          ...prev,
          total: statsData.totalTweets,
          queued: statsData.queuedCount
        }))
      }
    } catch (e) {
      toast.error('Failed to delete tweet')
    }
  }

  const handleAddQuoteTweet = (url: string, comment: string) => {
    const newQuote: QuoteTweet = {
      id: Date.now().toString(),
      url,
      comment,
    }
    setQuoteTweets([...quoteTweets, newQuote])
    toast.success('Quote planned')
  }

  const handleGenerateNow = async () => {
    toast.loading('Generating ideas...')
    const templates = [
      { content: "The secret to success? Consistency beats intensity. 🔥", tags: ['viral', 'motivation'] },
      { content: "What's one skill you're learning this month? 📚", tags: ['question', 'growth'] },
      { content: "Remote work isn't the future. Async work is.", tags: ['opinion', 'work'] },
      { content: "Your network is your net worth. Build it intentionally. 🤝", tags: ['viral', 'networking'] },
    ]
    const random = templates[Math.floor(Math.random() * templates.length)]
    await handleAddTweet(random.content, random.tags)
    toast.dismiss()
    toast.success('New tweet ready!')
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
      <Header />
      
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
              />
              <QuoteTweetPlanner
                quotes={quoteTweets}
                onAddQuote={handleAddQuoteTweet}
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
