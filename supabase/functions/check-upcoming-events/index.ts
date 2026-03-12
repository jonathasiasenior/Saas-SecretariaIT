import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = getSupabaseAdmin()
    const now = new Date()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Find events needing notification
    const { data: events, error } = await supabase
      .from('events')
      .select('*, profiles!inner(phone, email, full_name)')
      .or(
        `and(notify_24h.eq.true,notified_24h.eq.false,start_at.gte.${new Date(now.getTime() + 23 * 3600000).toISOString()},start_at.lte.${new Date(now.getTime() + 25 * 3600000).toISOString()}),` +
        `and(notify_8h.eq.true,notified_8h.eq.false,start_at.gte.${new Date(now.getTime() + 7 * 3600000).toISOString()},start_at.lte.${new Date(now.getTime() + 9 * 3600000).toISOString()}),` +
        `and(notify_1h.eq.true,notified_1h.eq.false,start_at.gte.${new Date(now.getTime() + 50 * 60000).toISOString()},start_at.lte.${new Date(now.getTime() + 70 * 60000).toISOString()})`
      )

    if (error) throw error
    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: 'No notifications to send' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user_settings for all unique user_ids
    const userIds = [...new Set(events.map((e: any) => e.user_id))]
    const { data: settingsData } = await supabase
      .from('user_settings')
      .select('*')
      .in('id', userIds)
    const settingsMap = Object.fromEntries((settingsData || []).map((s: any) => [s.id, s]))

    for (const event of events) {
      const startAt = new Date(event.start_at)
      const hoursUntil = (startAt.getTime() - now.getTime()) / 3600000

      let timeLabel = ''
      const updates: Record<string, boolean> = {}

      if (hoursUntil <= 1.2 && !event.notified_1h) {
        timeLabel = '1 hora'
        updates.notified_1h = true
      } else if (hoursUntil <= 9 && !event.notified_8h) {
        timeLabel = '8 horas'
        updates.notified_8h = true
      } else if (hoursUntil <= 25 && !event.notified_24h) {
        timeLabel = '24 horas'
        updates.notified_24h = true
      }

      if (!timeLabel) continue

      const profile = event.profiles as { phone: string | null; email: string; full_name: string }
      const settings = settingsMap[event.user_id] as { notification_push: boolean; notification_email: boolean; notification_whatsapp: boolean }
      if (!settings) continue
      const eventTime = startAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
      const eventDate = startAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })

      // Send Email
      if (settings.notification_email && profile.email) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              to: profile.email,
              subject: `Lembrete: ${event.title} em ${timeLabel}`,
              body: `
                <h3>Olá ${profile.full_name}!</h3>
                <p>Seu compromisso <strong>${event.title}</strong> é em <strong>${timeLabel}</strong>.</p>
                <p><strong>Data:</strong> ${eventDate}<br><strong>Horário:</strong> ${eventTime}</p>
                ${event.location ? `<p><strong>Local:</strong> ${event.location}</p>` : ''}
                ${event.description ? `<p>${event.description}</p>` : ''}
              `,
            }),
          })
          await supabase.from('notification_log').insert({
            user_id: event.user_id, event_id: event.id, channel: 'email', status: 'sent', sent_at: new Date().toISOString(),
          })
        } catch (e) {
          console.error('Email send error:', e)
          await supabase.from('notification_log').insert({
            user_id: event.user_id, event_id: event.id, channel: 'email', status: 'failed', error_message: e.message,
          })
        }
      }

      // Send WhatsApp
      if (settings.notification_whatsapp && profile.phone) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-notification-whatsapp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              phone: profile.phone,
              message: `🗓️ *Lembrete: ${event.title}*\n\nSeu compromisso é em *${timeLabel}*.\n📅 Data: ${eventDate}\n⏰ Horário: ${eventTime}${event.location ? `\n📍 Local: ${event.location}` : ''}${event.description ? `\n📝 ${event.description}` : ''}\n\n— Secretária Inteligente`,
            }),
          })
          await supabase.from('notification_log').insert({
            user_id: event.user_id, event_id: event.id, channel: 'whatsapp', status: 'sent', sent_at: new Date().toISOString(),
          })
        } catch (e) {
          console.error('WhatsApp send error:', e)
          await supabase.from('notification_log').insert({
            user_id: event.user_id, event_id: event.id, channel: 'whatsapp', status: 'failed', error_message: e.message,
          })
        }
      }

      // Push notification log
      if (settings.notification_push) {
        await supabase.from('notification_log').insert({
          user_id: event.user_id, event_id: event.id, channel: 'push', status: 'sent', sent_at: new Date().toISOString(),
        })
      }

      // Update notified flags
      await supabase.from('events').update(updates).eq('id', event.id)
    }

    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('check-upcoming-events error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
