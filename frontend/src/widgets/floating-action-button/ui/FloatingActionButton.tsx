import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@shared/lib/utils'

interface FloatingActionButtonProps {
  onClick?: () => void
  className?: string
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate('/habits/create')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] right-4 z-40',
        'h-14 min-h-[56px] rounded-[28px]',
        'bg-primary text-primary-foreground',
        'shadow-lg shadow-primary/25',
        'flex items-center justify-center gap-2',
        'transition-all duration-300 ease-out',
        'overflow-hidden',
        'w-14 hover:w-auto hover:px-4 pl-2',
        'active:scale-95 active:opacity-90',
        'hover:shadow-xl hover:shadow-primary/30',
        className
      )}
      aria-label="Create new habit"
    >
      <Plus className="w-6 h-6 shrink-0" strokeWidth={2.5} />
      <span className="text-[17px] font-semibold whitespace-nowrap opacity-0 max-w-0 overflow-hidden transition-all duration-300 ease-out group-hover:opacity-100 group-hover:max-w-[200px] group-hover:ml-2">
        Create new habit
      </span>
    </button>
  )
}
