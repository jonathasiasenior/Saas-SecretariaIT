import { z } from 'zod/v4'

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export const eventSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  location: z.string().optional(),
  start_at: z.string().min(1, 'Data/hora obrigatória'),
  end_at: z.string().optional(),
  all_day: z.boolean().default(false),
  color: z.string().default('#8B5CF6'),
})

export const noteSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  content: z.string().min(1, 'Conteúdo obrigatório'),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
})

export const textInputSchema = z.object({
  text: z.string().min(1, 'Digite algo').max(5000, 'Máximo 5000 caracteres'),
  mode: z.enum(['anotacao', 'agenda', 'auto']).default('auto'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EventInput = z.infer<typeof eventSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type TextInput = z.infer<typeof textInputSchema>
