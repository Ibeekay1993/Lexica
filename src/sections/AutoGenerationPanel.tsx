import { Sparkles, Bell, Clock, Lightbulb, Zap } from 'lucide-react'
import { Switch } from '../components/ui/switch'

interface AutoGenerationPanelProps {
  autoGenerate: boolean
  onAutoGenerateChange: (value: boolean) => void
  notifications: boolean
  onNotificationsChange: (value: boolean) => void
  countdown: string
  onGenerateNow: () => void
  frequency: number
  onFrequencyChange: (value: number) => void
}

export default function AutoGenerationPanel({
  autoGenerate,
  onAutoGenerateChange,
  notifications,
  onNotificationsChange,
  countdown,
  onGenerateNow,
  frequency,
  onFrequencyChange
}: AutoGenerationPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden transition-all duration-300" style={{ animationDelay: '100ms' }}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900">Auto-Generation</h3>
        </div>
        <div className="flex items-center gap-2">
           <select 
             value={frequency} 
             onChange={(e) => onFrequencyChange(Number(e.target.value))}
             className="text-[10px] uppercase tracking-wider font-bold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-600 focus:outline-none"
           >
             <option value={15}>15 MINS</option>
             <option value={30}>30 MINS</option>
             <option value={60}>60 MINS</option>
           </select>
           <span className={`
            px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-tighter
            ${autoGenerate 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
            }
          `}>
            {autoGenerate ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm italic">Auto-Pulse Generation</p>
              <p className="text-xs text-muted-foreground">AI wakes up every {frequency} mins</p>
            </div>
          </div>
          <Switch
            checked={autoGenerate}
            onCheckedChange={onAutoGenerateChange}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm italic">Web Notifications</p>
              <p className="text-xs text-muted-foreground">Alert when content is ready</p>
            </div>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={onNotificationsChange}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>
        
        <div className="flex flex-col gap-2 p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl border border-blue-400 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform group-hover:rotate-12">
            <Clock className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Next Live Generation In</p>
            <div className="flex items-center gap-3">
               <div className="text-4xl font-black font-mono text-white tracking-widest drop-shadow-md">
                 {countdown}
               </div>
               <div className="flex flex-col">
                  <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black text-white italic">PULSE: ON</div>
               </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onGenerateNow}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]"
        >
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          FORCE GENERATE CLOUD CONTENT
        </button>
        
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-tight">
            Normally! Keep this tab open. Every {frequency} mins, your browser will <b>Automatically Wake Up</b> and open your next tweet!
          </p>
        </div>
      </div>
    </div>
  )
}
