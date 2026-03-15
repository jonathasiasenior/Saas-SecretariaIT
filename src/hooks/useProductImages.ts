import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  MAX_PRODUCT_IMAGE_SIZE,
  PRODUCT_IMAGE_ALLOWED_TYPES,
  type ProductImageStyle,
} from '@/lib/constants'
import type { ProductImageGeneration } from '@/types/database'

const ORIGINALS_BUCKET = 'product-images-originals'
const GENERATED_BUCKET = 'product-images-generated'

export interface UploadedOriginalImage {
  id: string
  path: string
  fileName: string
  url: string | null
}

export interface GeneratedImageResult {
  generationId: string
  style: ProductImageStyle
  status: 'completed' | 'failed' | 'pending'
  imagePath: string | null
  imageUrl: string | null
  promptUsed: string
  createdAt: string
  isLiked: boolean
  isDisliked: boolean
  isInGallery: boolean
}

export interface GalleryImage {
  generationId: string
  originalImageId: string
  style: ProductImageStyle
  status: 'completed' | 'failed' | 'pending'
  imagePath: string | null
  imageUrl: string | null
  createdAt: string
}

export type ProductImageHistoryItem = ProductImageGeneration & {
  imageUrl: string | null
}

function buildStoragePath(userId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  return `${userId}/${crypto.randomUUID()}-${safeName}`
}

function parseFunctionError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) return error.message
  return fallbackMessage
}

function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({ width: image.width, height: image.height })
      URL.revokeObjectURL(objectUrl)
    }

    image.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(objectUrl)
    }

    image.src = objectUrl
  })
}

async function getSignedGeneratedUrl(path: string | null) {
  if (!path) return null

  const { data } = await supabase.storage
    .from(GENERATED_BUCKET)
    .createSignedUrl(path, 60 * 60)

  return data?.signedUrl ?? null
}

export function useProductImages(originalImageId?: string | null) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const galleryQueryKey = useMemo(() => ['product-images-gallery', user?.id ?? ''], [user?.id])
  const historyQueryKey = useMemo(
    () => ['product-images-history', user?.id ?? '', originalImageId ?? ''],
    [user?.id, originalImageId]
  )

  const galleryQuery = useQuery({
    queryKey: galleryQueryKey,
    queryFn: async () => {
      if (!user) return [] as GalleryImage[]

      const { data, error } = await supabase.functions.invoke('product-images', {
        body: { action: 'gallery' },
      })

      if (error) {
        throw new Error(parseFunctionError(error, 'Falha ao carregar galeria'))
      }

      return (data?.items || []) as GalleryImage[]
    },
    enabled: !!user,
  })

  const historyQuery = useQuery({
    queryKey: historyQueryKey,
    queryFn: async () => {
      if (!user || !originalImageId) return [] as ProductImageHistoryItem[]

      const { data, error } = await supabase
        .from('product_image_generations')
        .select('*')
        .eq('user_id', user.id)
        .eq('original_image_id', originalImageId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error

      const generationData = (data || []) as ProductImageGeneration[]
      const items = await Promise.all(generationData.map(async (item) => ({
        ...item,
        imageUrl: item.status === 'completed' ? await getSignedGeneratedUrl(item.storage_path) : null,
      })))

      return items
    },
    enabled: !!user && !!originalImageId,
  })

  const uploadOriginal = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Usuario nao autenticado')

      if (!PRODUCT_IMAGE_ALLOWED_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number])) {
        throw new Error('Formato de imagem nao suportado. Use JPG, PNG ou WEBP.')
      }

      if (file.size <= 0) {
        throw new Error('Arquivo de imagem vazio.')
      }

      if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
        throw new Error('Imagem maior que 10MB.')
      }

      const storagePath = buildStoragePath(user.id, file.name)

      const { error: uploadError } = await supabase.storage
        .from(ORIGINALS_BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const dimensions = await getImageDimensions(file)

      const { data, error } = await supabase.functions.invoke('product-images', {
        body: {
          action: 'upload',
          fileName: file.name,
          storagePath,
          contentType: file.type,
          width: dimensions?.width ?? null,
          height: dimensions?.height ?? null,
        },
      })

      if (error) {
        throw new Error(parseFunctionError(error, 'Falha ao registrar upload'))
      }

      if (!data?.originalImageId || !data?.originalImagePath) {
        throw new Error('Resposta invalida ao registrar imagem original.')
      }

      return {
        id: data.originalImageId as string,
        path: data.originalImagePath as string,
        fileName: file.name,
        url: (data.originalImageUrl as string | null) ?? null,
      } satisfies UploadedOriginalImage
    },
  })

  const generateImage = useMutation({
    mutationFn: async (input: {
      originalImageId: string
      style: ProductImageStyle
      retryOfGenerationId?: string | null
    }) => {
      if (!user) throw new Error('Usuario nao autenticado')

      const { data, error } = await supabase.functions.invoke('product-images', {
        body: {
          action: 'generate',
          originalImageId: input.originalImageId,
          style: input.style,
          retryOfGenerationId: input.retryOfGenerationId ?? null,
        },
      })

      if (error) {
        throw new Error(parseFunctionError(error, 'Falha ao gerar imagem'))
      }

      if (!data?.generationId) {
        throw new Error(data?.error || 'Falha ao gerar imagem.')
      }

      return {
        generationId: data.generationId as string,
        style: data.style as ProductImageStyle,
        status: data.status as 'pending' | 'completed' | 'failed',
        imagePath: (data.imagePath as string | null) ?? null,
        imageUrl: (data.imageUrl as string | null) ?? null,
        promptUsed: (data.promptUsed as string) || '',
        createdAt: (data.createdAt as string) || new Date().toISOString(),
        isLiked: Boolean(data.isLiked),
        isDisliked: Boolean(data.isDisliked),
        isInGallery: Boolean(data.isInGallery),
      } satisfies GeneratedImageResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyQueryKey })
    },
  })

  const likeGeneration = useMutation({
    mutationFn: async (generationId: string) => {
      const { data, error } = await supabase.functions.invoke('product-images', {
        body: { action: 'like', generationId },
      })

      if (error) {
        throw new Error(parseFunctionError(error, 'Falha ao registrar like'))
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao registrar like')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKey })
      queryClient.invalidateQueries({ queryKey: historyQueryKey })
    },
  })

  const dislikeGeneration = useMutation({
    mutationFn: async (generationId: string) => {
      const { data, error } = await supabase.functions.invoke('product-images', {
        body: { action: 'dislike', generationId },
      })

      if (error) {
        throw new Error(parseFunctionError(error, 'Falha ao registrar dislike'))
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao registrar dislike')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyQueryKey })
      queryClient.invalidateQueries({ queryKey: galleryQueryKey })
    },
  })

  return {
    gallery: galleryQuery.data || [],
    history: historyQuery.data || [],
    isGalleryLoading: galleryQuery.isLoading,
    isHistoryLoading: historyQuery.isLoading,
    uploadOriginal,
    generateImage,
    likeGeneration,
    dislikeGeneration,
  }
}
