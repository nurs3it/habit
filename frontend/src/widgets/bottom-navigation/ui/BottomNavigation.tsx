import { Link, useLocation } from 'react-router-dom'
import { Home, List, BarChart3, Settings } from 'lucide-react'
import { cn } from '@shared/lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Today' },
  { path: '/habits', icon: List, label: 'Habits' },
  { path: '/insights', icon: BarChart3, label: 'Insights' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNavigation() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-14 min-h-[44px] max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] transition-colors active:opacity-70',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
