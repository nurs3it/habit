import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@shared/lib/utils'

type ToastType = 'default' | 'success' | 'destructive'

interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { toast: () => {} }
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const [nextId, setNextId] = useState(0)

  const toast = useCallback((message: string, type: ToastType = 'default') => {
    const id = nextId
    setNextId((n) => n + 1)
    setMessages((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 3000)
  }, [nextId])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed left-4 right-4 top-0 z-[100] flex flex-col gap-2 pt-[max(env(safe-area-inset-top),0.75rem)] pointer-events-none"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'rounded-[10px] border px-4 py-3 text-[15px] font-medium shadow-lg backdrop-blur-xl animate-auth-fade-in-up',
                  m.type === 'default' && 'bg-card/95 border-border/80 text-foreground',
                  m.type === 'success' && 'bg-primary/15 border-primary/30 text-primary dark:bg-primary/25',
                  m.type === 'destructive' && 'bg-destructive/15 border-destructive/30 text-destructive dark:bg-destructive/25'
                )}
              >
                {m.message}
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}
