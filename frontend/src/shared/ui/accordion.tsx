import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@shared/lib/utils'

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

interface AccordionItemProps {
  children: React.ReactNode
  className?: string
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

export const Accordion = React.forwardRef<
  { close: () => void },
  AccordionProps
>(({ children, className }, ref) => {
  const [open, setOpen] = React.useState(false)
  const contextValue = React.useMemo(() => ({ open, setOpen }), [open])
  
  React.useImperativeHandle(ref, () => ({
    close: () => setOpen(false)
  }))
  
  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('border rounded-[10px] overflow-hidden border-border/80', className)} data-state={open ? 'open' : 'closed'}>{children}</div>
    </AccordionContext.Provider>
  )
})
Accordion.displayName = 'Accordion'

export function AccordionItem({ children, className }: AccordionItemProps) {
  return <div className={cn('', className)}>{children}</div>
}

export function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps) {
  const { open, setOpen } = React.useContext(AccordionContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'flex w-full items-center justify-between min-h-[44px] px-4 py-3 text-[17px] font-medium transition-colors hover:bg-accent/50 active:bg-accent [&[data-state=open]>svg]:rotate-180',
        className
      )}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  )
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { open } = React.useContext(AccordionContext)
  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      <div className={cn('p-4 pt-0', className)}>{children}</div>
    </div>
  )
}
