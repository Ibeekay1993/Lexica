import { useState } from 'react'
import { MessageSquareQuote, Link, Sparkles, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { QuoteTweet } from '../App'

interface QuoteTweetPlannerProps {
  quotes: QuoteTweet[]
  onAddQuote: (url: string, comment: string) => void
}

const randomComments = [
  "This is exactly what I needed to hear today!",
  "Great insights here. Thanks for sharing!",
  "Couldn't agree more with this.",
  "This changed my perspective entirely.",
  "Saving this for later reference.",
]

export default function QuoteTweetPlanner({ quotes, onAddQuote }: QuoteTweetPlannerProps) {
  const [url, setUrl] = useState('')
  const [comment, setComment] = useState('')
  
  const handleAddQuote = () => {
    if (url.trim()) {
      onAddQuote(url, comment)
      setUrl('')
      setComment('')
    }
  }
  
  const handleRandomComment = () => {
    const random = randomComments[Math.floor(Math.random() * randomComments.length)]
    setComment(random)
  }
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden" style={{ animationDelay: '250ms' }}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <MessageSquareQuote className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Quote-Tweet Planner</h3>
            <p className="text-xs text-muted-foreground">{quotes.length} quotes planned</p>
          </div>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video tweet URL (e.g., https://x.com/user/status/123)"
            className="pl-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
          />
        </div>
        
        <div className="relative">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your commentary..."
            className="min-h-[80px] resize-none border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
          />
          <button
            onClick={handleRandomComment}
            className="absolute bottom-3 right-3 p-1.5 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 rounded-lg text-slate-400 hover:text-pink-500 transition-colors"
            title="Random comment"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <button
          onClick={handleAddQuote}
          disabled={!url.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 gradient-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Quote Tweet
        </button>
        
        {quotes.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-xs font-medium text-slate-500">Planned Quotes</p>
            {quotes.map((quote, index) => (
              <div 
                key={quote.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquareQuote className="w-4 h-4 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <a 
                    href={quote.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                  >
                    {quote.url}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  {quote.comment && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{quote.comment}</p>
                  )}
                </div>
                <button className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
