import * as React from 'react'
import { createPortal } from 'react-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(
  undefined
)

function useSheet() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error('Sheet components must be used within a <Sheet />')
  }
  return context
}

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

function Sheet({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useSheet()
  return (
    <button
      ref={ref}
      onClick={(e) => {
        setOpen(true)
        onClick?.(e)
      }}
      {...props}
    />
  )
})
SheetTrigger.displayName = 'SheetTrigger'

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b border-border',
        bottom: 'inset-x-0 bottom-0 border-t border-border',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r border-border sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l border-border sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
)

interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const { open, setOpen } = useSheet()
    const [mounted, setMounted] = React.useState(false)
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
      if (open) {
        setMounted(true)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true)
          })
        })
        document.body.style.overflow = 'hidden'
      } else {
        setVisible(false)
        const timer = setTimeout(() => setMounted(false), 300)
        document.body.style.overflow = ''
        return () => clearTimeout(timer)
      }
      return () => {
        document.body.style.overflow = ''
      }
    }, [open])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
      }
      if (open) {
        document.addEventListener('keydown', handleEscape)
      }
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, setOpen])

    if (!mounted) return null

    const translateClass = {
      top: visible ? 'translate-y-0' : '-translate-y-full',
      bottom: visible ? 'translate-y-0' : 'translate-y-full',
      left: visible ? 'translate-x-0' : '-translate-x-full',
      right: visible ? 'translate-x-0' : 'translate-x-full',
    }

    return createPortal(
      <>
        <div
          className={cn(
            'fixed inset-0 z-50 bg-black/80 transition-opacity duration-300',
            visible ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          ref={ref}
          className={cn(
            sheetVariants({ side }),
            translateClass[side || 'right'],
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
      </>,
      document.body
    )
  }
)
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
SheetDescription.displayName = 'SheetDescription'

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useSheet()
  return (
    <button
      ref={ref}
      onClick={(e) => {
        setOpen(false)
        onClick?.(e)
      }}
      {...props}
    />
  )
})
SheetClose.displayName = 'SheetClose'

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
}
