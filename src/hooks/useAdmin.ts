import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile, Subscription } from '@/types/database'

interface UserWithSubscription extends Profile {
  subscriptions: Subscription[]
}

export function useAdmin() {
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscriptions(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as UserWithSubscription[]
    },
  })

  const createUser = useMutation({
    mutationFn: async ({ email, password, full_name, role }: { email: string; password: string; full_name: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email, password, full_name, role },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const toggleUserActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !is_active } as never)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const updateUserRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role } as never)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    createUser,
    toggleUserActive,
    updateUserRole,
  }
}
