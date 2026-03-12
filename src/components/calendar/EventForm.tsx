import { useState } from 'react'
import { X } from 'lucide-react'
import type { CalendarEvent } from '@/types/database'
import { EVENT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface EventFormProps {
  event?: CalendarEvent | null
  defaultDate?: Date
  onSubmit: (data: {
    title: string
    description: string
    location: string
    start_at: string
    end_at: string
    all_day: boolean
    color: string
    source: 'manual'
  }) => void
  onClose: () => void
  isSubmitting?: boolean
}

export function EventForm({ event, defaultDate, onSubmit, onClose, isSubmitting }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [location, setLocation] = useState(event?.location || '')
  const [startAt, setStartAt] = useState(
    event?.start_at
      ? format(new Date(event.start_at), "yyyy-MM-dd'T'HH:mm")
      : defaultDate
        ? format(defaultDate, "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [endAt, setEndAt] = useState(
    event?.end_at ? format(new Date(event.end_at), "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [allDay, setAllDay] = useState(event?.all_day || false)
  const [color, setColor] = useState(event?.color || '#8B5CF6')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !startAt) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      start_at: new Date(startAt).toISOString(),
      end_at: endAt ? new Date(endAt).toISOString() : '',
      all_day: allDay,
      color,
      source: 'manual',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{event ? 'Editar Evento' : 'Novo Evento'}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião com equipe"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Início *</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startAt.split('T')[0] : startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fim</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endAt.split('T')[0] : endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label htmlFor="allDay" className="text-sm">Dia inteiro</label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Local</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Sala de reuniões"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do evento..."
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cor</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-all',
                    color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : event ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
