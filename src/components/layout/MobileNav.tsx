import { NavLink } from 'react-router-dom'
import { CalendarDays, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Agenda', icon: CalendarDays },
  { to: '/notes', label: 'Notas', icon: FileText },
  { to: '/settings', label: 'Config', icon: Settings },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
