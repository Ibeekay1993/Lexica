import { useState } from 'react'
import { Twitter, X, Search, Rocket, ShieldCheck, Zap } from 'lucide-react'

interface ConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (handle: string) => void
}

export default function ConnectModal({ isOpen, onClose, onConnect }: ConnectModalProps) {
  const [handle, setHandle] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle) return
    
    setIsSearching(true)
    // Small delay for the "Premium Search" feel
    setTimeout(() => {
      onConnect(handle)
      setIsSearching(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop with Heavy Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* The Modal */}
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20">
        
        {/* Top Gradient Banner */}
        <div className="h-32 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-4 left-10 w-24 h-24 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-4 right-10 w-32 h-32 bg-white rounded-full blur-3xl" />
           </div>
           
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-all"
           >
              <X className="w-5 h-5" />
           </button>
           
           <div className="absolute -bottom-10 left-10 w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center rotate-6 border-4 border-white">
              <Twitter className="w-12 h-12 text-blue-500" />
           </div>
        </div>

        <div className="p-8 pt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Connect X Identity</h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Link your digital fingerprint to activate the **Automated Pulse Engine**. Your stats will sync in real-time across all devices.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 ml-1">Your X @Username</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">@</div>
                <input 
                  type="text"
                  required
                  autoFocus
                  placeholder="IsrealAfolayan"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace('@', ''))}
                  className="w-full pl-10 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-800 text-lg shadow-inner"
                />
                
                {handle && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Ready</div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase leading-snug">Secure Sync<br/><span className="text-slate-900">Encrypted</span></div>
               </div>
               <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                     <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase leading-snug">Live Pulse<br/><span className="text-slate-900">Sub-second</span></div>
               </div>
            </div>

            <button 
              disabled={isSearching || !handle}
              className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50"
            >
              {isSearching ? (
                 <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Searching X Cloud...
                 </div>
              ) : (
                <div className="flex items-center gap-3">
                   Initiate Sync
                   <Rocket className="w-5 h-5 animate-pulse" />
                </div>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
             <Search className="w-3 h-3" />
             Verified by TweetForge Global Scraper
          </p>
        </div>
      </div>
    </div>
  )
}
