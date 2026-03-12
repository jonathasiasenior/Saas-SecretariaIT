import { useState } from 'react'
import { Mic, Square, Send, X, RotateCcw } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { MAX_AUDIO_DURATION } from '@/lib/constants'
import { toast } from 'sonner'

interface AudioRecorderProps {
  onClose: () => void
}

export function AudioRecorder({ onClose }: AudioRecorderProps) {
  const { user } = useAuth()
  const { isRecording, duration, audioBlob, startRecording, stopRecording, resetRecording } = useAudioRecorder()
  const [mode, setMode] = useState<'anotacao' | 'agenda' | 'auto'>('auto')
  const [sending, setSending] = useState(false)

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSend = async () => {
    if (!audioBlob || !user) return
    setSending(true)
    try {
      // Upload audio
      const fileName = `${user.id}/${crypto.randomUUID()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(fileName, audioBlob, { contentType: audioBlob.type })
      if (uploadError) throw uploadError

      // Create queue item
      const { error: queueError } = await supabase
        .from('processing_queue')
        .insert({
          user_id: user.id,
          input_type: 'audio',
          mode,
          audio_url: fileName,
          status: 'pending',
        } as never)
      if (queueError) throw queueError

      // Call edge function
      supabase.functions.invoke('process-audio', {
        body: { audio_url: fileName, mode, user_id: user.id },
      }).catch(console.error)

      toast.success('Áudio enviado! Processando...')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar áudio')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Gravar Áudio</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex rounded-lg border border-border bg-muted/50 p-0.5 mb-6">
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

        {/* Recording UI */}
        <div className="flex flex-col items-center gap-4">
          {/* Timer */}
          <div className="text-3xl font-mono font-bold tabular-nums">
            {formatDuration(duration)}
          </div>
          <div className="text-xs text-muted-foreground">
            máximo {formatDuration(MAX_AUDIO_DURATION)}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(duration / MAX_AUDIO_DURATION) * 100}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                <Mic className="h-7 w-7" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                <div className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring" />
                <Square className="h-6 w-6" />
              </button>
            )}

            {audioBlob && !isRecording && (
              <>
                <button
                  onClick={resetRecording}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Send className="h-6 w-6" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
