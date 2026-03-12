import { RefreshButton } from '@/components/shared/RefreshButton'
import { CalendarView } from '@/components/calendar/CalendarView'
import { ProcessingIndicator } from '@/components/input/ProcessingIndicator'

export function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minha Agenda</h2>
          <p className="text-sm text-muted-foreground">Seus compromissos organizados</p>
        </div>
        <RefreshButton />
      </div>
      <ProcessingIndicator />
      <CalendarView />
    </div>
  )
}
