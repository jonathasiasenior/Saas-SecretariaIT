import { format, isToday, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/database'
import { EventCard } from './EventCard'

interface DayColumnProps {
  date: Date
  events: CalendarEvent[]
  compact?: boolean
  onEventClick: (event: CalendarEvent) => void
  onAddEvent?: (date: Date) => void
  showTimeLabels?: boolean
}

const HOUR_HEIGHT = 60 // px por hora
const START_HOUR = 6 // começa às 6h
const END_HOUR = 24 // vai até 00h
const TOTAL_HOURS = END_HOUR - START_HOUR

function getEventPosition(event: CalendarEvent) {
  const start = new Date(event.start_at)
  const startHour = start.getHours() + start.getMinutes() / 60
  const top = Math.max(0, (startHour - START_HOUR) * HOUR_HEIGHT)

  let duration = 1 // duração padrão: 1 hora
  if (event.end_at) {
    const end = new Date(event.end_at)
    duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }
  const height = Math.max(30, duration * HOUR_HEIGHT) // mínimo 30px

  return { top, height }
}

export function DayColumn({ date, events, compact = false, onEventClick, onAddEvent, showTimeLabels = false }: DayColumnProps) {
  const today = isToday(date)
  const dayEvents = events
    .filter((e) => isSameDay(new Date(e.start_at), date))
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  if (compact) {
    return (
      <div className="flex flex-col min-h-[100px]">
        <div
          className={cn(
            'sticky top-0 z-10 flex flex-col items-center py-2 text-center border-b border-border bg-background/90 backdrop-blur-sm cursor-pointer hover:bg-accent/30 transition-colors',
            today && 'bg-primary/5'
          )}
          onClick={() => onAddEvent?.(date)}
        >
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {format(date, 'EEE', { locale: ptBR })}
          </span>
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
              today && 'bg-primary text-primary-foreground'
            )}
          >
            {format(date, 'd')}
          </span>
        </div>
        <div className="flex-1 space-y-0.5 p-1">
          {dayEvents.map((event) => (
            <EventCard key={event.id} event={event} compact onClick={() => onEventClick(event)} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Day header */}
      <div
        className={cn(
          'sticky top-0 z-10 flex flex-col items-center py-2 text-center border-b border-border bg-background/90 backdrop-blur-sm cursor-pointer hover:bg-accent/30 transition-colors',
          today && 'bg-primary/5'
        )}
        onClick={() => onAddEvent?.(date)}
      >
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {format(date, 'EEEE', { locale: ptBR })}
        </span>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
            today && 'bg-primary text-primary-foreground'
          )}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Time grid with events */}
      <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
        {/* Hour lines */}
        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-border/40"
            style={{ top: i * HOUR_HEIGHT }}
          >
            {showTimeLabels && (
              <span className="absolute -top-3 -left-14 w-12 text-right text-[11px] text-muted-foreground">
                {String(START_HOUR + i).padStart(2, '0')}:00
              </span>
            )}
          </div>
        ))}

        {/* Half-hour lines */}
        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
          <div
            key={`half-${i}`}
            className="absolute left-0 right-0 border-t border-border/20 border-dashed"
            style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
          />
        ))}

        {/* Current time indicator */}
        {today && (() => {
          const now = new Date()
          const currentHour = now.getHours() + now.getMinutes() / 60
          if (currentHour >= START_HOUR && currentHour <= END_HOUR) {
            const top = (currentHour - START_HOUR) * HOUR_HEIGHT
            return (
              <div className="absolute left-0 right-0 z-20" style={{ top }}>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 -ml-1.5" />
                  <div className="flex-1 h-0.5 bg-red-500" />
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* Events positioned by time */}
        {dayEvents.map((event) => {
          const { top, height } = getEventPosition(event)
          return (
            <div
              key={event.id}
              className="absolute left-1 right-1 z-10"
              style={{ top, height }}
            >
              <EventCard event={event} onClick={() => onEventClick(event)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
