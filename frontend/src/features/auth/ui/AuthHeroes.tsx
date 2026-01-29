import { cn } from '@shared/lib/utils'

export function LoginHero({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-20 h-20 rounded-2xl flex items-center justify-center',
        'bg-primary/10 dark:bg-primary/20 border border-primary/20',
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 80 64"
        fill="none"
        className="w-10 h-10 text-primary"
        aria-hidden
      >
        <circle cx="16" cy="32" r="9" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.2" />
        <path
          d="M12 32l2.5 2.5 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="32" r="9" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.2" />
        <path
          d="M36 32l2.5 2.5 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="64" cy="32" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 2" />
      </svg>
    </div>
  )
}
