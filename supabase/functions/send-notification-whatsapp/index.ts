import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, message } = await req.json()

    const WHATSAPP_INSTANCE = Deno.env.get('WHATSAPP_INSTANCE_ID')
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')

    if (!WHATSAPP_INSTANCE || !WHATSAPP_TOKEN) {
      console.warn('WhatsApp not configured')
      return new Response(JSON.stringify({ warning: 'WhatsApp not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch(
      `https://api.z-api.io/instances/${WHATSAPP_INSTANCE}/token/${WHATSAPP_TOKEN}/send-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          message,
        }),
      }
    )

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
