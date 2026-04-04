import { useEffect, useState, useRef } from 'react'
import { FileText, Clock, CheckCircle, MessageSquareQuote } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    total: number
    queued: number
    posted: number
    quotes: number
  }
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  gradient: string
  iconBg: string
  delay: number
}

function AnimatedCounter({ value, delay }: { value: number; delay: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return <span ref={ref}>{count}</span>
}

function StatCard({ icon, label, value, iconBg, delay }: StatCardProps) {
  return (
    <div 
      className="relative group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-soft card-hover overflow-hidden">
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${iconBg} rounded-full opacity-10 blur-2xl`} />
        
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900">
              <AnimatedCounter value={value} delay={delay} />
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
        </div>
        
        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${iconBg} rounded-full transition-all duration-1000 ease-out`}
            style={{ 
              width: `${Math.min((value / 20) * 100, 100)}%`,
              transitionDelay: `${delay + 500}ms`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      label: 'Total Tweets',
      value: stats.total,
      gradient: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20',
      iconBg: 'bg-blue-500',
      delay: 0,
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      label: 'Queued',
      value: stats.queued,
      gradient: 'bg-gradient-to-r from-amber-500/20 to-amber-600/20',
      iconBg: 'bg-amber-500',
      delay: 100,
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      label: 'Posted',
      value: stats.posted,
      gradient: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20',
      iconBg: 'bg-emerald-500',
      delay: 200,
    },
    {
      icon: <MessageSquareQuote className="w-6 h-6 text-purple-600" />,
      label: 'Quote Tweets',
      value: stats.quotes,
      gradient: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20',
      iconBg: 'bg-purple-500',
      delay: 300,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  )
}
