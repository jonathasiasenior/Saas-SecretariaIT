import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin, getSupabaseUser } from '../_shared/supabase-admin.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const ORIGINALS_BUCKET = 'product-images-originals'
const GENERATED_BUCKET = 'product-images-generated'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const OPENAI_MODELS = ['gpt-image-1.5', 'gpt-image-1']
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const BASE_PROMPT = `You are an expert commercial product photographer and high-conversion advertising creative director.
Create a new professional marketing image based on the uploaded product photo.
Preserve the product exactly as it is in the original image, including its model, shape, proportions, packaging, label structure, materials, colors, ingredients, quantity, and all defining visual characteristics.
Do not invent, remove, or replace product elements.
Do not add any text, letters, logos, price tags, stickers, badges, watermarks, or promotional banners.
Improve only the presentation, lighting, composition, realism, and commercial attractiveness.
The result must look like a real, premium, professionally photographed product advertisement.
The product must remain the clear focal point.`

const STYLE_PROMPTS = {
  CHAMATIVO: `Create a bold, vibrant, eye-catching advertising image designed for high sales conversion.
Make the image visually striking, polished, and creative, similar to a premium retail campaign or television commercial product shot.
Use vivid colors, dynamic but clean composition, attractive lighting, depth, contrast, and a background that matches the product category.
The image must feel highly appealing and marketable, but still realistic and professional.
No text.`,
  CONSERVADOR: `Create a conservative, elegant, clean commercial image with a neutral or soft background.
Use studio-quality lighting, balanced composition, subtle shadows, and a refined professional look.
Keep the image realistic, safe, minimal, and suitable for catalogs, marketplaces, and corporate product presentation.
No text.`,
} as const

const RETRY_COMPLEMENT_PROMPT =
  'Generate a new variation using the same product and the same style direction, but change the scene composition, camera framing, lighting arrangement, and background details while preserving the exact product identity.'

type ImageStyle = 'CHAMATIVO' | 'CONSERVADOR'
type ActionType = 'upload' | 'generate' | 'like' | 'dislike' | 'gallery'

type UploadPayload = {
  action: 'upload'
  fileName: string
  storagePath: string
  contentType: string
  width?: number | null
  height?: number | null
}

type GeneratePayload = {
  action: 'generate'
  originalImageId: string
  style: ImageStyle
  retryOfGenerationId?: string | null
}

type FeedbackPayload = {
  action: 'like' | 'dislike'
  generationId: string
}

type GalleryPayload = {
  action: 'gallery'
}

type RequestPayload = UploadPayload | GeneratePayload | FeedbackPayload | GalleryPayload

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
}

function assertStyle(style: string): style is ImageStyle {
  return style === 'CHAMATIVO' || style === 'CONSERVADOR'
}

