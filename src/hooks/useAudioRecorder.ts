import { useState, useRef, useCallback } from 'react'
import { MAX_AUDIO_DURATION } from '@/lib/constants'

interface AudioRecorderState {
  isRecording: boolean
  duration: number
  audioBlob: Blob | null
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    duration: 0,
    audioBlob: null,
  })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
        setState((s) => ({ ...s, isRecording: false, audioBlob: blob }))
        stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
      }

      mediaRecorder.start(1000)
      startTimeRef.current = Date.now()
      setState({ isRecording: true, duration: 0, audioBlob: null })

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setState((s) => ({ ...s, duration: elapsed }))
        if (elapsed >= MAX_AUDIO_DURATION) {
          mediaRecorder.stop()
        }
      }, 1000)
    } catch (err) {
      console.error('Erro ao acessar microfone:', err)
      throw err
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const resetRecording = useCallback(() => {
    setState({ isRecording: false, duration: 0, audioBlob: null })
    chunksRef.current = []
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
