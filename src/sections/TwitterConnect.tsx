import { Twitter, Check, LogOut, AlertCircle } from 'lucide-react'
import type { TwitterUser } from '../lib/api'

interface TwitterConnectProps {
  isConnected: boolean
  user: TwitterUser | null
  onConnect: () => void
  onDisconnect: () => void
}

export default function TwitterConnect({ isConnected, user, onConnect, onDisconnect }: TwitterConnectProps) {
  if (isConnected && user) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg mb-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.profile_image_url ? (
                <img 
                  src={user.profile_image_url} 
                  alt={user.name}
                  className="w-14 h-14 rounded-full border-2 border-white/50"
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
              <h3 className="font-bold text-lg">@{user.username}</h3>
              <p className="text-blue-100 text-sm">{user.name}</p>
              {user.public_metrics && (
                <div className="flex gap-4 mt-1 text-xs text-blue-100">
                  <span>{user.public_metrics.followers_count.toLocaleString()} followers</span>
                  <span>{user.public_metrics.following_count.toLocaleString()} following</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
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
