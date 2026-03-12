import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserSettings } from '@/types/database'

export function useUserSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as UserSettings
    },
    enabled: !!user,
  })

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('user_settings')
        .update(updates as never)
        .eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user_settings'] }),
  })

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings,
  }
}
