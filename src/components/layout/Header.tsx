import { useLocation } from 'react-router-dom'
import { Bell, Palette } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { THEMES, THEME_LABELS, THEME_COLORS } from '@/lib/constants'
import type { Theme } from '@/lib/constants'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/notes': 'Anotações',
  '/settings': 'Configurações',
  '/admin': 'Administração',
}

export function Header() {
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()

  const title = pageTitles[pathname] || 'Dashboard'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        {/* Theme toggle */}
        <div className="relative group">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <Palette className="h-5 w-5" />
          </button>
          <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-popover p-1 shadow-lg transition-all z-50">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t as Theme)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  theme === t ? 'bg-accent text-accent-foreground' : 'text-popover-foreground hover:bg-accent/50'
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: THEME_COLORS[t as Theme] }}
                />
                {THEME_LABELS[t as Theme]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
