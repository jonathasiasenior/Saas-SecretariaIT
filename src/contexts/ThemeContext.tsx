import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import type { Theme } from '@/lib/constants'
import { THEMES } from '@/lib/constants'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored && THEMES.includes(stored as Theme)) return stored as Theme
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const { user } = useAuth()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Load theme from DB when user logs in
  useEffect(() => {
    if (!user) return
    supabase
      .from('user_settings')
      .select('theme')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const row = data as { theme: string } | null
        if (row?.theme && THEMES.includes(row.theme as Theme)) {
          setThemeState(row.theme as Theme)
          localStorage.setItem('theme', row.theme)
        }
      })
  }, [user])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    // Sync to DB if authenticated
    if (user) {
      supabase
        .from('user_settings')
        .update({ theme: newTheme } as never)
        .eq('id', user.id)
        .then(() => {})
    }
  }, [user])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