function decodeBase64Image(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function buildPrompt(style: ImageStyle, retryCount: number) {
  const stylePrompt = STYLE_PROMPTS[style]
  const retryPrompt = retryCount > 0 ? RETRY_COMPLEMENT_PROMPT : ''
  return [BASE_PROMPT, stylePrompt, retryPrompt].filter(Boolean).join('\n\n').trim()
}

async function getUserFromAuthHeader(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const supabaseUser = getSupabaseUser(authHeader)
  const { data, error } = await supabaseUser.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

async function requestImageEdit(prompt: string, originalBlob: Blob) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.')
  }

  let lastError = ''

  for (const model of OPENAI_MODELS) {
    const formData = new FormData()
    formData.append('model', model)
    formData.append('prompt', prompt)
    formData.append('n', '1')
    formData.append('quality', 'high')
    formData.append('size', '1024x1024')
    formData.append('output_format', 'jpeg')
    formData.append('image', originalBlob, `original.${originalBlob.type.includes('png') ? 'png' : 'jpg'}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    try {
      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
        signal: controller.signal,
      })

      const payload = await response.json().catch(async () => ({ error: await response.text() }))

      if (!response.ok) {
        const errorText = JSON.stringify(payload)
        lastError = `OpenAI image edit error (${response.status}): ${errorText}`

        if (response.status === 400 && errorText.toLowerCase().includes('model')) {
          continue
        }

        throw new Error(lastError)
      }

      const firstData = payload?.data?.[0]
      if (!firstData) throw new Error('OpenAI image response has no data payload.')

      if (firstData.b64_json) {
        return {
          bytes: decodeBase64Image(firstData.b64_json),
          model,
        }
      }

      if (firstData.url) {
        const imageResp = await fetch(firstData.url)
        if (!imageResp.ok) {
          throw new Error(`Failed to download generated image URL (${imageResp.status}).`)
        }

        return {
          bytes: new Uint8Array(await imageResp.arrayBuffer()),
          model,
        }
      }

      throw new Error('OpenAI image response missing b64_json/url.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = 'OpenAI image edit timeout.'
      } else {
        lastError = error instanceof Error ? error.message : 'OpenAI request failed.'
      }

      if (lastError.toLowerCase().includes('model') && model !== OPENAI_MODELS[OPENAI_MODELS.length - 1]) {
        continue
      }

      throw new Error(lastError)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw new Error(lastError || 'Unable to generate image with available models.')
}

async function handleUpload(payload: UploadPayload, userId: string) {
  const { storagePath, fileName, contentType, width, height } = payload

  if (!fileName || !storagePath || !contentType) {
    return jsonResponse({ error: 'fileName, storagePath and contentType are required.' }, 400)
  }

  if (!storagePath.startsWith(`${userId}/`)) {
    return jsonResponse({ error: 'Invalid storage path ownership.' }, 403)
  }

  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return jsonResponse({ error: 'The uploaded file is not a supported image format.' }, 400)
  }

  const supabase = getSupabaseAdmin()

  const { data: uploadedFile, error: downloadError } = await supabase.storage
    .from(ORIGINALS_BUCKET)
    .download(storagePath)

  if (downloadError || !uploadedFile) {
    return jsonResponse({ error: 'Uploaded image not found in storage.' }, 400)
  }

  if (uploadedFile.size === 0) {
    return jsonResponse({ error: 'The uploaded file is empty.' }, 400)
  }

  if (uploadedFile.size > MAX_IMAGE_SIZE) {
    return jsonResponse({ error: 'The uploaded image is too large.' }, 400)
  }

  const { data: original, error: insertError } = await supabase
    .from('product_image_originals')
    .insert({
      user_id: userId,
      original_file_name: sanitizeFileName(fileName),
      storage_path: storagePath,
      content_type: contentType,
      width: typeof width === 'number' ? width : null,
      height: typeof height === 'number' ? height : null,
    })
    .select('id, storage_path, created_at')
    .single()

  if (insertError || !original) {
    return jsonResponse({ error: 'Failed to register uploaded image.' }, 500)
  }

  const { data: signedOriginal } = await supabase.storage
    .from(ORIGINALS_BUCKET)
    .createSignedUrl(storagePath, 60 * 60)

  return jsonResponse({
    originalImageId: original.id,
    originalImagePath: original.storage_path,
    originalImageUrl: signedOriginal?.signedUrl ?? null,
    createdAt: original.created_at,
  })
}

async function handleGenerate(payload: GeneratePayload, userId: string) {
  const { originalImageId, style, retryOfGenerationId } = payload

  if (!originalImageId || !style) {
    return jsonResponse({ error: 'originalImageId and style are required.' }, 400)
  }

  if (!assertStyle(style)) {
    return jsonResponse({ error: 'Invalid style value.' }, 400)
  }

  const supabase = getSupabaseAdmin()

  const { data: original, error: originalError } = await supabase
    .from('product_image_originals')
    .select('id, user_id, storage_path, content_type')
    .eq('id', originalImageId)
    .eq('user_id', userId)
    .single()

  if (originalError || !original) {
    return jsonResponse({ error: 'Original image not found.' }, 404)
  }

  let retryCount = 0

  if (retryOfGenerationId) {
    const { data: retrySource, error: retrySourceError } = await supabase
      .from('product_image_generations')
      .select('id, original_image_id, user_id, style')
      .eq('id', retryOfGenerationId)
      .eq('user_id', userId)
      .single()

    if (retrySourceError || !retrySource) {
      return jsonResponse({ error: 'retryOfGenerationId not found.' }, 404)
    }

    if (retrySource.original_image_id !== originalImageId || retrySource.style !== style) {
      return jsonResponse({ error: 'Retry must reuse the same original image and style.' }, 400)
    }

    const { count } = await supabase
      .from('product_image_generations')
      .select('id', { count: 'exact', head: true })
      .eq('original_image_id', originalImageId)
      .eq('user_id', userId)
      .eq('style', style)
      .not('retry_of_generation_id', 'is', null)

    retryCount = (count ?? 0) + 1
  }

  const prompt = buildPrompt(style, retryCount)

  const { data: generation, error: generationInsertError } = await supabase
    .from('product_image_generations')
    .insert({
      original_image_id: originalImageId,
      user_id: userId,
      style,
      prompt_used: prompt,
      openai_model: 'pending',
      status: 'pending',
      retry_of_generation_id: retryOfGenerationId ?? null,
    })
    .select('id, created_at')
    .single()

  if (generationInsertError || !generation) {
    return jsonResponse({ error: 'Failed to start generation request.' }, 500)
  }

  const updateFailedGeneration = async (message: string) => {
    await supabase
      .from('product_image_generations')
      .update({
        status: 'failed',
        error_message: message,
        openai_model: 'error',
      })
      .eq('id', generation.id)
      .eq('user_id', userId)
  }

  try {
    const { data: originalBlob, error: originalDownloadError } = await supabase.storage
      .from(ORIGINALS_BUCKET)
      .download(original.storage_path)

    if (originalDownloadError || !originalBlob) {
      throw new Error('Failed to read original uploaded image from storage.')
    }

    if (originalBlob.size === 0) {
      throw new Error('Original image file is empty.')
    }

    if (originalBlob.size > MAX_IMAGE_SIZE) {
      throw new Error('Original image size exceeds the allowed limit.')
    }

    const { bytes, model } = await requestImageEdit(prompt, originalBlob)

    const generatedPath = `${userId}/${generation.id}.jpg`
    const generatedBlob = new Blob([bytes], { type: 'image/jpeg' })

    const { error: uploadError } = await supabase.storage
      .from(GENERATED_BUCKET)
      .upload(generatedPath, generatedBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      throw new Error('Your image was uploaded, but saving the generated result failed.')
    }

    const { data: updated, error: updateError } = await supabase
      .from('product_image_generations')
      .update({
        status: 'completed',
        openai_model: model,
        storage_path: generatedPath,
        error_message: null,
      })
      .eq('id', generation.id)
      .eq('user_id', userId)
      .select('id, style, status, storage_path, prompt_used, created_at, is_liked, is_disliked, is_in_gallery')
      .single()

    if (updateError || !updated) {
      throw new Error('Image generated, but the database record update failed.')
    }

    const { data: signedGenerated } = await supabase.storage
      .from(GENERATED_BUCKET)
      .createSignedUrl(generatedPath, 60 * 60)

    return jsonResponse({
      generationId: updated.id,
      style: updated.style,
      status: updated.status,
      imagePath: updated.storage_path,
      imageUrl: signedGenerated?.signedUrl ?? null,
      promptUsed: updated.prompt_used,
      createdAt: updated.created_at,
      isLiked: updated.is_liked,
      isDisliked: updated.is_disliked,
      isInGallery: updated.is_in_gallery,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'We could not generate the image at this time. Please try again.'
    await updateFailedGeneration(errorMessage)
    return jsonResponse({ error: errorMessage, generationId: generation.id }, 500)
  }
}

async function handleFeedback(payload: FeedbackPayload, userId: string) {
  const { generationId, action } = payload

  if (!generationId) {
    return jsonResponse({ error: 'generationId is required.' }, 400)
  }

  const supabase = getSupabaseAdmin()

  const { data: generation, error: generationError } = await supabase
    .from('product_image_generations')
    .select('id, user_id, status, is_liked, is_disliked, is_in_gallery')
    .eq('id', generationId)
    .eq('user_id', userId)
    .single()

  if (generationError || !generation) {
    return jsonResponse({ error: 'Generation not found.' }, 404)
  }

  if (generation.status !== 'completed') {
    return jsonResponse({ error: 'Feedback can only be registered for completed generations.' }, 400)
  }

  if (generation.is_liked || generation.is_disliked) {
    return jsonResponse({ error: 'Feedback already registered.' }, 409)
  }

  const feedbackType = action === 'like' ? 'LIKE' : 'DISLIKE'

  const generationUpdate = action === 'like'
    ? { is_liked: true, is_disliked: false, is_in_gallery: true }
    : { is_liked: false, is_disliked: true, is_in_gallery: false }

  const { error: updateError } = await supabase
    .from('product_image_generations')
    .update(generationUpdate)
    .eq('id', generationId)
    .eq('user_id', userId)

  if (updateError) {
    return jsonResponse({ error: 'Failed to update generation feedback flags.' }, 500)
  }

  const { error: feedbackError } = await supabase
    .from('product_image_feedback')
    .upsert(
      {
        generation_id: generationId,
        user_id: userId,
        feedback_type: feedbackType,
      },
      { onConflict: 'generation_id,user_id' }
    )

  if (feedbackError) {
    return jsonResponse({ error: 'Failed to persist feedback record.' }, 500)
  }

  return jsonResponse({ success: true, feedbackType })
}

async function handleGallery(userId: string) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('product_image_generations')
    .select('id, original_image_id, style, status, storage_path, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('is_in_gallery', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return jsonResponse({ error: 'Failed to list gallery images.' }, 500)
  }

  const galleryItems = await Promise.all((data || []).map(async (row) => {
    let imageUrl: string | null = null

    if (row.storage_path) {
      const { data: signedData } = await supabase.storage
        .from(GENERATED_BUCKET)
        .createSignedUrl(row.storage_path, 60 * 60)
      imageUrl = signedData?.signedUrl ?? null
    }

    return {
      generationId: row.id,
      originalImageId: row.original_image_id,
      style: row.style,
      status: row.status,
      imagePath: row.storage_path,
      imageUrl,
      createdAt: row.created_at,
    }
  }))

  return jsonResponse({ items: galleryItems })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  const user = await getUserFromAuthHeader(req)
  if (!user) {
    return jsonResponse({ error: 'Unauthorized request.' }, 401)
  }

  try {
    const payload = await req.json() as RequestPayload
    const action = payload?.action as ActionType | undefined

    if (!action) {
      return jsonResponse({ error: 'action is required.' }, 400)
    }

    if (action === 'upload') {
      return await handleUpload(payload as UploadPayload, user.id)
    }

    if (action === 'generate') {
      return await handleGenerate(payload as GeneratePayload, user.id)
    }

    if (action === 'like' || action === 'dislike') {
      return await handleFeedback(payload as FeedbackPayload, user.id)
    }

    if (action === 'gallery') {
      return await handleGallery(user.id)
    }

    return jsonResponse({ error: 'Invalid action.' }, 400)
  } catch (error) {
    console.error('product-images error:', error)
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Internal server error.' },
      500
    )
  }
})
