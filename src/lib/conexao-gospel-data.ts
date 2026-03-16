export type ModuleTab = 'overview' | 'qtc' | 'pro'

export interface CommunityMetric {
  value: string
  label: string
  detail: string
}

export interface JourneyStep {
  title: string
  description: string
  outcome: string
}

export interface QtcProfilePreview {
  id: string
  name: string
  age: number
  city: string
  church: string
  lookingFor: 'relationship' | 'friendship' | 'both'
  compatibility: number
  bio: string
  tags: string[]
}

export interface MatchPreview {
  id: string
  name: string
  status: string
  detail: string
  sharedInterest: string
}

export interface ProfessionalPreview {
  id: string
  name: string
  role: string
  city: string
  focus: string
  score: string
  specialties: string[]
}

export interface CommunityPostPreview {
  id: string
  author: string
  role: string
  title: string
  summary: string
  reach: string
  engagement: string
  tags: string[]
}

export interface TestimonialPreview {
  quote: string
  author: string
  role: string
}

export const communityMetrics: CommunityMetric[] = [
  {
    value: '94%',
    label: 'perfis com onboarding completo',
    detail: 'Fluxo pensado para reduzir abandono e melhorar qualidade dos matches.',
  },
  {
    value: '3.2x',
    label: 'mais conversas iniciadas',
    detail: 'QTC combina afinidade, intencao e contexto de comunidade local.',
  },
  {
    value: '68h',
    label: 'tempo medio economizado',
    detail: 'Automacoes e IA deixam menos trabalho operacional no dia a dia.',
  },
  {
    value: '41%',
    label: 'mais leads qualificados',
    detail: 'Rede profissional organiza provas sociais, portfolio e CTA comercial.',
  },
]

export const journeySteps: JourneyStep[] = [
  {
    title: 'Escolha seu caminho',
    description: 'O usuario ativa QTC, Rede Pro ou ambos em um mesmo onboarding.',
    outcome: 'Entrada direta no modulo mais aderente ao objetivo.',
  },
  {
    title: 'Perfil com contexto real',
    description: 'Campos de comunidade, cidade, interesses e especialidades elevam a relevancia.',
    outcome: 'Menos ruido no feed e mais conexoes com intencao.',
  },
  {
    title: 'Acao com continuidade',
    description: 'Matches, networking, mensagens e CTA comerciais aparecem em jornadas claras.',
    outcome: 'Mais resposta, mais relacionamento e mais conversao.',
  },
]

export const qtcProfiles: QtcProfilePreview[] = [
  {
    id: 'rebeca',
    name: 'Rebeca',
    age: 26,
    city: 'Sao Paulo, SP',
    church: 'Comunidade Esperanca',
    lookingFor: 'relationship',
    compatibility: 96,
    bio: 'Ama servir no louvor, encontros de jovens e conversas com proposito.',
    tags: ['Louvor', 'Voluntariado', 'Cafe depois do culto'],
  },
  {
    id: 'samuel',
    name: 'Samuel',
    age: 29,
    city: 'Campinas, SP',
    church: 'Igreja Nova Alianca',
    lookingFor: 'both',
    compatibility: 91,
    bio: 'Lider de celula, gosta de trilhas leves e projetos de impacto social.',
    tags: ['Celula', 'Missoes', 'Esportes'],
  },
  {
    id: 'ester',
    name: 'Ester',
    age: 24,
    city: 'Belo Horizonte, MG',
    church: 'Ministerio Avivamento',
    lookingFor: 'friendship',
    compatibility: 89,
    bio: 'Busca amizades maduras para crescer em fe, carreira e rotina equilibrada.',
    tags: ['Networking', 'Mentoria', 'Devocional'],
  },
]

export const matchQueue: MatchPreview[] = [
  {
    id: 'naomi',
    name: 'Naomi',
    status: 'Nova conversa aberta',
    detail: 'Respondeu em 8 min apos o match.',
    sharedInterest: 'Acao social de sabado',
  },
  {
    id: 'davi',
    name: 'Davi',
    status: 'Match aquecido',
    detail: 'Troca de mensagens recorrente nos ultimos 3 dias.',
    sharedInterest: 'Ministerio de musica',
  },
  {
    id: 'miriam',
    name: 'Miriam',
    status: 'Sugestao IA pronta',
    detail: 'Prompt sugere primeiro encontro seguro em local publico.',
    sharedInterest: 'Grupo de leitura biblica',
  },
]

export const professionals: ProfessionalPreview[] = [
  {
    id: 'debora',
    name: 'Debora Nunes',
    role: 'Designer de identidade visual',
    city: 'Curitiba, PR',
    focus: 'Branding para igrejas, eventos e negocios familiares.',
    score: 'Alta resposta',
    specialties: ['Branding', 'Social media', 'Materiais de evento'],
  },
  {
    id: 'joao',
    name: 'Joao Vitor',
    role: 'Gestor de trafego',
    city: 'Recife, PE',
    focus: 'Campanhas para lancamentos, congressos e servicos locais.',
    score: 'ROI consistente',
    specialties: ['Meta Ads', 'Funis', 'Landing pages'],
  },
  {
    id: 'talita',
    name: 'Talita Ramos',
    role: 'Mentora de carreira',
    city: 'Rio de Janeiro, RJ',
    focus: 'Posicionamento e networking para profissionais cristaos.',
    score: 'Top recomendada',
    specialties: ['LinkedIn', 'Pitch', 'Mentoria'],
  },
]

export const communityPosts: CommunityPostPreview[] = [
  {
    id: 'post-1',
    author: 'Debora Nunes',
    role: 'Designer',
    title: 'Case: identidade visual para conferencia feminina',
    summary: 'Mostra o antes e depois do projeto, resultados de inscricoes e kit de divulgacao.',
    reach: '12.4k de alcance',
    engagement: '7.8% de engajamento',
    tags: ['Portfolio', 'Evento', 'Conversao'],
  },
  {
    id: 'post-2',
    author: 'Joao Vitor',
    role: 'Trafego pago',
    title: 'Funil de WhatsApp para secretaria e atendimento',
    summary: 'Explica como reduzir atraso nas respostas e aumentar confirmacao de leads.',
    reach: '38 leads qualificados',
    engagement: '14 reunioes marcadas',
    tags: ['WhatsApp', 'Automacao', 'Leads'],
  },
]

export const testimonials: TestimonialPreview[] = [
  {
    quote: 'A experiencia parece produto premium desde o primeiro clique. O onboarding conduz sem cansar.',
    author: 'Ana Paula',
    role: 'Pastora auxiliar',
  },
  {
    quote: 'A mistura de relacionamento intencional com rede profissional faz sentido comercial e comunitario.',
    author: 'Lucas Ferreira',
    role: 'Consultor de growth',
  },
]
