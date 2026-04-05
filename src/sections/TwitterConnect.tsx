import { Twitter, Check, LogOut, AlertCircle, RefreshCw } from 'lucide-react'
import type { TwitterUser } from '../lib/api'

interface TwitterConnectProps {
  isConnected: boolean
  user: TwitterUser | null
  onConnect: () => void
  onDisconnect: () => void
  onRefresh: () => void
}

export default function TwitterConnect({ isConnected, user, onConnect, onDisconnect, onRefresh }: TwitterConnectProps) {
  if (isConnected && user) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group overflow-hidden rounded-full">
              {user.profile_image_url ? (
                <img 
                  src={user.profile_image_url} 
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-white/50 group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Twitter className="w-7 h-7" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">@{user.username}</h3>
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold tracking-tighter">VERIFIED HUB</span>
              </div>
              <p className="text-blue-100 text-sm tracking-tight">{user.name}</p>
              {user.public_metrics && (
                <div className="flex gap-4 mt-1.5 text-xs text-white/90 font-bold">
                  <span className="flex flex-col"><span className="text-sm">{user.public_metrics.followers_count.toLocaleString()}</span> <span className="text-[10px] opacity-60">FOLLOWERS</span></span>
                  <span className="flex flex-col"><span className="text-sm">{user.public_metrics.following_count.toLocaleString()}</span> <span className="text-[10px] opacity-60">FOLLOWING</span></span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold border border-white/10 hover:border-white/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Stats
            </button>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-red-400/20 hover:bg-red-400/40 rounded-xl transition-all text-xs font-bold border border-red-400/20 hover:border-red-400/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">Connect Your Twitter Account</h3>
          <p className="text-amber-700 text-sm mt-1">
            Connect your Twitter account to enable automated posting, scheduling, and real-time analytics.
          </p>
          <button
            onClick={onConnect}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Twitter className="w-5 h-5" />
            Connect with X
          </button>
        </div>
      </div>
    </div>
  )
}
