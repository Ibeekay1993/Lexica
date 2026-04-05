import { Rocket, Zap, RefreshCw, LogOut } from 'lucide-react'

interface HeaderProps {
  onRefresh?: () => void
  onLogout?: () => void
  isConnected?: boolean
}

export default function Header({ onRefresh, onLogout, isConnected }: HeaderProps) {
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
              <h1 className="text-xl font-black text-slate-800 tracking-tighter italic leading-none mb-1 uppercase">
                KIMI AI COMMANDER
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-70">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                DEEP CONTEXT CLOUD ENGINE
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
            
            <div className={`flex items-center gap-2 px-4 py-2 ${isConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} border rounded-full shadow-sm mr-1`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className={`text-xs font-bold ${isConnected ? 'text-emerald-700' : 'text-amber-700'} tracking-tight uppercase`}>
                {isConnected ? 'Identity Active' : 'Commander Searching'}
              </span>
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
