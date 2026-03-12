import { useState, useRef, useEffect } from 'react'
import { addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from 'date-fns'
import { Plus } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { useCalendarView } from '@/hooks/useCalendarView'
import { CalendarFilters } from './CalendarFilters'
import { DayColumn } from './DayColumn'
import { EventForm } from './EventForm'
import { EventDetailDialog } from './EventDetailDialog'
import type { CalendarEvent } from '@/types/database'
import { toast } from 'sonner'

const HOUR_HEIGHT = 60
const START_HOUR = 6

export function CalendarView() {
  const { view, setView, currentDate, goNext, goPrev, goToToday } = useCalendarView()
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents(currentDate, view)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createDate, setCreateDate] = useState<Date | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current && view !== '1m') {
      const now = new Date()
      const currentHour = now.getHours()
      const scrollTo = Math.max(0, (currentHour - START_HOUR - 1) * HOUR_HEIGHT)
      scrollRef.current.scrollTop = scrollTo
    }
  }, [view, currentDate])

  const getDays = (): Date[] => {
    switch (view) {
      case '1d':
        return [startOfDay(currentDate)]
      case '3d':
        return [0, 1, 2].map((i) => addDays(startOfDay(currentDate), i))
      case '7d': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      }
      case '1m': {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        return eachDayOfInterval({ start: monthStart, end: monthEnd })
      }
    }
  }

  const days = getDays()

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createEvent.mutateAsync({
        ...data,
        raw_input: null,
        notify_24h: true,
        notify_8h: true,
        notify_1h: true,
      } as never)
      setShowCreateForm(false)
      toast.success('Evento criado!')
    } catch {
      toast.error('Erro ao criar evento')
    }
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingEvent) return
    try {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...data } as never)
      setEditingEvent(null)
      toast.success('Evento atualizado!')
    } catch {
      toast.error('Erro ao atualizar evento')
    }
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    try {
      await deleteEvent.mutateAsync(selectedEvent.id)
      setSelectedEvent(null)
      toast.success('Evento removido!')
    } catch {
      toast.error('Erro ao remover evento')
    }
  }

  const handleAddEvent = (date: Date) => {
    setCreateDate(date)
    setShowCreateForm(true)
  }

  const TOTAL_HOURS = 24 - START_HOUR

  return (
    <div className="space-y-4">
      <CalendarFilters
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToToday}
      />

      {/* Add event button */}
      <button
        onClick={() => {
          setCreateDate(undefined)
          setShowCreateForm(true)
        }}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" />
        Novo Evento
      </button>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="grid gap-px rounded-xl border border-border bg-border overflow-hidden" style={{ gridTemplateColumns: `repeat(${Math.min(days.length, 7)}, 1fr)` }}>
          {days.slice(0, 7).map((_, i) => (
            <div key={i} className="bg-card p-4 space-y-2">
              <div className="h-4 w-12 rounded bg-muted animate-pulse mx-auto" />
              <div className="h-6 w-6 rounded-full bg-muted animate-pulse mx-auto" />
              <div className="space-y-1">
                <div className="h-8 rounded bg-muted animate-pulse" />
                <div className="h-8 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : view === '1m' ? (
        /* Month view - grid compacto */
        <div className="grid grid-cols-7 gap-px rounded-xl border border-border bg-border overflow-hidden">
          {days.map((day) => (
            <div key={day.toISOString()} className="bg-card">
              <DayColumn
                date={day}
                events={events}
                compact
                onEventClick={setSelectedEvent}
                onAddEvent={handleAddEvent}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Day/3-day/Week view com grade de horas */
        <div
          ref={scrollRef}
          className="rounded-xl border border-border bg-card overflow-auto"
          style={{ maxHeight: 'calc(100vh - 250px)' }}
        >
          <div className="flex min-w-0">
            {/* Time labels column */}
            <div className="flex-shrink-0 w-14 border-r border-border">
              {/* Spacer for header */}
              <div className="h-[72px] border-b border-border" />
              {/* Hour labels */}
              <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                  <div
                    key={i}
                    className="absolute right-2 text-[11px] text-muted-foreground"
                    style={{ top: i * HOUR_HEIGHT - 7 }}
                  >
                    {String(START_HOUR + i).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Day columns */}
            <div
              className="flex-1 grid min-w-0"
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              {days.map((day, idx) => (
                <div
                  key={day.toISOString()}
                  className={idx < days.length - 1 ? 'border-r border-border/50' : ''}
                >
                  <DayColumn
                    date={day}
                    events={events}
                    onEventClick={setSelectedEvent}
                    onAddEvent={handleAddEvent}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            setEditingEvent(selectedEvent)
            setSelectedEvent(null)
          }}
          onDelete={handleDelete}
        />
      )}

      {(showCreateForm || editingEvent) && (
        <EventForm
          event={editingEvent}
          defaultDate={createDate}
          onSubmit={editingEvent ? handleUpdate : handleCreate}
          onClose={() => {
            setShowCreateForm(false)
            setEditingEvent(null)
          }}
          isSubmitting={createEvent.isPending || updateEvent.isPending}
        />
      )}
    </div>
  )
}
