import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { CalendarEvent } from '@/types/database'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns'
import type { CalendarView } from '@/lib/constants'
import { useMemo } from 'react'

function getDateRange(date: Date, view: CalendarView): { start: Date; end: Date } {
  switch (view) {
    case '1d':
      return { start: startOfDay(date), end: endOfDay(date) }
    case '3d':
      return { start: startOfDay(date), end: endOfDay(addDays(date, 2)) }
    case '7d':
      return { start: startOfWeek(date, { weekStartsOn: 0 }), end: endOfWeek(date, { weekStartsOn: 0 }) }
    case '1m':
      return { start: startOfMonth(date), end: endOfMonth(date) }
  }
}

export function useEvents(currentDate: Date, view: CalendarView) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { start, end } = getDateRange(currentDate, view)

  const queryKey = useMemo(() => ['events', user?.id, start.toISOString(), end.toISOString()], [user?.id, start, end])

  useRealtimeSubscription('events', [['events']])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('start_at', { ascending: true })
      if (error) throw error
      return (data as CalendarEvent[]) || []
    },
    enabled: !!user,
  })

  const createEvent = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'notified_24h' | 'notified_8h' | 'notified_1h'>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('events')
        .insert({ ...event, user_id: user.id } as never)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  return {
    events: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
