import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { cn } from '@/lib/utils'
import { CALENDAR_VIEWS, CALENDAR_VIEW_LABELS } from '@/lib/constants'
import type { CalendarView } from '@/lib/constants'

interface CalendarFiltersProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarFilters({ view, onViewChange, currentDate, onPrev, onNext, onToday }: CalendarFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          Hoje
        </button>
        <button onClick={onPrev} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={onNext} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold capitalize">
          {format(currentDate, view === '1m' ? 'MMMM yyyy' : "d 'de' MMMM yyyy", { locale: ptBR })}
        </h3>
      </div>

      {/* View toggles */}
      <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
        {CALENDAR_VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              view === v
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {CALENDAR_VIEW_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  )
}
