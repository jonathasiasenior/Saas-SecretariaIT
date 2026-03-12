import { RefreshButton } from '@/components/shared/RefreshButton'
import { NotesList } from '@/components/notes/NotesList'
import { ProcessingIndicator } from '@/components/input/ProcessingIndicator'

export function NotesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Anotações</h2>
          <p className="text-sm text-muted-foreground">Seu diário de anotações inteligente</p>
        </div>
        <RefreshButton />
      </div>
      <ProcessingIndicator />
      <NotesList />
    </div>
  )
}
