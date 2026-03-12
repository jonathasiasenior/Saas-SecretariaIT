import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { Note } from '@/types/database'
import { useMemo } from 'react'

export function useNotes(search?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const queryKey = useMemo(() => ['notes', user?.id, search || ''], [user?.id, search])

  useRealtimeSubscription('notes', [['notes']])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return []
      let q = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (search?.trim()) {
        q = q.textSearch('title', search, { type: 'websearch', config: 'portuguese' })
      }

      const { data, error } = await q.limit(50)
      if (error) throw error
      return (data as Note[]) || []
    },
    enabled: !!user,
  })

  const createNote = useMutation({
    mutationFn: async (note: { title: string; content: string; tags?: string[]; category?: string; source?: 'manual' | 'voice' | 'text' }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('notes')
        .insert({ ...note, user_id: user.id, source: note.source || 'manual' } as never)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const togglePin = useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !is_pinned } as never)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  return {
    notes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  }
}
