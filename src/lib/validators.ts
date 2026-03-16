import { z } from 'zod/v4'

export const loginSchema = z.object({
  email: z.email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Minimo 2 caracteres'),
  email: z.email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Minimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao conferem',
  path: ['confirmPassword'],
})

export const eventSchema = z.object({
  title: z.string().min(1, 'Titulo obrigatorio'),
  description: z.string().optional(),
  location: z.string().optional(),
  start_at: z.string().min(1, 'Data/hora obrigatoria'),
  end_at: z.string().optional(),
  all_day: z.boolean().default(false),
  color: z.string().default('#8B5CF6'),
})

export const noteSchema = z.object({
  title: z.string().min(1, 'Titulo obrigatorio'),
  content: z.string().min(1, 'Conteudo obrigatorio'),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
})

export const textInputSchema = z.object({
  text: z.string().min(1, 'Digite algo').max(5000, 'Maximo 5000 caracteres'),
  mode: z.enum(['anotacao', 'agenda', 'auto']).default('auto'),
})

export const productImageStyleSchema = z.enum(['CHAMATIVO', 'CONSERVADOR'])

export const productImageGenerateSchema = z.object({
  originalImageId: z.uuid(),
  style: productImageStyleSchema,
  retryOfGenerationId: z.uuid().nullable().optional(),
})

export const qtcProfileSchema = z.object({
  display_name: z.string().min(2, 'Informe um nome visivel'),
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().min(2, 'Informe o estado').max(2, 'Use a sigla do estado'),
  church_name: z.string().max(120, 'Maximo 120 caracteres').optional().or(z.literal('')),
  looking_for: z.enum(['relationship', 'friendship', 'both']),
  bio: z.string().min(10, 'Escreva uma bio com pelo menos 10 caracteres').max(300, 'Maximo 300 caracteres'),
  tags: z.array(z.string()).max(6, 'Use ate 6 tags'),
  compatibility_focus: z.string().max(80, 'Maximo 80 caracteres').optional().or(z.literal('')),
  is_visible: z.boolean().default(true),
})

export const proProfileSchema = z.object({
  display_name: z.string().min(2, 'Informe um nome visivel'),
  role_title: z.string().min(2, 'Informe seu cargo ou especialidade'),
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().min(2, 'Informe o estado').max(2, 'Use a sigla do estado'),
  focus: z.string().min(10, 'Explique seu foco principal').max(240, 'Maximo 240 caracteres'),
  score_label: z.string().min(2, 'Informe um selo curto').max(40, 'Maximo 40 caracteres'),
  specialties: z.array(z.string()).max(8, 'Use ate 8 especialidades'),
  is_public: z.boolean().default(true),
})

export const proPostSchema = z.object({
  title: z.string().min(6, 'Titulo muito curto').max(120, 'Maximo 120 caracteres'),
  summary: z.string().min(20, 'Descreva melhor o case').max(500, 'Maximo 500 caracteres'),
  reach_label: z.string().min(2, 'Informe o alcance').max(60, 'Maximo 60 caracteres'),
  engagement_label: z.string().min(2, 'Informe o resultado').max(60, 'Maximo 60 caracteres'),
  tags: z.array(z.string()).max(6, 'Use ate 6 tags'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EventInput = z.infer<typeof eventSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type TextInput = z.infer<typeof textInputSchema>
export type ProductImageGenerateInput = z.infer<typeof productImageGenerateSchema>
export type QtcProfileInput = z.infer<typeof qtcProfileSchema>
export type ProProfileInput = z.infer<typeof proProfileSchema>
export type ProPostInput = z.infer<typeof proPostSchema>
