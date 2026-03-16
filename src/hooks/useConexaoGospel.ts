import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { ProPost, ProProfile, QtcAction, QtcProfile } from '@/types/database'
import type { ProPostInput, ProProfileInput, QtcProfileInput } from '@/lib/validators'

export function useConexaoGospel() {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()

  const ownQtcProfile = useQuery({
    queryKey: ['conexao-gospel', 'own-qtc-profile', user?.id ?? ''],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('qtc_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      return (data as QtcProfile | null) ?? null
    },
    enabled: !!user,
  })

  const ownProProfile = useQuery({
    queryKey: ['conexao-gospel', 'own-pro-profile', user?.id ?? ''],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('pro_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      return (data as ProProfile | null) ?? null
    },
    enabled: !!user,
  })

  const qtcActions = useQuery({
    queryKey: ['conexao-gospel', 'qtc-actions', user?.id ?? ''],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('qtc_actions')
        .select('*')
        .eq('from_user_id', user.id)

      if (error) throw error
      return (data as QtcAction[]) ?? []
    },
    enabled: !!user,
  })

  const publicQtcProfiles = useQuery({
    queryKey: ['conexao-gospel', 'public-qtc-profiles', user?.id ?? ''],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('qtc_profiles')
        .select('*')
        .eq('is_visible', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) throw error
      return (data as QtcProfile[]) ?? []
    },
    enabled: !!user,
  })

  const publicProProfiles = useQuery({
    queryKey: ['conexao-gospel', 'public-profiles', user?.id ?? ''],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('pro_profiles')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) throw error
      return (data as ProProfile[]) ?? []
    },
    enabled: !!user,
  })

  const publicProPosts = useQuery({
    queryKey: ['conexao-gospel', 'public-pro-posts', user?.id ?? ''],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('pro_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) throw error
      return (data as ProPost[]) ?? []
    },
    enabled: !!user,
  })

  const upsertQtcProfile = useMutation({
    mutationFn: async (input: QtcProfileInput) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('qtc_profiles')
        .upsert(
          {
            user_id: user.id,
            display_name: input.display_name || profile?.full_name || 'Perfil QTC',
            city: input.city,
            state: input.state.toUpperCase(),
            church_name: input.church_name || null,
            looking_for: input.looking_for,
            bio: input.bio,
            tags: input.tags,
            compatibility_focus: input.compatibility_focus || null,
            is_visible: input.is_visible,
          } as never,
          { onConflict: 'user_id' }
        )
        .select('*')
        .single()

      if (error) throw error
      return data as QtcProfile
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conexao-gospel'] })
    },
  })

  const upsertProProfile = useMutation({
    mutationFn: async (input: ProProfileInput) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('pro_profiles')
        .upsert(
          {
            user_id: user.id,
            display_name: input.display_name || profile?.full_name || 'Perfil Pro',
            role_title: input.role_title,
            city: input.city,
            state: input.state.toUpperCase(),
            focus: input.focus,
            score_label: input.score_label,
            specialties: input.specialties,
            is_public: input.is_public,
          } as never,
          { onConflict: 'user_id' }
        )
        .select('*')
        .single()

      if (error) throw error
      return data as ProProfile
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conexao-gospel'] })
    },
  })

  const saveQtcAction = useMutation({
    mutationFn: async ({
      toProfileId,
      actionType,
    }: {
      toProfileId: string
      actionType: 'liked' | 'passed'
    }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('qtc_actions')
        .upsert(
          {
            from_user_id: user.id,
            to_profile_id: toProfileId,
            action_type: actionType,
          } as never,
          { onConflict: 'from_user_id,to_profile_id' }
        )
        .select('*')
        .single()

      if (error) throw error
      return data as QtcAction
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conexao-gospel'] })
    },
  })

  const createProPost = useMutation({
    mutationFn: async (input: ProPostInput) => {
      if (!user) throw new Error('Not authenticated')

      const profileResult = ownProProfile.data
      if (!profileResult) {
        throw new Error('Crie seu perfil profissional antes de publicar um case.')
      }

      const { data, error } = await supabase
        .from('pro_posts')
        .insert(
          {
            user_id: user.id,
            profile_id: profileResult.id,
            author_name: profileResult.display_name,
            author_role: profileResult.role_title,
            title: input.title,
            summary: input.summary,
            reach_label: input.reach_label,
            engagement_label: input.engagement_label,
            tags: input.tags,
            is_published: true,
          } as never
        )
        .select('*')
        .single()

      if (error) throw error
      return data as ProPost
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conexao-gospel'] })
    },
  })

  return {
    ownQtcProfile: ownQtcProfile.data ?? null,
    ownProProfile: ownProProfile.data ?? null,
    qtcActions: qtcActions.data ?? [],
    publicQtcProfiles: publicQtcProfiles.data ?? [],
    publicProProfiles: publicProProfiles.data ?? [],
    publicProPosts: publicProPosts.data ?? [],
    isLoading:
      ownQtcProfile.isLoading ||
      ownProProfile.isLoading ||
      qtcActions.isLoading ||
      publicQtcProfiles.isLoading ||
      publicProProfiles.isLoading ||
      publicProPosts.isLoading,
    upsertQtcProfile,
    upsertProProfile,
    saveQtcAction,
    createProPost,
  }
}
