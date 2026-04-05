import { useState } from 'react'
import { Rocket, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'
import { toast } from 'sonner'

interface AuthProps {
  onSuccess: () => void
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = isLogin 
        ? await api.signIn(email, password)
        : await api.signUp(email, password)
      
      if (error) {
         toast.error(error.message)
      } else {
         toast.success(isLogin ? 'Welcome back, Commander!' : 'Empire Account created!')
         onSuccess()
      }
    } catch (e) {
      toast.error('Auth failed. Check connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-[1.8rem] bg-slate-900 mx-auto mb-6 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform shadow-xl">
               <Rocket className="w-10 h-10 text-blue-400 fill-blue-400/20" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 italic">TWEETFORGE PRO</h1>
            <p className="text-slate-500 text-sm font-medium">Log into the Live Cloud Empire</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 ml-1">Email Address</label>
               <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                    placeholder="name@empire.com"
                  />
               </div>
            </div>

            <div>
               <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 ml-1">Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                    placeholder="••••••••"
                  />
               </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Launch Dashboard' : 'Initiate Signup')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-8 text-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Contact Admin" : "Already have an account? Login"}
          </button>
          
          <div className="mt-8 pt-8 border-t border-slate-50 flex items-start gap-3">
             <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-amber-500" />
             </div>
             <div>
                <p className="text-[11px] font-black text-amber-800 uppercase tracking-wider mb-1">Commander Note</p>
                <p className="text-[10px] text-amber-600 leading-tight">By logging in, you agree to the Automated Cloud Terms. Use respectfully on X.</p>
             </div>
          </div>
        </div>
        
        <div className="mt-8 text-center flex items-center justify-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Live Empire Cloud v2.0</p>
        </div>
      </div>
    </div>
  )
}
