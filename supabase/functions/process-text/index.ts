import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts'
import { classifyWithOpenAI } from '../_shared/openai-client.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, mode, user_id } = await req.json()
    if (!text || !user_id) {
      return new Response(JSON.stringify({ error: 'text and user_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = getSupabaseAdmin()

    // Find pending queue item for this user
    const { data: queueItem } = await supabase
      .from('processing_queue')
      .select('id')
      .eq('user_id', user_id)
      .eq('input_type', 'text')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const queueId = queueItem?.id

    // Update status to processing
    if (queueId) {
      await supabase
        .from('processing_queue')
        .update({ status: 'processing' })
        .eq('id', queueId)
    }

    // Classify with OpenAI
    const result = await classifyWithOpenAI(text, mode || 'auto')

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
          source: 'text',
          raw_input: text,
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
      // Create note
      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          user_id,
          title: result.title || 'Anotação sem título',
          content: result.content || text,
          tags: result.tags || [],
          category: result.category || null,
          source: 'text',
          raw_input: text,
        })
        .select('id')
        .single()

      if (error) throw error
      resultType = 'note'
      resultId = note.id
    }

    // Update queue
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
    console.error('process-text error:', error)

    // Try to update queue with error
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
