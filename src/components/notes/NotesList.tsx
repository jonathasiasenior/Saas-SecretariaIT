import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { useNotes } from '@/hooks/useNotes'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import { NoteDetailDialog } from './NoteDetailDialog'
import { NotesSearch } from './NotesSearch'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Note } from '@/types/database'
import { toast } from 'sonner'

export function NotesList() {
  const [search, setSearch] = useState('')
  const { notes, isLoading, createNote, updateNote, deleteNote, togglePin } = useNotes(search)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCreate = async (data: { title: string; content: string; tags: string[]; category: string }) => {
    try {
      await createNote.mutateAsync(data)
      setShowCreateForm(false)
      toast.success('Anotação criada!')
    } catch {
      toast.error('Erro ao criar anotação')
    }
  }

  const handleUpdate = async (data: { title: string; content: string; tags: string[]; category: string }) => {
    if (!editingNote) return
    try {
      await updateNote.mutateAsync({ id: editingNote.id, ...data })
      setEditingNote(null)
      toast.success('Anotação atualizada!')
    } catch {
      toast.error('Erro ao atualizar anotação')
    }
  }

  const handleDelete = async () => {
    if (!selectedNote) return
    try {
      await deleteNote.mutateAsync(selectedNote.id)
      setSelectedNote(null)
      toast.success('Anotação removida!')
    } catch {
      toast.error('Erro ao remover anotação')
    }
  }

  const handleTogglePin = async () => {
    if (!selectedNote) return
    try {
      await togglePin.mutateAsync({ id: selectedNote.id, is_pinned: selectedNote.is_pinned })
      setSelectedNote(null)
      toast.success(selectedNote.is_pinned ? 'Anotação desafixada' : 'Anotação fixada!')
    } catch {
      toast.error('Erro ao atualizar anotação')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <NotesSearch value={search} onChange={setSearch} />
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Nota</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-16 rounded bg-muted animate-pulse" />
                <div className="h-5 w-12 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação'}
          description={search ? 'Tente buscar com outros termos' : 'Use o botão de microfone para criar anotações por voz ou texto.'}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => setSelectedNote(note)} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {selectedNote && (
        <NoteDetailDialog
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onEdit={() => {
            setEditingNote(selectedNote)
            setSelectedNote(null)
          }}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
        />
      )}

      {(showCreateForm || editingNote) && (
        <NoteForm
          note={editingNote}
          onSubmit={editingNote ? handleUpdate : handleCreate}
          onClose={() => {
            setShowCreateForm(false)
            setEditingNote(null)
          }}
          isSubmitting={createNote.isPending || updateNote.isPending}
        />
      )}
    </div>
  )
}
