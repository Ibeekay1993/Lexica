import { useEffect, useState } from 'react'
import { Calendar, Clock, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import type { ScheduledTweet } from '../App'
import { api } from '../lib/api'

interface ScheduledTweetsProps {
  scheduled: ScheduledTweet[]
  onRefresh: () => void
}

export default function ScheduledTweets({ scheduled, onRefresh }: ScheduledTweetsProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onRefresh()
    
    // Refresh every 30 seconds
    const interval = setInterval(onRefresh, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled tweet?')) return
    
    setIsLoading(true)
    try {
      await api.cancelScheduledTweet(id)
      onRefresh()
    } catch (error) {
      alert('Failed to cancel scheduled tweet')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-amber-500" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'posted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  if (scheduled.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Scheduled Tweets</h3>
            <p className="text-xs text-muted-foreground">{scheduled.length} upcoming</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
        {scheduled.map((tweet) => (
          <div 
            key={tweet.id}
            className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs font-medium border ${getStatusClass(tweet.status)}`}>
              {getStatusIcon(tweet.status)}
              <span className="capitalize">{tweet.status}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 line-clamp-2">{tweet.text}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(tweet.scheduledAt)}
              </p>
            </div>
            
            {tweet.status === 'pending' && (
              <button
                onClick={() => handleCancel(tweet.id)}
                disabled={isLoading}
                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
