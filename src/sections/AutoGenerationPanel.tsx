import { Sparkles, Bell, Clock, Play, Lightbulb } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface AutoGenerationPanelProps {
  autoGenerate: boolean
  onAutoGenerateChange: (value: boolean) => void
  notifications: boolean
  onNotificationsChange: (value: boolean) => void
  countdown: string
  onGenerateNow: () => void
}

export default function AutoGenerationPanel({
  autoGenerate,
  onAutoGenerateChange,
  notifications,
  onNotificationsChange,
  countdown,
  onGenerateNow,
}: AutoGenerationPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden" style={{ animationDelay: '100ms' }}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900">Auto-Generation</h3>
        </div>
        <span className={`
          px-3 py-1 text-xs font-medium rounded-full
          ${autoGenerate 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-100 text-slate-600 border border-slate-200'
          }
        `}>
          {autoGenerate ? 'Active' : 'Paused'}
        </span>
      </div>
      
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Hourly Auto-Generate</p>
              <p className="text-sm text-muted-foreground">New tweet every hour automatically</p>
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
              <p className="font-medium text-slate-900">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified when tweets are ready</p>
            </div>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={onNotificationsChange}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Next tweet in</p>
              <p className="text-sm text-muted-foreground">Auto-generation countdown</p>
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600">
            {countdown}
          </div>
        </div>
        
        <button
          onClick={onGenerateNow}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-4 h-4" />
          Generate Now
        </button>
        
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Keep this tab open — you'll get notified when tweets are ready to copy & paste!
          </p>
        </div>
      </div>
    </div>
  )
}
