import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useRealtimeSubscription(
  table: string,
  queryKeys: string[][],
) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`${table}_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key })
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, table, queryKeys, queryClient])
}
