import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(
  undefined
)

function usePopover() {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error('Popover components must be used within a <Popover />')
  }
  return context
}

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

function Popover({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
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
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = usePopover()

  const combinedRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
    },
    [ref, triggerRef]
  )

  return (
    <button
      ref={combinedRef}
      aria-expanded={open}
      onClick={(e) => {
        setOpen(!open)
        onClick?.(e)
      }}
      {...props}
    />
  )
})
PopoverTrigger.displayName = 'PopoverTrigger'

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  side?: 'top' | 'bottom'
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'center', sideOffset = 4, side = 'bottom', ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover()
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [position, setPosition] = React.useState({ top: 0, left: 0 })

    React.useEffect(() => {
      if (!open || !triggerRef.current) return

      const updatePosition = () => {
        const rect = triggerRef.current!.getBoundingClientRect()
        const top =
          side === 'bottom'
            ? rect.bottom + sideOffset + window.scrollY
            : rect.top - sideOffset + window.scrollY

        let left: number
        if (align === 'start') {
          left = rect.left + window.scrollX
        } else if (align === 'end') {
          left = rect.right + window.scrollX
        } else {
          left = rect.left + rect.width / 2 + window.scrollX
        }

        setPosition({ top, left })
      }

      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
      }
    }, [open, triggerRef, align, side, sideOffset])

    React.useEffect(() => {
      if (!open) return

      const handleClickOutside = (e: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setOpen(false)
        }
      }

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [open, setOpen, triggerRef])

    if (!open) return null

    const alignStyle: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      ...(align === 'center' && { transform: 'translateX(-50%)' }),
      ...(align === 'end' && { transform: 'translateX(-100%)' }),
      ...(side === 'top' && { transform: `${align === 'center' ? 'translateX(-50%) ' : align === 'end' ? 'translateX(-100%) ' : ''}translateY(-100%)` }),
    }

    return createPortal(
      <div
        ref={(node) => {
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        style={alignStyle}
        className={cn(
          'z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        {...props}
      />,
      document.body
    )
  }
)
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverContent }
