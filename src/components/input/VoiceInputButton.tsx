import { useState } from 'react'
import { Mic, X, Keyboard } from 'lucide-react'
import { AudioRecorder } from './AudioRecorder'
import { TextInputDialog } from './TextInputDialog'
import { cn } from '@/lib/utils'

export function VoiceInputButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'idle' | 'audio' | 'text'>('idle')

  const handleClose = () => {
    setIsOpen(false)
    setMode('idle')
  }

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl md:bottom-6',
          isOpen && 'scale-0 opacity-0'
        )}
      >
        <Mic className="h-6 w-6" />
      </button>

      {/* Input Options Panel */}
      {isOpen && mode === 'idle' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={handleClose}>
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nova entrada</h3>
              <button onClick={handleClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha como deseja registrar. A IA vai organizar automaticamente.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('audio')}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mic className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Gravar Áudio</span>
              </button>
              <button
                onClick={() => setMode('text')}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Keyboard className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Digitar Texto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Recorder */}
      {isOpen && mode === 'audio' && (
        <AudioRecorder onClose={handleClose} />
      )}

      {/* Text Input */}
      {isOpen && mode === 'text' && (
        <TextInputDialog onClose={handleClose} />
      )}
    </>
  )
}
