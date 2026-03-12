import { X, MapPin, Clock, Calendar, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import type { CalendarEvent } from '@/types/database'

interface EventDetailDialogProps {
  event: CalendarEvent
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function EventDetailDialog({ event, onClose, onEdit, onDelete }: EventDetailDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: event.color }} />
            <h2 className="text-lg font-semibold">{event.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.start_at), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {event.all_day
                ? 'Dia inteiro'
                : `${format(new Date(event.start_at), 'HH:mm')}${event.end_at ? ` - ${format(new Date(event.end_at), 'HH:mm')}` : ''}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}

          {event.description && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {event.source !== 'manual' && event.raw_input && (
            <div className="mt-3 rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Entrada original ({event.source === 'voice' ? 'voz' : 'texto'}):</p>
              <p className="text-xs italic">{event.raw_input}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
