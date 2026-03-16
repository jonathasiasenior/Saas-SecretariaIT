import { useDeferredValue, useEffect, useMemo, useState, useTransition, type ComponentType, type Dispatch, type SetStateAction } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Filter,
  Heart,
  HeartHandshake,
  Loader2,
  MessageCircleHeart,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useConexaoGospel } from '@/hooks/useConexaoGospel'
import {
  communityMetrics,
  communityPosts,
  journeySteps,
  matchQueue,
  professionals,
  qtcProfiles,
  testimonials,
  type ModuleTab,
} from '@/lib/conexao-gospel-data'
import { proPostSchema, proProfileSchema, qtcProfileSchema } from '@/lib/validators'
import { cn } from '@/lib/utils'

const tabs: Array<{
  id: ModuleTab
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'overview', label: 'Visao geral', description: 'Jornada, metricas e argumento de venda.', icon: Sparkles },
  { id: 'qtc', label: 'QTC', description: 'Perfil real, swipe e intencao.', icon: HeartHandshake },
  { id: 'pro', label: 'Rede Pro', description: 'Perfil publico, cases e prova social.', icon: BriefcaseBusiness },
]

type LookingFor = 'relationship' | 'friendship' | 'both'

const relationshipLabels: Record<LookingFor, string> = {
  relationship: 'Relacionamento',
  friendship: 'Amizade',
  both: 'Ambos',
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function ConexaoGospelPage() {
  const { profile } = useAuth()
  const {
    ownQtcProfile,
    ownProProfile,
    qtcActions,
    publicQtcProfiles,
    publicProProfiles,
    publicProPosts,
    isLoading,
    upsertQtcProfile,
    upsertProProfile,
    saveQtcAction,
    createProPost,
  } = useConexaoGospel()

  const [activeTab, setActiveTab] = useState<ModuleTab>('overview')
  const [profileQuery, setProfileQuery] = useState('')
  const [proQuery, setProQuery] = useState('')
  const [trackFilter, setTrackFilter] = useState<'all' | LookingFor>('all')
  const [sampleQtcActions, setSampleQtcActions] = useState<Record<string, 'liked' | 'passed'>>({})
  const [followedProfessionals, setFollowedProfessionals] = useState<string[]>([])
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const [qtcForm, setQtcForm] = useState({
    display_name: '',
    city: '',
    state: '',
    church_name: '',
    looking_for: 'relationship' as LookingFor,
    bio: '',
    tagsText: '',
    compatibility_focus: '',
    is_visible: true,
  })

  const [proForm, setProForm] = useState({
    display_name: '',
    role_title: '',
    city: '',
    state: '',
    focus: '',
    score_label: 'Em crescimento',
    specialtiesText: '',
    is_public: true,
  })

  const [postForm, setPostForm] = useState({
    title: '',
    summary: '',
    reach_label: '',
    engagement_label: '',
    tagsText: '',
  })

  useEffect(() => {
    if (!ownQtcProfile && profile) {
      setQtcForm((current) => ({
        ...current,
        display_name: current.display_name || profile.full_name,
      }))
      return
    }

    if (ownQtcProfile) {
      setQtcForm({
        display_name: ownQtcProfile.display_name,
        city: ownQtcProfile.city,
        state: ownQtcProfile.state,
        church_name: ownQtcProfile.church_name ?? '',
        looking_for: ownQtcProfile.looking_for,
        bio: ownQtcProfile.bio,
        tagsText: ownQtcProfile.tags.join(', '),
        compatibility_focus: ownQtcProfile.compatibility_focus ?? '',
        is_visible: ownQtcProfile.is_visible,
      })
    }
  }, [ownQtcProfile, profile])

  useEffect(() => {
    if (!ownProProfile && profile) {
      setProForm((current) => ({
        ...current,
        display_name: current.display_name || profile.full_name,
      }))
      return
    }

    if (ownProProfile) {
      setProForm({
        display_name: ownProProfile.display_name,
        role_title: ownProProfile.role_title,
        city: ownProProfile.city,
        state: ownProProfile.state,
        focus: ownProProfile.focus,
        score_label: ownProProfile.score_label,
        specialtiesText: ownProProfile.specialties.join(', '),
        is_public: ownProProfile.is_public,
      })
    }
  }, [ownProProfile, profile])

  const deferredProfileQuery = useDeferredValue(profileQuery)
  const deferredProQuery = useDeferredValue(proQuery)

  const qtcCatalog = useMemo(() => {
    if (publicQtcProfiles.length > 0) {
      return publicQtcProfiles.map((item, index) => ({
        id: item.id,
        source: 'db' as const,
        name: item.display_name,
        city: `${item.city}, ${item.state}`,
        church: item.church_name || 'Comunidade local',
        lookingFor: item.looking_for,
        compatibility: 92 - (index % 4) * 2,
        bio: item.bio,
        tags: item.tags,
      }))
    }

    return qtcProfiles.map((item) => ({
      id: item.id,
      source: 'sample' as const,
      name: item.name,
      city: item.city,
      church: item.church,
      lookingFor: item.lookingFor,
      compatibility: item.compatibility,
      bio: item.bio,
      tags: item.tags,
    }))
  }, [publicQtcProfiles])

  const proCatalog = useMemo(() => {
    if (publicProProfiles.length > 0) {
      return publicProProfiles.map((item) => ({
        id: item.id,
        source: 'db' as const,
        name: item.display_name,
        role: item.role_title,
        city: `${item.city}, ${item.state}`,
        focus: item.focus,
        score: item.score_label,
        specialties: item.specialties,
      }))
    }

    return professionals.map((item) => ({
      id: item.id,
      source: 'sample' as const,
      name: item.name,
      role: item.role,
      city: item.city,
      focus: item.focus,
      score: item.score,
      specialties: item.specialties,
    }))
  }, [publicProProfiles])

  const postCatalog = useMemo(() => {
    if (publicProPosts.length > 0) {
      return publicProPosts.map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author_name,
        role: item.author_role,
        summary: item.summary,
        reach: item.reach_label,
        engagement: item.engagement_label,
        tags: item.tags,
      }))
    }

    return communityPosts.map((item) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      role: item.role,
      summary: item.summary,
      reach: item.reach,
      engagement: item.engagement,
      tags: item.tags,
    }))
  }, [publicProPosts])

  const actionMap = useMemo(() => {
    const entries = qtcActions.map((action) => [action.to_profile_id, action.action_type] as const)
    return { ...sampleQtcActions, ...Object.fromEntries(entries) }
  }, [qtcActions, sampleQtcActions])

  const filteredProfiles = qtcCatalog.filter((item) => {
    const matchesTrack = trackFilter === 'all' || item.lookingFor === trackFilter
    const matchesQuery =
      deferredProfileQuery.trim() === '' ||
      [item.name, item.city, item.church, ...item.tags].join(' ').toLowerCase().includes(deferredProfileQuery.toLowerCase())

    return matchesTrack && matchesQuery
  })

  const filteredProfessionals = proCatalog.filter((item) =>
    [item.name, item.role, item.city, item.focus, ...item.specialties].join(' ').toLowerCase().includes(deferredProQuery.toLowerCase())
  )

  const likedCount = Object.values(actionMap).filter((value) => value === 'liked').length
  const passedCount = Object.values(actionMap).filter((value) => value === 'passed').length

  const handleQtcAction = async (profileId: string, source: 'db' | 'sample', action: 'liked' | 'passed', profileName: string) => {
    if (source === 'db') {
      try {
        await saveQtcAction.mutateAsync({ toProfileId: profileId, actionType: action })
        toast.success(
          action === 'liked' ? `Interesse salvo em ${profileName}.` : `${profileName} foi movido para sua fila de passes.`
        )
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Falha ao salvar acao.')
      }
      return
    }

    startTransition(() => {
      setSampleQtcActions((current) => ({ ...current, [profileId]: action }))
    })
    toast.success(action === 'liked' ? `Interesse registrado em ${profileName}.` : `${profileName} foi movido para a fila de passes.`)
  }

  const handleFollowProfessional = (professionalId: string, professionalName: string) => {
    const alreadyFollowing = followedProfessionals.includes(professionalId)
    startTransition(() => {
      setFollowedProfessionals((current) =>
        alreadyFollowing ? current.filter((item) => item !== professionalId) : [...current, professionalId]
      )
    })
    toast.success(alreadyFollowing ? `Voce deixou de seguir ${professionalName}.` : `Agora voce acompanha ${professionalName}.`)
  }

  const handleLikePost = (postId: string, postTitle: string) => {
    const alreadyLiked = likedPosts.includes(postId)
    startTransition(() => {
      setLikedPosts((current) => (alreadyLiked ? current.filter((item) => item !== postId) : [...current, postId]))
    })
    toast.success(alreadyLiked ? `Voce removeu o destaque de "${postTitle}".` : `Post "${postTitle}" salvo em destaque.`)
  }

  const handleSaveQtcProfile = async () => {
    const result = qtcProfileSchema.safeParse({
      ...qtcForm,
      tags: splitTags(qtcForm.tagsText),
      state: qtcForm.state.toUpperCase(),
    })

    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    try {
      await upsertQtcProfile.mutateAsync(result.data)
      toast.success('Perfil QTC salvo com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar perfil QTC.')
    }
  }

  const handleSaveProProfile = async () => {
    const result = proProfileSchema.safeParse({
      ...proForm,
      specialties: splitTags(proForm.specialtiesText),
      state: proForm.state.toUpperCase(),
    })

    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    try {
      await upsertProProfile.mutateAsync(result.data)
      toast.success('Perfil profissional salvo com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar perfil profissional.')
    }
  }

  const handleCreatePost = async () => {
    const result = proPostSchema.safeParse({
      ...postForm,
      tags: splitTags(postForm.tagsText),
    })

    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    try {
      await createProPost.mutateAsync(result.data)
      setPostForm({
        title: '',
        summary: '',
        reach_label: '',
        engagement_label: '',
        tagsText: '',
      })
      toast.success('Case publicado com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao publicar case.')
    }
  }

  return (
    <div className="space-y-8 pb-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_60%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-4 w-4" />
              Conexao Gospel
            </div>
            <div>
              <h2 className="[font-family:'Sora',sans-serif] text-3xl font-semibold leading-tight md:text-5xl">
                Relacionamento intencional e rede profissional agora com dados reais e UX mais forte.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                O modulo agora permite salvar perfil QTC, perfil profissional e cases no Supabase, mantendo a vitrine premium e o fallback elegante enquanto a base cresce.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setActiveTab('qtc')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
              >
                Abrir QTC
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTab('pro')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-5 py-3 text-sm font-semibold"
              >
                Abrir Rede Pro
                <BriefcaseBusiness className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {communityMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-border/70 bg-background/80 p-4 backdrop-blur">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="mt-2 text-sm font-semibold">{metric.label}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Navegacao</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {tabs.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition-all',
                  activeTab === id ? 'border-primary/40 bg-primary/10' : 'border-border/70 bg-background hover:bg-accent/40'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', activeTab === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Resumo operacional</p>
              <h3 className="mt-1 text-2xl font-semibold">Modulo conectado ao banco e pronto para evoluir</h3>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              {isLoading ? 'Sincronizando...' : 'Persistencia ativa'}
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SummaryTile icon={Users} title="Perfis reais" description="QTC e Pro com upsert no Supabase." />
            <SummaryTile icon={MessageCircleHeart} title="Acao registrada" description="Likes e passes do QTC agora persistem." />
            <SummaryTile icon={ShieldCheck} title="Fallback inteligente" description="Sem dados? A pagina continua bonita e demonstravel." />
          </div>
        </div>
      </section>

      {activeTab === 'overview' ? (
        <OverviewSection
          ownQtcProfile={!!ownQtcProfile}
          ownProProfile={!!ownProProfile}
          publicQtcCount={publicQtcProfiles.length}
          publicPostCount={publicProPosts.length}
        />
      ) : null}

      {activeTab === 'qtc'
        ? renderQtcSection({
            filteredProfiles,
            actionMap,
            trackFilter,
            profileQuery,
            isPending,
            qtcForm,
            likedCount,
            passedCount,
            upsertQtcPending: upsertQtcProfile.isPending,
            setTrackFilter,
            setProfileQuery,
            setQtcForm,
            handleQtcAction,
            handleSaveQtcProfile,
          })
        : null}

      {activeTab === 'pro'
        ? renderProSection({
            filteredProfessionals,
            postCatalog,
            followedProfessionals,
            likedPosts,
            proQuery,
            proForm,
            postForm,
            upsertProPending: upsertProProfile.isPending,
            createPostPending: createProPost.isPending,
            setProQuery,
            setProForm,
            setPostForm,
            handleFollowProfessional,
            handleLikePost,
            handleSaveProProfile,
            handleCreatePost,
          })
        : null}
    </div>
  )
}

