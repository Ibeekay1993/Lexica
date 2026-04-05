import { useState } from 'react'
import { 
  List, 
  FileText, 
  CheckCircle, 
  Clock, 
  Copy, 
  Edit2, 
  Trash2,
  MessageSquare,
  Flame,
  Lightbulb,
  HelpCircle,
  Hash,
  Send
} from 'lucide-react'
import type { Tweet } from '../App'

interface ContentQueueProps {
  tweets: Tweet[]
  onDeleteTweet: (id: string) => void
  onPostTweet?: (content: string) => Promise<boolean>
  isConnected?: boolean
  onGenerate10?: () => void
}

type FilterStatus = 'all' | 'queued' | 'draft' | 'posted'

const tagIcons: Record<string, React.ReactNode> = {
  viral: <Flame className="w-3 h-3" />,
  opinion: <Lightbulb className="w-3 h-3" />,
  question: <HelpCircle className="w-3 h-3" />,
  thread: <Hash className="w-3 h-3" />,
}

const tagColors: Record<string, string> = {
  viral: 'bg-orange-50 text-orange-700 border-orange-100',
  opinion: 'bg-purple-50 text-purple-700 border-purple-100',
  question: 'bg-blue-50 text-blue-700 border-blue-100',
  thread: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  productivity: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  technology: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  motivation: 'bg-pink-50 text-pink-700 border-pink-100',
  entrepreneurship: 'bg-amber-50 text-amber-700 border-amber-100',
}

function TweetCard({ 
  tweet, 
  onDelete, 
  onPost,
  isConnected,
  index 
}: { 
  tweet: Tweet; 
  onDelete: (id: string) => void;
  onPost?: (content: string) => Promise<boolean>;
  isConnected?: boolean;
  index: number 
}) {
  const [isCopied, setIsCopied] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(tweet.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handlePost = async () => {
    if (!onPost) return
    setIsPosting(true)
    await onPost(tweet.content)
    setIsPosting(false)
  }
  
  const statusConfig = {
    queued: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Queued' },
    draft: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Draft' },
    posted: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Posted' },
  }
  
  const status = statusConfig[tweet.status]
  const StatusIcon = status.icon
  
  return (
    <div 
      className="group relative bg-white rounded-xl border border-slate-100 p-4 hover:shadow-elevated hover:border-blue-200 transition-all duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute -left-px top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
            {tweet.content}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tweet.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                  tagColors[tag] || 'bg-slate-50 text-slate-600 border-slate-100'
                }`}
              >
                {tagIcons[tag]}
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isConnected && tweet.status === 'queued' && (
            <button
              onClick={handlePost}
              disabled={isPosting}
              className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
              title="Post to Twitter"
            >
              <Send className={`w-4 h-4 ${isPosting ? 'animate-pulse' : ''}`} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-colors ${
              isCopied 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
            title={isCopied ? 'Copied!' : 'Copy'}
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(tweet.id)}
            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${status.bg}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
        </div>
        <span className="text-xs text-slate-400">
          {tweet.createdAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

export default function ContentQueue({ 
  tweets, 
  onDeleteTweet,
  onPostTweet,
  isConnected = false,
  onGenerate10
}: ContentQueueProps) {
  const [filter, setFilter] = useState<FilterStatus>('all')
  
  const filteredTweets = filter === 'all' 
    ? tweets 
    : tweets.filter((t: Tweet) => t.status === filter)
  
  const counts = {
    all: tweets.length,
    queued: tweets.filter((t: Tweet) => t.status === 'queued').length,
    draft: tweets.filter((t: Tweet) => t.status === 'draft').length,
    posted: tweets.filter((t: Tweet) => t.status === 'posted').length,
  }
  
  const filters: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'queued', label: 'Queued', count: counts.queued },
    { id: 'draft', label: 'Drafts', count: counts.draft },
    { id: 'posted', label: 'Posted', count: counts.posted },
  ]
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <List className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Content Queue</h3>
            <p className="text-xs text-muted-foreground">{tweets.length} tweets ready</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate10}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
          >
            <Flame className="w-3.5 h-3.5" />
            Generate 10
          </button>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {filteredTweets.length} shown
          </span>
        </div>
      </div>
      
      <div className="px-5 py-3 border-b border-slate-100 flex gap-1 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
              ${filter === f.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            {f.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
              filter === f.id ? 'bg-white/20' : 'bg-slate-200'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>
      
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredTweets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No tweets found</p>
            <p className="text-sm text-slate-400 mt-1">Generate some tweets to get started</p>
          </div>
        ) : (
          filteredTweets.map((tweet, index) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onDelete={onDeleteTweet}
              onPost={onPostTweet}
              isConnected={isConnected}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}
