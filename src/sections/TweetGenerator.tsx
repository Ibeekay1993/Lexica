import { useState } from 'react'
import { Sparkles, Flame, Briefcase, Plus, Download, Trash2, Zap, Send, Calendar } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface TweetGeneratorProps {
  onAddTweet: (content: string, tags: string[]) => void
  onPostTweet?: (content: string) => Promise<boolean>
  onScheduleTweet?: (content: string, scheduledAt: Date) => Promise<boolean>
  isConnected?: boolean
}

const styles = [
  { id: 'viral', label: 'Viral', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'business', label: 'Business', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
]

const categories = [
  { id: 'productivity', label: 'Productivity' },
  { id: 'technology', label: 'Technology' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'entrepreneurship', label: 'Entrepreneurship' },
]

export default function TweetGenerator({ 
  onAddTweet, 
  onPostTweet, 
  onScheduleTweet,
  isConnected = false 
}: TweetGeneratorProps) {
  const [content, setContent] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('viral')
  const [selectedCategory, setSelectedCategory] = useState('productivity')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const charCount = content.length
  const maxChars = 280
  const progress = (charCount / maxChars) * 100

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const templates = [
        "The most successful people aren't the smartest. They're the most consistent.",
        "Your comfort zone is a beautiful place, but nothing ever grows there.",
        "The best investment you can make is in yourself.",
        "Stop waiting for the perfect moment. Take the moment and make it perfect.",
      ]
      const random = templates[Math.floor(Math.random() * templates.length)]
      setContent(random)
      setIsGenerating(false)
    }, 800)
  }

  const handleAddToQueue = () => {
    if (content.trim()) {
      onAddTweet(content, [selectedStyle, selectedCategory])
      setContent('')
    }
  }

  const handlePostNow = async () => {
    if (!content.trim() || !onPostTweet) return
    
    setIsPosting(true)
    const success = await onPostTweet(content)
    if (success) {
      onAddTweet(content, [selectedStyle, selectedCategory])
      setContent('')
    }
    setIsPosting(false)
  }

  const handleSchedule = async () => {
    if (!content.trim() || !onScheduleTweet || !scheduledDate || !scheduledTime) return
    
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)
    if (scheduledAt <= new Date()) {
      alert('Please select a future date and time')
      return
    }
    
    setIsPosting(true)
    const success = await onScheduleTweet(content, scheduledAt)
    if (success) {
      onAddTweet(content, [selectedStyle, selectedCategory])
      setContent('')
      setShowSchedule(false)
      setScheduledDate('')
      setScheduledTime('')
    }
    setIsPosting(false)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'generate10':
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            const templates = [
              "Success is the sum of small efforts repeated day in and day out.",
              "Don't watch the clock; do what it does. Keep going.",
              "The future belongs to those who believe in the beauty of their dreams.",
            ]
            const random = templates[Math.floor(Math.random() * templates.length)]
            onAddTweet(random, [selectedStyle, selectedCategory])
          }, i * 100)
        }
        break
      case 'clear':
        setContent('')
        break
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-slate-900">Tweet Generator</h3>
      </div>
      
      <div className="p-5 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
            <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
          </div>
          
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your tweet or click Generate..."
            className="min-h-[120px] resize-none border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400"
            maxLength={maxChars}
          />
          
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              progress > 90 ? 'text-red-500' : 'text-slate-400'
            }`}>
              {charCount}/{maxChars}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-100">
            {selectedStyle}
          </span>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
            {selectedCategory}
          </span>
        </div>

        {/* Schedule Input */}
        {showSchedule && (
          <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToQueue}
            disabled={!content.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add to Queue
          </button>
          
          {isConnected && (
            <>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  showSchedule 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {showSchedule ? 'Cancel' : 'Schedule'}
              </button>
              
              {showSchedule ? (
                <button
                  onClick={handleSchedule}
                  disabled={!content.trim() || !scheduledDate || !scheduledTime || isPosting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 gradient-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="w-4 h-4" />
                  {isPosting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              ) : (
                <button
                  onClick={handlePostNow}
                  disabled={!content.trim() || isPosting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 gradient-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isPosting ? 'Posting...' : 'Post Now'}
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('generate10')}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors"
            >
              Generate 10
            </button>
            <button
              onClick={() => handleQuickAction('clear')}
              className="px-3 py-2 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
            <button className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors flex items-center gap-1">
              <Download className="w-3 h-3" />
              Download All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
