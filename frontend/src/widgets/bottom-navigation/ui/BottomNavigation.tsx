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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
