import { Rocket, Zap, RefreshCw, LogOut } from 'lucide-react'

interface HeaderProps {
  onRefresh?: () => void
  onLogout?: () => void
}

export default function Header({ onRefresh, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text leading-none mb-1">
                TweetForge Pro
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Live Cloud Automation Engine
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all border border-transparent hover:border-blue-100"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Refresh Data</span>
              </button>
            )}
            
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm mr-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-700 tracking-tight uppercase">Cloud Sync: Online</span>
            </div>

            {onLogout && (
              <button 
                onClick={onLogout}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                title="Logout Commander"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
