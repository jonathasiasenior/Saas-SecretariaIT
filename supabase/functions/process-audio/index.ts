import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts'
import { transcribeAudioWhisper, classifyWithOpenAI } from '../_shared/openai-client.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio_url, mode, user_id } = await req.json()
    if (!audio_url || !user_id) {
      return new Response(JSON.stringify({ error: 'audio_url and user_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = getSupabaseAdmin()

    // Find pending queue item
    const { data: queueItem } = await supabase
      .from('processing_queue')
      .select('id')
      .eq('user_id', user_id)
      .eq('input_type', 'audio')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const queueId = queueItem?.id

    if (queueId) {
      await supabase
        .from('processing_queue')
        .update({ status: 'processing' })
        .eq('id', queueId)
    }

    // Download audio from storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('audio-uploads')
      .download(audio_url)

    if (downloadError || !audioData) throw new Error('Falha ao baixar áudio: ' + downloadError?.message)

    // Transcribe audio with OpenAI Whisper
    const audioBuffer = new Uint8Array(await audioData.arrayBuffer())
    const mimeType = audio_url.endsWith('.webm') ? 'audio/webm' : 'audio/mp4'
    const transcription = await transcribeAudioWhisper(audioBuffer, mimeType)

    if (!transcription) throw new Error('Transcrição vazia')

    // Classify transcription with OpenAI
    const result = await classifyWithOpenAI(transcription, mode || 'auto')

    let resultType: string
    let resultId: string

    if (result.type === 'agenda') {
      // Monta a data no fuso de Brasília (UTC-3)
      const startDate = result.date && result.time
        ? `${result.date}T${result.time}:00-03:00`
        : new Date().toISOString()

      const endDate = result.end_time && result.date
        ? `${result.date}T${result.end_time}:00-03:00`
        : null

      const { data: event, error } = await supabase
        .from('events')
        .insert({
          user_id,
          title: result.title || 'Evento sem título',
          description: result.description || null,
          location: result.location || null,
          start_at: startDate,
          end_at: endDate,
          all_day: result.all_day || false,
          color: '#8B5CF6',
          source: 'voice',
          raw_input: transcription,
          notify_24h: true,
          notify_8h: true,
          notify_1h: true,
        })
        .select('id')
        .single()

      if (error) throw error
      resultType = 'event'
      resultId = event.id
    } else {
      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          user_id,
          title: result.title || 'Anotação sem título',
          content: result.content || transcription,
          tags: result.tags || [],
          category: result.category || null,
          source: 'voice',
          raw_input: transcription,
        })
        .select('id')
        .single()

      if (error) throw error
      resultType = 'note'
      resultId = note.id
    }

    if (queueId) {
      await supabase
        .from('processing_queue')
        .update({
          status: 'completed',
          result_type: resultType,
          result_id: resultId,
          processed_at: new Date().toISOString(),
        })
        .eq('id', queueId)
    }

    return new Response(
      JSON.stringify({ success: true, type: resultType, id: resultId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('process-audio error:', error)

    try {
      const { user_id } = await req.clone().json()
      const supabase = getSupabaseAdmin()
      await supabase
        .from('processing_queue')
        .update({
          status: 'failed',
          error_message: error.message || 'Erro desconhecido',
        })
        .eq('user_id', user_id)
        .eq('status', 'processing')
    } catch {}

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
