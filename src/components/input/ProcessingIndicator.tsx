import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useProcessingQueue } from '@/hooks/useProcessingQueue'

export function ProcessingIndicator() {
  const { items, isProcessing } = useProcessingQueue()

  if (!isProcessing) return null

  return (
    <div className="mb-4 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm animate-fade-in"
        >
          {item.status === 'pending' && (
            <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
          )}
          {item.status === 'processing' && (
            <Loader2 className="h-4 w-4 animate-spin text-warning flex-shrink-0" />
          )}
          {item.status === 'completed' && (
            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
          )}
          {item.status === 'failed' && (
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          )}
          <span className="flex-1">
            {item.status === 'pending' && 'Na fila de processamento...'}
            {item.status === 'processing' && 'Processando com IA...'}
            {item.status === 'completed' && 'Processamento concluído!'}
            {item.status === 'failed' && `Erro: ${item.error_message || 'Falha no processamento'}`}
          </span>
          <span className="text-xs text-muted-foreground">
            {item.input_type === 'audio' ? 'Áudio' : 'Texto'} | {item.mode === 'auto' ? 'Auto' : item.mode === 'agenda' ? 'Agenda' : 'Anotação'}
          </span>
        </div>
      ))}
    </div>
  )
}
