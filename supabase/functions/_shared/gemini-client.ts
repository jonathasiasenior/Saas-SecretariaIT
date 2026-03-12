import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const SYSTEM_PROMPT = `Você é uma secretária inteligente. Analise o conteúdo fornecido e classifique como "anotacao" ou "agenda".

REGRAS:
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

IMPORTANTE:
- Use a data de hoje como referência: ${new Date().toISOString().split('T')[0]}
- "Amanhã" = dia seguinte, "segunda" = próxima segunda, etc.
- Se não houver horário explícito, assuma 09:00
- Organize o conteúdo de forma clara e profissional
- Responda APENAS o JSON, sem texto adicional`

export async function processWithGemini(content: string, mode: string): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  let prompt = SYSTEM_PROMPT
  if (mode === 'agenda') {
    prompt += '\n\nO usuário indicou que este conteúdo é para AGENDA. Classifique como agenda.'
  } else if (mode === 'anotacao') {
    prompt += '\n\nO usuário indicou que este conteúdo é para ANOTAÇÃO. Classifique como anotação.'
  }

  const result = await model.generateContent([
    { text: prompt },
    { text: `Conteúdo do usuário: ${content}` },
  ])

  const response = result.response.text()

  // Extract JSON from response (handles markdown code blocks)
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Resposta da IA não contém JSON válido')

  return JSON.parse(jsonMatch[0])
}

export async function transcribeAudio(audioBuffer: Uint8Array, mimeType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent([
    { text: 'Transcreva o áudio a seguir em português. Retorne apenas a transcrição, sem formatação adicional.' },
    {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: btoa(String.fromCharCode(...audioBuffer)),
      },
    },
  ])

  return result.response.text().trim()
}
