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
import Auth from './components/Auth'
import ConnectModal from './components/ConnectModal'
import { api, type TwitterUser, supabase } from './lib/api'
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
  const [session, setSession] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('tweets')
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
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
      const tweetsData = await api.getTweets();
      const scheduledData = await api.getScheduledTweets();
      const authStatus = await api.getAuthStatus();

      const totalCount = tweetsData.length;
      const queuedCount = tweetsData.filter((t: any) => t.status === 'queued').length;
      const postedCount = tweetsData.filter((t: any) => t.status === 'posted').length;

      setStats({
        total: totalCount,
        queued: queuedCount,
        posted: postedCount,
        quotes: 0 
      });
      setTweets(tweetsData);
      setScheduledTweets(scheduledData);
      
      if (authStatus.connected) {
         setTwitterUser(authStatus.user);
         setIsConnected(true);
      }
      
      return tweetsData;
    } catch (e) {
      console.error('Failed to sync with cloud', e);
      return [];
    }
  }, []);

  // Persistent Settings Sync
  const updateAutoGenerate = (val: boolean) => {
    setAutoGenerate(val);
    api.updateSettings({ auto_generate: val });
  };

  const updateNotifications = (val: boolean) => {
    setNotifications(val);
    api.updateSettings({ notifications: val });
  };

  const updateFrequency = (val: number) => {
    setFrequency(val);
    api.updateSettings({ frequency: val });
    setCountdown(getInitialCountdown());
  };

  // Auth Listener (MASTER SYNC)
  useEffect(() => {
    // Safety Fallback: Stop loading after 5 seconds no matter what
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    // Initial Session Check
    api.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch(err => {
        console.error('Session check failed:', err);
        toast.error('Connection weak. Attempting fallback...');
      })
      .finally(() => {
        setIsLoading(false);
        clearTimeout(safetyTimer);
      });

    // Real-Time Auth Listener (Auto-Refresh on login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      setSession(session);
      if (session) {
         // Load Persistent Settings
         const settings = await api.getSettings();
         if (settings) {
            setAutoGenerate(settings.auto_generate ?? true);
            setNotifications(settings.notifications ?? false);
            setFrequency(settings.frequency ?? 60);
         }
         handleRefresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [handleRefresh]);

  // Auto-Open Connect Modal for new commanders
  useEffect(() => {
    if (session && !twitterUser && !isLoading && !isConnectModalOpen) {
       // Only auto-open if we've checked everything and they still have no handle
       const timer = setTimeout(() => {
         setIsConnectModalOpen(true);
       }, 1000);
       return () => clearTimeout(timer);
    }
  }, [session, twitterUser, isLoading]);

  // Countdown timer
  useEffect(() => {
    if (!autoGenerate) return
    const timer = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev > 1) return prev - 1;
        
        // Zero-Zero Engagement: KIMI AI AWAKENS
        toast.info('Kimi AI Station: Initiating Deep Cloud Scrape... 🛰️');
        handleRefresh().then((freshTweets) => {
          const firstQueued = freshTweets?.find((t: Tweet) => t.status === 'queued');
          if (firstQueued) {
             const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(firstQueued.content)}`;
             window.open(url, '_blank');
             toast.success('Kimi AI: Intent Prepared! Finalize on X. 🚀');
          } else {
             // If nothing is ready, Kimi generates new context
             toast.info('Kimi AI: Cache Empty. Generating Deep Context...');
             handleGenerateNow();
          }
        });
        
        return getInitialCountdown();
      });
    }, 1000)
    return () => clearInterval(timer)
  }, [autoGenerate, handleRefresh, getInitialCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleConnectTwitter = () => {
    setIsConnectModalOpen(true)
  }

  const handleLogout = async () => {
    await api.signOut();
    setSession(null);
    setTwitterUser(null);
    setIsConnected(false);
    toast.success('Commander logged out.');
  }

  const handleCompleteConnect = async (handle: string) => {
    try {
      await api.connectTwitter(handle);
      // FIRST: Fetch the full identity
      const authStatus = await api.getAuthStatus();
      
      // SECOND: Update the data, THEN the connection state
      setTwitterUser(authStatus.user);
      setIsConnected(true);
      toast.success(`Identity @${handle} Connected! 🚀`);
      
      // THIRD: Deep Sync for stats
      setTimeout(() => {
        handleRefresh();
      }, 500);
    } catch (error: any) {
      console.error('CRITICAL SYNC ERROR:', error);
      toast.error(`Identity sync failed: ${error.message || 'Cloud connection error'}`);
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
      toast.error('Please connect your Identity card first!')
      return false
    }
    await api.postTweet(content);
    return true;
  }

  const handleAddTweet = async (content: string, tags: string[]) => {
    try {
      const result = await api.addTweet(content, tags)
      if (result.success) {
        toast.success('Saved to User Cloud')
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
      { content: "Consistency is the only bridge between Lagos and London. 🇳🇬🥂", tags: ['viral', 'motivation'] },
      { content: "Tech is the new oil. No cap. 🇳🇬⚓️", tags: ['viral', 'technology'] },
      { content: "The best time to start was yesterday. The second best time is NOW. 🔥", tags: ['motivation', 'viral'] }
    ]
    const random = library[Math.floor(Math.random() * library.length)]
    await handleAddTweet(random.content, random.tags)
    toast.dismiss()
    toast.success('Generated and Saved to User Cloud! 🚀')
  }

  const handleGenerate10 = async () => {
    toast.loading('Mass-Generating 10 Viral Concepts...');
    const list = [
      "Normally!", "Consistency over intensity.", "Twitter is the new town square.", 
      "Lagos energy is different.", "Start where you are.", "Growth mindset.", 
      "Work smart.", "Tech is freedom.", "Impact > Income.", "Stay focused."
    ];
    for(const l of list) {
       await api.addTweet(l, ['viral']);
    }
    handleRefresh();
    toast.dismiss();
    toast.success('10 Content Pieces Added! 🛡️');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Auth onSuccess={handleRefresh} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-purple-50/10 dark:from-slate-900 dark:to-slate-800">
      <Toaster position="top-right" richColors />
      <ConnectModal 
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleCompleteConnect}
      />
      <Header 
        onRefresh={handleRefresh} 
        onLogout={handleLogout} 
        isConnected={isConnected}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center mb-6">
           <TwitterConnect 
            isConnected={isConnected}
            user={twitterUser}
            onConnect={handleConnectTwitter}
            onDisconnect={handleDisconnectTwitter}
            onRefresh={handleRefresh}
           />
           <button onClick={() => api.signOut().then(() => window.location.reload())} className="text-xs font-bold text-slate-400 hover:text-red-500 underline underline-offset-4">LOGOUT EMPIRE</button>
        </div>
        
        <StatsCards stats={stats} />
        
        <div className="mb-8 overflow-x-auto">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {activeTab === 'tweets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            <div className="lg:col-span-5 space-y-6">
              <AutoGenerationPanel
                autoGenerate={autoGenerate}
                onAutoGenerateChange={updateAutoGenerate}
                notifications={notifications}
                onNotificationsChange={updateNotifications}
                countdown={formatTime(countdown)}
                onGenerateNow={handleGenerateNow}
                frequency={frequency}
                onFrequencyChange={updateFrequency}
              />
              
              <TweetGenerator 
                onAddTweet={handleAddTweet}
                onPostTweet={handlePostTweet}
                onScheduleTweet={(c, date) => api.scheduleTweet(c, date.toISOString()).then(() => { handleRefresh(); return true; })}
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
                onAddQuote={(url, comment) => setQuoteTweets([...quoteTweets, { id: Date.now().toString(), url, comment }])}
              />
            </div>
          </div>
        ) : activeTab === 'replies' ? (
          <ReplyGenerator />
        ) : (
          <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-soft text-center italic">
             Module coming in v2.1
          </div>
        )}
      </main>
    </div>
  )
}

export default App
