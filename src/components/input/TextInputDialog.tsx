import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TextInputDialogProps {
  onClose: () => void
}

export function TextInputDialog({ onClose }: TextInputDialogProps) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'anotacao' | 'agenda' | 'auto'>('auto')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim() || !user) return
    setSending(true)
    try {
      // Create queue item
      const { error: queueError } = await supabase
        .from('processing_queue')
        .insert({
          user_id: user.id,
          input_type: 'text',
          mode,
          text_input: text.trim(),
          status: 'pending',
        } as never)
      if (queueError) throw queueError

      // Call edge function
      supabase.functions.invoke('process-text', {
        body: { text: text.trim(), mode, user_id: user.id },
      }).catch(console.error)

      toast.success('Texto enviado! Processando...')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar texto')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Digitar Texto</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex rounded-lg border border-border bg-muted/50 p-0.5 mb-4">
          {(['auto', 'agenda', 'anotacao'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                mode === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m === 'auto' ? 'Auto' : m === 'agenda' ? 'Agenda' : 'Anotação'}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Descreva sua anotação ou compromisso. A IA vai interpretar e organizar automaticamente.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Reunião com João amanhã às 14h no escritório para discutir o projeto novo..."
          rows={5}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
          autoFocus
          maxLength={5000}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.length}/5000</span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