function OverviewSection({
  ownQtcProfile,
  ownProProfile,
  publicQtcCount,
  publicPostCount,
}: {
  ownQtcProfile: boolean
  ownProProfile: boolean
  publicQtcCount: number
  publicPostCount: number
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-2">
        <FeaturePanel
          eyebrow="QTC"
          title="Perfil real com contexto e acao."
          description="Seu cadastro agora pode ser salvo e reaproveitado, enquanto o feed puxa perfis publicos reais quando existirem."
          bullets={[
            'Perfil salvo com nome, cidade, igreja, intencao e tags',
            'Likes e passes persistidos por usuario',
            'Fallback visual enquanto a base ainda cresce',
          ]}
          icon={HeartHandshake}
          tint="bg-pink-500/10 text-pink-500"
        />
        <FeaturePanel
          eyebrow="Rede Pro"
          title="Vitrine de autoridade com cases publicados."
          description="Perfis profissionais e posts agora podem ser criados dentro do proprio app, com UX focada em valor percebido."
          bullets={[
            'Perfil publico com foco, selo e especialidades',
            'Posts de case com metricas e tags',
            'Leitura editorial para melhorar conversao',
          ]}
          icon={BriefcaseBusiness}
          tint="bg-amber-400/15 text-amber-500"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {journeySteps.map((step, index) => (
          <div key={step.title} className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                0{index + 1}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{step.description}</p>
            <div className="mt-5 rounded-2xl bg-muted/50 px-4 py-3 text-sm font-medium">{step.outcome}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Product thinking</p>
              <h3 className="text-2xl font-semibold">Camada pronta para expandir onboarding, match e chat</h3>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatBox label="Perfil QTC salvo" value={ownQtcProfile ? 'Sim' : 'Nao'} />
            <StatBox label="Perfil Pro salvo" value={ownProProfile ? 'Sim' : 'Nao'} />
            <StatBox label="Perfis QTC publicos" value={`${publicQtcCount || qtcProfiles.length}`} />
            <StatBox label="Cases visiveis" value={`${publicPostCount || communityPosts.length}`} />
          </div>
        </div>

        <div className="space-y-4">
          {testimonials.map((item) => (
            <div key={item.author} className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-base leading-7">"{item.quote}"</p>
              <p className="mt-5 font-semibold">{item.author}</p>
              <p className="text-sm text-muted-foreground">{item.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function renderQtcSection({
  filteredProfiles,
  actionMap,
  trackFilter,
  profileQuery,
  isPending,
  qtcForm,
  likedCount,
  passedCount,
  upsertQtcPending,
  setTrackFilter,
  setProfileQuery,
  setQtcForm,
  handleQtcAction,
  handleSaveQtcProfile,
}: {
  filteredProfiles: Array<{
    id: string
    source: 'db' | 'sample'
    name: string
    city: string
    church: string
    lookingFor: LookingFor
    compatibility: number
    bio: string
    tags: string[]
  }>
  actionMap: Record<string, 'liked' | 'passed'>
  trackFilter: 'all' | LookingFor
  profileQuery: string
  isPending: boolean
  qtcForm: {
    display_name: string
    city: string
    state: string
    church_name: string
    looking_for: LookingFor
    bio: string
    tagsText: string
    compatibility_focus: string
    is_visible: boolean
  }
  likedCount: number
  passedCount: number
  upsertQtcPending: boolean
  setTrackFilter: (value: 'all' | LookingFor) => void
  setProfileQuery: (value: string) => void
  setQtcForm: Dispatch<SetStateAction<{
    display_name: string
    city: string
    state: string
    church_name: string
    looking_for: LookingFor
    bio: string
    tagsText: string
    compatibility_focus: string
    is_visible: boolean
  }>>
  handleQtcAction: (profileId: string, source: 'db' | 'sample', action: 'liked' | 'passed', profileName: string) => Promise<void>
  handleSaveQtcProfile: () => Promise<void>
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <div className="space-y-4">
        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Feed QTC</p>
              <h3 className="mt-1 text-2xl font-semibold">Perfis publicos com contexto real</h3>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
              <Filter className="h-4 w-4" />
              {isPending ? 'Atualizando...' : `${filteredProfiles.length} perfis visiveis`}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={profileQuery}
                onChange={(event) => setProfileQuery(event.target.value)}
                placeholder="Buscar por cidade, igreja ou tag"
                className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'relationship', 'friendship', 'both'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTrackFilter(item)}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm font-medium',
                    trackFilter === item ? 'bg-primary text-primary-foreground' : 'border border-border/70 bg-background text-muted-foreground'
                  )}
                >
                  {item === 'all' ? 'Todos' : relationshipLabels[item]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {filteredProfiles.map((item) => {
            const action = actionMap[item.id]
            return (
              <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[0.42fr_0.58fr]">
                  <div className="min-h-[260px] bg-[linear-gradient(135deg,rgba(251,191,36,0.32),rgba(236,72,153,0.22),rgba(59,130,246,0.22))] p-5">
                    <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/40 bg-white/25 p-5 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                          {relationshipLabels[item.lookingFor]}
                        </span>
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-950">
                          {item.compatibility}% match
                        </span>
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-slate-950">{item.name}</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">{item.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-2xl font-semibold">{item.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{item.city} · {item.church}</p>
                      </div>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', action === 'liked' ? 'bg-success/15 text-success' : action === 'passed' ? 'bg-warning/20 text-warning-foreground' : 'bg-muted text-muted-foreground')}>
                        {action === 'liked' ? 'Interessado' : action === 'passed' ? 'Passado' : 'Disponivel'}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.bio}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => void handleQtcAction(item.id, item.source, 'passed', item.name)}
                        className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-semibold hover:bg-accent/50"
                      >
                        Passar por agora
                      </button>
                      <button
                        onClick={() => void handleQtcAction(item.id, item.source, 'liked', item.name)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
                      >
                        <Heart className="h-4 w-4" />
                        Demonstrar interesse
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Meu perfil QTC</p>
          <div className="mt-4 grid gap-3">
            <InputField label="Nome visivel" value={qtcForm.display_name} onChange={(value) => setQtcForm((current) => ({ ...current, display_name: value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField label="Cidade" value={qtcForm.city} onChange={(value) => setQtcForm((current) => ({ ...current, city: value }))} />
              <InputField label="Estado" value={qtcForm.state} onChange={(value) => setQtcForm((current) => ({ ...current, state: value }))} />
            </div>
            <InputField label="Igreja" value={qtcForm.church_name} onChange={(value) => setQtcForm((current) => ({ ...current, church_name: value }))} />
            <SelectField
              label="Busca"
              value={qtcForm.looking_for}
              onChange={(value) => setQtcForm((current) => ({ ...current, looking_for: value as LookingFor }))}
              options={[
                { value: 'relationship', label: 'Relacionamento' },
                { value: 'friendship', label: 'Amizade' },
                { value: 'both', label: 'Ambos' },
              ]}
            />
            <InputField label="Foco de compatibilidade" value={qtcForm.compatibility_focus} onChange={(value) => setQtcForm((current) => ({ ...current, compatibility_focus: value }))} />
            <TextareaField label="Bio" value={qtcForm.bio} onChange={(value) => setQtcForm((current) => ({ ...current, bio: value }))} rows={4} />
            <TextareaField label="Tags separadas por virgula" value={qtcForm.tagsText} onChange={(value) => setQtcForm((current) => ({ ...current, tagsText: value }))} rows={2} />
            <ToggleField label="Perfil visivel no feed" checked={qtcForm.is_visible} onChange={() => setQtcForm((current) => ({ ...current, is_visible: !current.is_visible }))} />
            <button
              onClick={() => void handleSaveQtcProfile()}
              disabled={upsertQtcPending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {upsertQtcPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
              Salvar perfil QTC
            </button>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Painel QTC</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <StatBox label="Interesses enviados" value={`${likedCount}`} />
            <StatBox label="Passes registrados" value={`${passedCount}`} />
            <StatBox label="Matches aquecidos" value={`${matchQueue.length}`} />
          </div>
        </section>
      </aside>
    </div>
  )
}

function renderProSection({
  filteredProfessionals,
  postCatalog,
  followedProfessionals,
  likedPosts,
  proQuery,
  proForm,
  postForm,
  upsertProPending,
  createPostPending,
  setProQuery,
  setProForm,
  setPostForm,
  handleFollowProfessional,
  handleLikePost,
  handleSaveProProfile,
  handleCreatePost,
}: {
  filteredProfessionals: Array<{
    id: string
    source: 'db' | 'sample'
    name: string
    role: string
    city: string
    focus: string
    score: string
    specialties: string[]
  }>
  postCatalog: Array<{
    id: string
    title: string
    author: string
    role: string
    summary: string
    reach: string
    engagement: string
    tags: string[]
  }>
  followedProfessionals: string[]
  likedPosts: string[]
  proQuery: string
  proForm: {
    display_name: string
    role_title: string
    city: string
    state: string
    focus: string
    score_label: string
    specialtiesText: string
    is_public: boolean
  }
  postForm: {
    title: string
    summary: string
    reach_label: string
    engagement_label: string
    tagsText: string
  }
  upsertProPending: boolean
  createPostPending: boolean
  setProQuery: (value: string) => void
  setProForm: Dispatch<SetStateAction<{
    display_name: string
    role_title: string
    city: string
    state: string
    focus: string
    score_label: string
    specialtiesText: string
    is_public: boolean
  }>>
  setPostForm: Dispatch<SetStateAction<{
    title: string
    summary: string
    reach_label: string
    engagement_label: string
    tagsText: string
  }>>
  handleFollowProfessional: (professionalId: string, professionalName: string) => void
  handleLikePost: (postId: string, postTitle: string) => void
  handleSaveProProfile: () => Promise<void>
  handleCreatePost: () => Promise<void>
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <aside className="space-y-4">
        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Meu perfil Pro</p>
          <div className="mt-4 grid gap-3">
            <InputField label="Nome visivel" value={proForm.display_name} onChange={(value) => setProForm((current) => ({ ...current, display_name: value }))} />
            <InputField label="Cargo ou especialidade" value={proForm.role_title} onChange={(value) => setProForm((current) => ({ ...current, role_title: value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField label="Cidade" value={proForm.city} onChange={(value) => setProForm((current) => ({ ...current, city: value }))} />
              <InputField label="Estado" value={proForm.state} onChange={(value) => setProForm((current) => ({ ...current, state: value }))} />
            </div>
            <TextareaField label="Foco" value={proForm.focus} onChange={(value) => setProForm((current) => ({ ...current, focus: value }))} rows={3} />
            <InputField label="Selo" value={proForm.score_label} onChange={(value) => setProForm((current) => ({ ...current, score_label: value }))} />
            <TextareaField label="Especialidades separadas por virgula" value={proForm.specialtiesText} onChange={(value) => setProForm((current) => ({ ...current, specialtiesText: value }))} rows={2} />
            <ToggleField label="Perfil publico" checked={proForm.is_public} onChange={() => setProForm((current) => ({ ...current, is_public: !current.is_public }))} />
            <button
              onClick={() => void handleSaveProProfile()}
              disabled={upsertProPending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {upsertProPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BriefcaseBusiness className="h-4 w-4" />}
              Salvar perfil Pro
            </button>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Publicar case</p>
          <div className="mt-4 grid gap-3">
            <InputField label="Titulo" value={postForm.title} onChange={(value) => setPostForm((current) => ({ ...current, title: value }))} />
            <TextareaField label="Resumo" value={postForm.summary} onChange={(value) => setPostForm((current) => ({ ...current, summary: value }))} rows={4} />
            <div className="grid gap-3 sm:grid-cols-2">
              <InputField label="Alcance" value={postForm.reach_label} onChange={(value) => setPostForm((current) => ({ ...current, reach_label: value }))} />
              <InputField label="Resultado" value={postForm.engagement_label} onChange={(value) => setPostForm((current) => ({ ...current, engagement_label: value }))} />
            </div>
            <TextareaField label="Tags separadas por virgula" value={postForm.tagsText} onChange={(value) => setPostForm((current) => ({ ...current, tagsText: value }))} rows={2} />
            <button
              onClick={() => void handleCreatePost()}
              disabled={createPostPending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {createPostPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Publicar case
            </button>
          </div>
        </section>
      </aside>

      <section className="space-y-4">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Descoberta Pro</p>
              <h3 className="mt-1 text-2xl font-semibold">Profissionais e cases com prova social</h3>
            </div>
            <label className="relative block min-w-[260px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={proQuery}
                onChange={(event) => setProQuery(event.target.value)}
                placeholder="Buscar por nome, cidade ou especialidade"
                className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
          <div className="space-y-4">
            {filteredProfessionals.map((item) => {
              const isFollowing = followedProfessionals.includes(item.id)
              return (
                <div key={item.id} className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{item.score}</p>
                    </div>
                    <button
                      onClick={() => handleFollowProfessional(item.id, item.name)}
                      className={cn('rounded-2xl px-4 py-2 text-xs font-semibold', isFollowing ? 'bg-primary text-primary-foreground' : 'border border-border/70 bg-background')}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.focus}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.specialties.map((specialty) => (
                      <span key={specialty} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-4">
            {postCatalog.map((post) => {
              const isHighlighted = likedPosts.includes(post.id)
              return (
                <article key={post.id} className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
                  <div className="h-40 bg-[linear-gradient(135deg,rgba(251,191,36,0.28),rgba(124,58,237,0.18),rgba(16,185,129,0.18))]" />
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{post.role}</p>
                        <h4 className="mt-2 text-2xl font-semibold">{post.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">Por {post.author}</p>
                      </div>
                      <button
                        onClick={() => handleLikePost(post.id, post.title)}
                        className={cn('inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold', isHighlighted ? 'bg-primary text-primary-foreground' : 'border border-border/70 bg-background')}
                      >
                        <Heart className={cn('h-4 w-4', isHighlighted && 'fill-current')} />
                        {isHighlighted ? 'Em destaque' : 'Destacar post'}
                      </button>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{post.summary}</p>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <StatBox label="Alcance" value={post.reach} />
                      <StatBox label="Resultado" value={post.engagement} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-4 font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function FeaturePanel({
  eyebrow,
  title,
  description,
  bullets,
  icon: Icon,
  tint,
}: {
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  icon: ComponentType<{ className?: string }>
  tint: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
        </div>
        <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl', tint)}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
      <div className="mt-6 space-y-3">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-3 rounded-2xl bg-background p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
            <p className="text-sm leading-6">{bullet}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  )
}

function TextareaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3 text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={cn('flex h-6 w-11 items-center rounded-full p-0.5 transition-colors', checked ? 'bg-primary' : 'bg-muted')}>
        <span className={cn('h-5 w-5 rounded-full bg-white shadow-sm transition-transform', checked ? 'translate-x-5' : 'translate-x-0')} />
      </span>
    </button>
  )
}
