import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Pin, Mic, Keyboard } from 'lucide-react'

import type { Note } from '@/types/database'

interface NoteCardProps {
  note: Note
  onClick: () => void
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md animate-fade-in"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold line-clamp-1">{note.title}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {note.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
          {note.source === 'voice' && <Mic className="h-3.5 w-3.5 text-muted-foreground" />}
          {note.source === 'text' && <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {format(new Date(note.created_at), "d MMM", { locale: ptBR })}
        </span>
      </div>
    </button>
  )
}
