const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

export async function transcribeAudioWhisper(
  audioBuffer: Uint8Array,
  mimeType: string
): Promise<string> {
  const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : 'ogg'
  const blob = new Blob([audioBuffer], { type: mimeType })

  const formData = new FormData()
  formData.append('file', blob, `audio.${ext}`)
  formData.append('model', 'whisper-1')
  formData.append('language', 'pt')
  formData.append('response_format', 'text')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI Whisper error (${response.status}): ${error}`)
  }

  const text = await response.text()
  return text.trim()
}

const SYSTEM_PROMPT = `Você é uma secretária inteligente. Analise o conteúdo fornecido e classifique como "anotacao" ou "agenda".

REGRAS DE CLASSIFICAÇÃO:
1. Se o conteúdo mencionar data, horário, compromisso, reunião, evento, consulta → classifique como "agenda"
2. Se o conteúdo for uma ideia, lembrete genérico, reflexão, lista, informação → classifique como "anotacao"
3. Se o usuário disser explicitamente "anotação" ou "nota" → classifique como "anotacao"
4. Se o usuário disser explicitamente "agenda" ou "compromisso" → classifique como "agenda"

Responda SEMPRE em JSON válido com este formato:

Para AGENDA:
{
  "type": "agenda",
  "title": "título curto do evento",
  "description": "descrição detalhada se houver",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "end_time": "HH:MM ou null",
  "location": "local se mencionado ou null",
  "all_day": false
}

Para ANOTAÇÃO:
{
  "type": "anotacao",
  "title": "título resumido da anotação",
  "content": "conteúdo organizado e bem formatado da anotação",
  "tags": ["tag1", "tag2"],
  "category": "categoria se identificável ou null"
}

REGRAS CRÍTICAS PARA DATA E HORÁRIO:
- Data de hoje: ${new Date().toISOString().split('T')[0]}
- EXTRAIA o horário EXATO que o usuário MENCIONOU no texto. NÃO use o horário atual.
- Exemplos: "às 18 horas" → "time": "18:00", "às 14:30" → "time": "14:30", "meio-dia" → "time": "12:00", "às 8 da manhã" → "time": "08:00", "às 3 da tarde" → "time": "15:00"
- "Amanhã" = dia seguinte à data de hoje, "segunda" = próxima segunda-feira, "hoje" = data de hoje
- Se não houver horário explícito mencionado, use "09:00" como padrão
- Se não houver data explícita mencionada, use a data de hoje
- O campo "time" deve SEMPRE refletir o horário que o usuário DISSE, nunca o horário em que a mensagem foi enviada
- Organize o conteúdo de forma clara e profissional
- Responda APENAS o JSON, sem texto adicional`

export async function classifyWithOpenAI(content: string, mode: string): Promise<Record<string, unknown>> {
  let prompt = SYSTEM_PROMPT
  if (mode === 'agenda') {
    prompt += '\n\nO usuário indicou que este conteúdo é para AGENDA. Classifique como agenda.'
  } else if (mode === 'anotacao') {
    prompt += '\n\nO usuário indicou que este conteúdo é para ANOTAÇÃO. Classifique como anotação.'
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Conteúdo do usuário: ${content}` },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI classify error (${response.status}): ${error}`)
  }

  const data = await response.json()
  const rawText = data.choices[0].message.content

  // Remove markdown code blocks se existirem
  let cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  // Extrai apenas o primeiro objeto JSON completo
  let depth = 0
  let start = -1
  let end = -1
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (depth === 0) start = i
      depth++
    } else if (cleaned[i] === '}') {
      depth--
      if (depth === 0) { end = i + 1; break }
    }
  }

  if (start === -1 || end === -1) throw new Error('Resposta da IA não contém JSON válido: ' + rawText)

  return JSON.parse(cleaned.substring(start, end))
}
