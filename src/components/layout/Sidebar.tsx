import { NavLink } from 'react-router-dom'
import { CalendarDays, FileText, Settings, Shield, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

const navItems = [
  { to: '/', label: 'Dashboard', icon: CalendarDays },
  { to: '/notes', label: 'Anotações', icon: FileText },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          SI
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">{APP_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-accent/50'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        {profile?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-accent/50'
              )
            }
          >
            <Shield className="h-5 w-5" />
            Admin
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{profile?.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
