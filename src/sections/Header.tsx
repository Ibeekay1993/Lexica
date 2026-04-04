import { Rocket, Zap } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                TweetForge Pro
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Auto Tweet Generator + Smart Reply Bot
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-emerald-700">Active</span>
          </div>
        </div>
      </div>
    </header>
  )
}
