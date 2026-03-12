export const APP_NAME = 'Secretária Inteligente'

export const THEMES = ['dark', 'light', 'purple', 'blue'] as const
export type Theme = (typeof THEMES)[number]

export const THEME_LABELS: Record<Theme, string> = {
  dark: 'Escuro',
  light: 'Claro',
  purple: 'Roxo',
  blue: 'Azul',
}

export const THEME_COLORS: Record<Theme, string> = {
  dark: '#8B5CF6',
  light: '#7C3AED',
  purple: '#A855F7',
  blue: '#3B82F6',
}

export const CALENDAR_VIEWS = ['1d', '3d', '7d', '1m'] as const
export type CalendarView = (typeof CALENDAR_VIEWS)[number]

export const CALENDAR_VIEW_LABELS: Record<CalendarView, string> = {
  '1d': '1 Dia',
  '3d': '3 Dias',
  '7d': 'Semana',
  '1m': 'Mês',
}

export const MAX_AUDIO_DURATION = 60 // seconds
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB

export const EVENT_COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

export const PROCESSING_POLL_INTERVAL = 3000 // ms
