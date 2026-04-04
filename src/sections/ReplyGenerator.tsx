import { useState, useEffect } from 'react'
import { MessageSquare, RefreshCw, Send, User, ChevronRight, Check } from 'lucide-react'
import { api } from '../lib/api'

interface Influencer {
  name: string
  handle: string
}

interface Tweet {
  id: string
  text: string
  created_at: string
}

export default function ReplyGenerator() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [, setCurrentTone] = useState('agree')
  const [activeTweet, setActiveTweet] = useState<Tweet | null>(null)

  useEffect(() => {
    api.getInfluencers().then(setInfluencers).catch(console.error)
  }, [])

  const fetchTweets = async (handle: string) => {
    setIsLoading(true)
    setSelectedHandle(handle)
    try {
      const data = await api.getInfluencerTweets(handle)
      setTweets(data)
      if (data.length > 0) setActiveTweet(data[0])
    } catch (error) {
      console.error(error)
    }
    setIsLoading(false)
  }

  const generateSuggestions = async (tweet: Tweet, tone: string) => {
    setIsLoading(true)
    setActiveTweet(tweet)
    setCurrentTone(tone)
    try {
      const { suggestions } = await api.generateReply(tweet.text, tone)
      setSuggestions(suggestions)
    } catch (error) {
      console.error(error)
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bloggers List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Tracked Influencers
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {influencers.map((inf) => (
              <button
                key={inf.handle}
                onClick={() => fetchTweets(inf.handle)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${
                  selectedHandle === inf.handle 
                  ? 'bg-blue-50 border-blue-100 border' 
                  : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {inf.name[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800">{inf.name}</div>
                    <div className="text-xs text-slate-500">@{inf.handle}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedHandle === inf.handle ? 'text-blue-500' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tweets & Suggestions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft min-h-[400px]">
            {selectedHandle ? (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Recent Tweets from @{selectedHandle}
                </h3>
                
                {isLoading && tweets.length === 0 ? (
                  <div className="flex items-center justify-center h-40">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tweets.map((tweet) => (
                      <div 
                        key={tweet.id} 
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          activeTweet?.id === tweet.id ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'
                        }`}
                        onClick={() => setActiveTweet(tweet)}
                      >
                        <p className="text-sm text-slate-700 leading-relaxed mb-3">{tweet.text}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{new Date(tweet.created_at).toLocaleString()}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => generateSuggestions(tweet, 'nigerian')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium"
                            >
                              🇳🇬 Naija Tone
                            </button>
                            <button 
                              onClick={() => generateSuggestions(tweet, 'agree')}
                              className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                            >
                              Agree
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {activeTweet && suggestions.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Send className="w-4 h-4 text-purple-500" />
                          Generated Replies
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {suggestions.map((s, idx) => (
                            <div key={idx} className="group relative">
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                                <p className="text-sm text-slate-800 pr-12">{s}</p>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(s)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Influencer Selected</h3>
                <p className="text-sm text-slate-500 max-w-xs">Select an influencer from the list on the left to see their recent tweets and generate smart replies.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
