import { ReactNode } from 'react'
import { cn } from '@shared/lib/utils'

interface AuthLayoutProps {
  title: string
  description: string
  hero?: ReactNode
  children: ReactNode
  className?: string
}

export function AuthLayout({
  title,
  description,
  hero,
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-[100dvh] flex flex-col px-4 relative overflow-hidden',
        'pb-[max(env(safe-area-inset-bottom),1rem)]',
        'bg-gradient-to-b from-primary/5 via-background to-background',
        'dark:from-primary/10 dark:via-background dark:to-background',
        className
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20"
        aria-hidden
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[200px] h-[200px] rounded-full bg-primary/10 blur-2xl" />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain relative z-10">
        <header className="flex-shrink-0 pt-6 pb-4">
          {hero && (
            <div className="mb-6 flex justify-center animate-auth-hero-float">
              {hero}
            </div>
          )}
          <h1
            className="text-[28px] font-bold tracking-tight text-foreground leading-tight animate-auth-fade-in-up"
            style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
          >
            {title}
          </h1>
          <p
            className="mt-2 text-[15px] text-muted-foreground leading-snug max-w-[300px] animate-auth-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
          >
            {description}
          </p>
        </header>
        <main className="flex-1 min-h-0 flex flex-col">{children}</main>
      </div>
    </div>
  )
}
