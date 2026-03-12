import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { ProcessingQueueItem } from '@/types/database'
import { PROCESSING_POLL_INTERVAL } from '@/lib/constants'
import { useMemo } from 'react'

export function useProcessingQueue() {
  const { user } = useAuth()

  const queryKey = useMemo(() => ['processing_queue', user?.id], [user?.id])

  useRealtimeSubscription('processing_queue', [['processing_queue']])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('processing_queue')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return (data as ProcessingQueueItem[]) || []
    },
    enabled: !!user,
    refetchInterval: (query) => {
      const data = query.state.data as ProcessingQueueItem[] | undefined
      if (data && data.length > 0) return PROCESSING_POLL_INTERVAL
      return false
    },
  })

  return {
    items: query.data || [],
    isProcessing: (query.data?.length || 0) > 0,
  }
}
