import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, RefreshCw, ThumbsDown, ThumbsUp, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useProductImages, type GeneratedImageResult, type UploadedOriginalImage } from '@/hooks/useProductImages'
import type { ProductImageStyle } from '@/lib/constants'

const styleCards: Array<{
  style: ProductImageStyle
  title: string
  description: string
  bullets: string[]
}> = [
  {
    style: 'CHAMATIVO',
    title: 'Chamativo',
    description: 'Visual de alto impacto para anuncios e redes sociais.',
    bullets: ['Cores vivas', 'Composicao criativa', 'Apelo comercial forte'],
  },
  {
    style: 'CONSERVADOR',
    title: 'Conservador',
    description: 'Estetica limpa e segura para catalogos e marketplaces.',
    bullets: ['Fundo neutro', 'Luz de estudio', 'Resultado minimalista'],
  },
]

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function ImagesPage() {
  const [selectedStyle, setSelectedStyle] = useState<ProductImageStyle | null>(null)
  const [originalImage, setOriginalImage] = useState<UploadedOriginalImage | null>(null)
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null)
  const [currentResult, setCurrentResult] = useState<GeneratedImageResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    gallery,
    history,
    isGalleryLoading,
    isHistoryLoading,
    uploadOriginal,
    generateImage,
    likeGeneration,
    dislikeGeneration,
  } = useProductImages(originalImage?.id)

  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl)
    }
  }, [originalPreviewUrl])

  const handlePickImage = () => fileInputRef.current?.click()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl)
    setOriginalPreviewUrl(previewUrl)

    try {
      const uploaded = await uploadOriginal.mutateAsync(file)
      setOriginalImage(uploaded)
      setCurrentResult(null)
      toast.success('Imagem original enviada com sucesso.')
    } catch (error) {
      setOriginalImage(null)
      setCurrentResult(null)
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar imagem.')
    }
  }

  const handleGenerate = async (retryOfGenerationId?: string | null) => {
    if (!originalImage || !selectedStyle) {
      toast.error('Envie uma imagem e escolha um estilo.')
      return
    }

    try {
      const generated = await generateImage.mutateAsync({
        originalImageId: originalImage.id,
        style: selectedStyle,
        retryOfGenerationId: retryOfGenerationId ?? null,
      })

      setCurrentResult(generated)
      toast.success('Imagem gerada com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao gerar imagem.')
    }
  }

  const handleLike = async () => {
    if (!currentResult) return

    try {
      await likeGeneration.mutateAsync(currentResult.generationId)
      setCurrentResult({ ...currentResult, isLiked: true, isDisliked: false, isInGallery: true })
      toast.success('Imagem salva na galeria.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao registrar like.')
    }
  }

  const handleDislikeAndRegenerate = async () => {
    if (!currentResult || !originalImage || !selectedStyle) return

    try {
      await dislikeGeneration.mutateAsync(currentResult.generationId)
      const regenerated = await generateImage.mutateAsync({
        originalImageId: originalImage.id,
        style: selectedStyle,
        retryOfGenerationId: currentResult.generationId,
      })

      setCurrentResult(regenerated)
      toast.success('Nova variacao gerada.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao gerar nova variacao.')
    }
  }

  const isBusy =
    uploadOriginal.isPending ||
    generateImage.isPending ||
    likeGeneration.isPending ||
    dislikeGeneration.isPending

  const canGenerate = !!originalImage && !!selectedStyle && !isBusy

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Imagens de Produto</h2>
          <p className="text-sm text-muted-foreground">Upload, geracao por estilo e galeria de resultados aprovados.</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="w-full lg:w-1/2 space-y-3">
            <p className="text-sm font-medium">1. Envie a foto original do produto</p>
            <button
              onClick={handlePickImage}
              disabled={uploadOriginal.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-sm font-medium hover:bg-muted/40 transition-colors disabled:opacity-60"
            >
              {uploadOriginal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadOriginal.isPending ? 'Enviando imagem...' : 'Selecionar imagem (JPG, PNG, WEBP)'}
            </button>
            <p className="text-xs text-muted-foreground">Tamanho maximo: 10MB</p>
            {originalImage && (
              <p className="text-xs text-success">Imagem registrada: {originalImage.fileName}</p>
            )}
          </div>

          <div className="w-full lg:w-1/2">
            <p className="mb-3 text-sm font-medium">Preview original</p>
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted/30">
              {originalPreviewUrl ? (
                <img src={originalPreviewUrl} alt="Produto original" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ImagePlus className="h-7 w-7" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        <p className="text-sm font-medium">2. Escolha o estilo</p>
        <div className="grid gap-3 md:grid-cols-2">
          {styleCards.map((card) => {
            const active = selectedStyle === card.style
            return (
              <button
                key={card.style}
                onClick={() => setSelectedStyle(card.style)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:bg-muted/40'
                }`}
              >
                <h3 className="text-base font-semibold">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.bullets.map((bullet) => (
                    <span key={bullet} className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {bullet}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleGenerate(null)}
            disabled={!canGenerate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {generateImage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Gerar imagem
          </button>

          {currentResult && (
            <button
              onClick={() => handleGenerate(currentResult.generationId)}
              disabled={!canGenerate}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              Nova variacao
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        <p className="text-sm font-medium">3. Resultado gerado</p>

        {!currentResult ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Gere uma imagem para visualizar o resultado aqui.
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
              {currentResult.imageUrl ? (
                <img src={currentResult.imageUrl} alt="Imagem gerada" className="w-full object-cover" />
              ) : (
                <div className="flex h-72 items-center justify-center text-muted-foreground">Sem preview</div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">Estilo: {currentResult.style}</span>
              <span className="rounded-full bg-muted px-2 py-1">Criado em: {formatDate(currentResult.createdAt)}</span>
              {currentResult.isInGallery && (
                <span className="rounded-full bg-success/20 px-2 py-1 text-success">Na galeria</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLike}
                disabled={isBusy || currentResult.isLiked || currentResult.isDisliked}
                className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-success-foreground disabled:opacity-60"
              >
                {likeGeneration.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                Gostei
              </button>

              <button
                onClick={handleDislikeAndRegenerate}
                disabled={isBusy || currentResult.isLiked || currentResult.isDisliked}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/40 disabled:opacity-60"
              >
                {dislikeGeneration.isPending || generateImage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsDown className="h-4 w-4" />
                )}
                Nao gostei e gerar outra
              </button>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Historico da imagem atual</p>
          {isHistoryLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {!originalImage ? (
          <p className="text-sm text-muted-foreground">Envie uma imagem para ver o historico de geracoes.</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma geracao para esta imagem ainda.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-background">
                <div className="aspect-square bg-muted/20">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={`Geracao ${item.id}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      {item.status}
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3 text-xs">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-muted px-2 py-1">{item.style}</span>
                    {item.is_liked && <span className="rounded-full bg-success/20 px-2 py-1 text-success">LIKE</span>}
                    {item.is_disliked && <span className="rounded-full bg-warning/20 px-2 py-1 text-warning-foreground">DISLIKE</span>}
                  </div>
                  <p className="text-muted-foreground">{formatDate(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Galeria (imagens curtidas)</p>
          {isGalleryLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {gallery.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma imagem aprovada ainda.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((item) => (
              <div key={item.generationId} className="overflow-hidden rounded-xl border border-border bg-background">
                <div className="aspect-square bg-muted/20">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={`Galeria ${item.generationId}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem preview</div>
                  )}
                </div>
                <div className="space-y-1 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-muted px-2 py-1">{item.style}</span>
                    <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
