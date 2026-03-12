import { MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import type { CalendarEvent } from '@/types/database'

interface EventCardProps {
  event: CalendarEvent
  compact?: boolean
  onClick: () => void
}

export function EventCard({ event, compact = false, onClick }: EventCardProps) {
  const startTime = format(new Date(event.start_at), 'HH:mm')

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-accent/50 transition-colors text-left"
      >
        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
        <span className="truncate font-medium">{startTime} {event.title}</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full h-full flex-col gap-0.5 rounded-lg border border-transparent p-2 text-left text-sm transition-all hover:border-border hover:shadow-md overflow-hidden cursor-pointer"
      style={{ backgroundColor: `${event.color}25`, borderLeftColor: event.color, borderLeftWidth: 3 }}
    >
      <span className="font-semibold truncate text-[13px] leading-tight">{event.title}</span>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          {startTime}
          {event.end_at && ` - ${format(new Date(event.end_at), 'HH:mm')}`}
        </span>
        {event.location && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {event.location}
          </span>
        )}
      </div>
    </button>
  )
}
