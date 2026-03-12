import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const diffHours = Math.round(diffMs / 3600000)
  const diffDays = Math.round(diffMs / 86400000)

  if (Math.abs(diffMins) < 1) return 'agora'
  if (Math.abs(diffMins) < 60) return `${diffMins > 0 ? 'em' : 'há'} ${Math.abs(diffMins)}min`
  if (Math.abs(diffHours) < 24) return `${diffHours > 0 ? 'em' : 'há'} ${Math.abs(diffHours)}h`
  if (Math.abs(diffDays) < 7) return `${diffDays > 0 ? 'em' : 'há'} ${Math.abs(diffDays)}d`

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function generateId(): string {
  return crypto.randomUUID()
}
