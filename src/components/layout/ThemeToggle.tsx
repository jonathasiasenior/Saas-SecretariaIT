import { useTheme } from '@/contexts/ThemeContext'
import { THEMES, THEME_LABELS, THEME_COLORS } from '@/lib/constants'
import type { Theme } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      {THEMES.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t as Theme)}
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all',
            theme === t
              ? 'border-primary bg-accent shadow-sm'
              : 'border-transparent hover:border-border hover:bg-muted/50'
          )}
        >
          <span
            className="h-8 w-8 rounded-full border-2 border-border shadow-inner"
            style={{ backgroundColor: THEME_COLORS[t as Theme] }}
          />
          <span className="text-xs font-medium">{THEME_LABELS[t as Theme]}</span>
        </button>
      ))}
    </div>
  )
}
