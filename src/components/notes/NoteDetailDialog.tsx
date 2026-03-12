import { X, Pin, PinOff, Pencil, Trash2, Mic, Keyboard } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import type { Note } from '@/types/database'

interface NoteDetailDialogProps {
  note: Note
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}

export function NoteDetailDialog({ note, onClose, onEdit, onDelete, onTogglePin }: NoteDetailDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold pr-4">{note.title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{format(new Date(note.created_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
            {note.source !== 'manual' && (
              <span className="flex items-center gap-1">
                {note.source === 'voice' ? <Mic className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
                {note.source === 'voice' ? 'Voz' : 'Texto'}
              </span>
            )}
          </div>

          {note.category && (
            <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {note.category}
            </span>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="rounded-xl bg-muted/30 p-4 whitespace-pre-wrap text-sm leading-relaxed">
            {note.content}
          </div>

          {note.raw_input && note.source !== 'manual' && (
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Entrada original:</p>
              <p className="text-xs italic">{note.raw_input}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onTogglePin}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            {note.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            {note.is_pinned ? 'Desafixar' : 'Fixar'}
          </button>
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
