import { FileText, MessageCircle, BarChart3, Calendar } from 'lucide-react'

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'tweets', label: 'Tweets', icon: FileText, count: 14 },
  { id: 'replies', label: 'Replies', icon: MessageCircle, count: null },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
  { id: 'schedule', label: 'Schedule', icon: Calendar, count: null },
]

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-soft inline-flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-300 ease-out
              ${isActive 
                ? 'text-white shadow-lg' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            {isActive && (
              <span className="absolute inset-0 gradient-primary rounded-xl" />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`
                  ml-1 px-2 py-0.5 text-xs rounded-full
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 text-slate-600'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
