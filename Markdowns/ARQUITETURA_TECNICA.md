# Arquitetura Técnica - Secretária Inteligente

## Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + TypeScript | 19.x |
| Build | Vite | 7.x |
| Estilização | Tailwind CSS v4 | 4.x |
| Componentes UI | shadcn/ui (custom) | - |
| State Management | TanStack Query | 5.x |
| Roteamento | React Router DOM | 7.x |
| Backend | Supabase | 2.x |
| Banco de Dados | PostgreSQL (Supabase) | 15+ |
| Edge Functions | Deno (Supabase) | - |
| IA - Transcrição | OpenAI Whisper | whisper-1 |
| IA - Classificação | OpenAI GPT-4o-mini | gpt-4o-mini |
| Notificações | Resend (email), Z-API (WhatsApp), Web Push | - |

---

## Estrutura de Pastas

```
Saas-SecretariaIT/
├── index.html                      # Entry point HTML
├── package.json                    # Dependências e scripts
├── vite.config.ts                  # Config Vite + Tailwind + aliases
├── tsconfig.app.json               # TypeScript config com path aliases
├── .env                            # Variáveis de ambiente (NÃO commitar)
├── .env.example                    # Template de variáveis
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── favicon.svg                 # Ícone SVG
│   └── sw.js                       # Service Worker (push notifications)
├── supabase/
│   ├── migrations/                 # SQL migrations (9 arquivos)
│   │   ├── 00001_create_profiles.sql
│   │   ├── 00002_create_events.sql
│   │   ├── 00003_create_notes.sql
│   │   ├── 00004_create_processing_queue.sql
│   │   ├── 00005_create_notifications.sql
│   │   ├── 00006_create_user_settings.sql
│   │   ├── 00007_create_subscriptions.sql
│   │   ├── 00008_create_triggers.sql
│   │   └── 00009_create_storage.sql
│   └── functions/                  # Edge Functions (Deno)
│       ├── _shared/                # Módulos compartilhados
│       │   ├── cors.ts
│       │   ├── supabase-admin.ts
│       │   └── gemini-client.ts
│       ├── process-audio/          # Processar áudio com Gemini
│       ├── process-text/           # Processar texto com Gemini
│       ├── check-upcoming-events/  # Cron de notificações
│       ├── send-notification-email/
│       ├── send-notification-whatsapp/
│       └── admin-create-user/
├── Markdowns/
│   ├── ARQUITETURA_TECNICA.md      # Este arquivo
│   └── REGRAS_DE_NEGOCIO.md        # Regras de negócio
└── src/
    ├── main.tsx                    # Entry point React
    ├── App.tsx                     # Providers + Routing
    ├── index.css                   # Temas CSS + Tailwind
    ├── lib/
    │   ├── supabase.ts             # Cliente Supabase singleton
    │   ├── utils.ts                # cn() + helpers
    │   ├── constants.ts            # Constantes da app
    │   └── validators.ts           # Schemas Zod
    ├── types/
    │   └── database.ts             # Tipos TypeScript das tabelas
    ├── contexts/
    │   ├── AuthContext.tsx          # Auth state + provider
    │   └── ThemeContext.tsx         # Theme state + provider
    ├── hooks/
    │   ├── useAuth.ts (inline)     # Via AuthContext
    │   ├── useEvents.ts            # CRUD eventos + realtime
    │   ├── useNotes.ts             # CRUD notas + realtime + search
    │   ├── useCalendarView.ts      # Estado do calendário
    │   ├── useAudioRecorder.ts     # MediaRecorder wrapper
    │   ├── useProcessingQueue.ts   # Status da fila
    │   ├── useUserSettings.ts      # Config do usuário
    │   ├── useAdmin.ts             # Operações admin
    │   └── useRealtimeSubscription.ts # Realtime genérico
    ├── components/
    │   ├── ui/                     # 17 componentes base (shadcn-style)
    │   ├── layout/                 # AppLayout, Sidebar, Header, MobileNav
    │   ├── calendar/               # CalendarView, DayColumn, EventCard, etc.
    │   ├── notes/                  # NotesList, NoteCard, NoteForm, etc.
    │   ├── input/                  # VoiceInputButton, AudioRecorder, TextInput
    │   └── shared/                 # LoadingSpinner, EmptyState, RefreshButton
    └── pages/
        ├── LoginPage.tsx
        ├── RegisterPage.tsx
        ├── DashboardPage.tsx       # Calendário principal
        ├── NotesPage.tsx           # Listagem de notas
        ├── SettingsPage.tsx        # Configurações do usuário
        ├── AdminPage.tsx           # Gestão de usuários (admin)
        └── NotFoundPage.tsx
```

---

## Diagrama de Fluxo

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)               │
│                                                       │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐│
│  │ Calendar │  │  Notes   │  │Settings│  │  Admin  ││
│  └────┬─────┘  └────┬─────┘  └────┬───┘  └────┬────┘│
│       │              │             │            │      │
│  ┌────┴──────────────┴─────────────┴────────────┴───┐│
│  │           TanStack Query + Realtime               ││
│  └─────────────────────┬─────────────────────────────┘│
│                        │                               │
│  ┌─────────────────────┴─────────────────────────────┐│
│  │     VoiceInputButton (FAB) → Audio/Text Input     ││
│  └─────────────────────┬─────────────────────────────┘│
└────────────────────────┼──────────────────────────────┘
                         │ HTTPS
┌────────────────────────┼──────────────────────────────┐
│                   SUPABASE                             │
│                        │                               │
│  ┌─────────────────────┴────────────────────────┐     │
│  │              Edge Functions                   │     │
│  │  ┌──────────────┐  ┌──────────────────┐      │     │
│  │  │process-audio │  │  process-text    │      │     │
│  │  │   ↓ Whisper  │  │      ↓           │      │     │
│  │  │  OpenAI API  │  │  OpenAI API      │      │     │
│  │  │  GPT-4o-mini │  │  GPT-4o-mini     │      │     │
│  │  └──────┬───────┘  └──────┬───────────┘      │     │
│  │         └────────┬────────┘                   │     │
│  │                  ↓                            │     │
│  │     ┌──────────────────────┐                  │     │
│  │     │ check-upcoming-events│ ← cron-job.org   │     │
│  │     └──────────┬───────────┘                  │     │
│  │                ↓                              │     │
│  │  ┌─────────────┴──────────────┐               │     │
│  │  │ send-notification-email    │               │     │
│  │  │ send-notification-whatsapp │               │     │
│  │  └────────────────────────────┘               │     │
│  └───────────────────────────────────────────────┘     │
│                                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │              PostgreSQL                         │    │
│  │  profiles | events | notes | processing_queue   │    │
│  │  user_settings | subscriptions | notification_log│   │
│  │  + RLS policies em TODAS as tabelas             │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │              Storage                            │    │
│  │  bucket: audio-uploads (privado, RLS por user)  │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │              Realtime                           │    │
│  │  events, notes, processing_queue                │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

---

## Banco de Dados

### Tabelas

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `profiles` | Perfis de usuário | User own + Admin all |
| `events` | Eventos da agenda | User own only |
| `notes` | Anotações | User own only |
| `processing_queue` | Fila de processamento IA | User own only |
| `notification_log` | Log de notificações | User read own |
| `user_settings` | Configurações do usuário | User own only |
| `subscriptions` | Assinaturas/planos | User read + Admin all |

### Triggers

- `handle_new_user()`: Cria profile + settings + subscription ao registrar
- `update_updated_at()`: Atualiza `updated_at` em profiles, events, notes, user_settings

### Índices

- `idx_events_user_start`: Busca de eventos por usuário e data
- `idx_events_notification`: Eventos pendentes de notificação
- `idx_notes_user_created`: Notas por usuário, mais recentes primeiro
- `idx_notes_search`: Full-text search em português (GIN)

---

## Edge Functions

| Função | Trigger | Descrição |
|--------|---------|-----------|
| `process-audio` | Frontend POST | Baixa áudio, transcreve com OpenAI Whisper, classifica com GPT-4o-mini, salva |
| `process-text` | Frontend POST | Recebe texto, classifica com GPT-4o-mini, salva |
| `check-upcoming-events` | cron-job.org (5min) | Verifica eventos próximos, dispara notificações |
| `send-notification-email` | Interno | Envia email via Resend API |
| `send-notification-whatsapp` | Interno | Envia WhatsApp via Z-API |
| `admin-create-user` | Frontend POST | Cria usuário (admin only) |

### Secrets necessários no Supabase

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set RESEND_API_KEY=re_...          # pendente
supabase secrets set WHATSAPP_INSTANCE_ID=...       # pendente
supabase secrets set WHATSAPP_TOKEN=...             # pendente
```

### Cron de Notificações

- Serviço: **cron-job.org** (externo, gratuito)
- Intervalo: a cada 5 minutos
- URL chamada: `https://gpwhauitlzipzlyboyja.supabase.co/functions/v1/check-upcoming-events`
- Método: POST com `Authorization: Bearer <service_role_key>`
- O pg_cron do Supabase **não é usado** (limitação de DNS no plano gratuito)

---

## Deploy

### Frontend
```bash
npm run build    # Gera pasta dist/
# Upload dist/ para Netlify, Vercel, Cloudflare Pages ou similar
```

### Arquivo `_redirects` (Netlify)
```
/* /index.html 200
```

### Arquivo `vercel.json` (Vercel)
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Backend
```bash
# Migrations
supabase db push

# Edge Functions
supabase functions deploy process-audio
supabase functions deploy process-text
supabase functions deploy check-upcoming-events
supabase functions deploy send-notification-email
supabase functions deploy send-notification-whatsapp
supabase functions deploy admin-create-user
```

---

## Segurança

### Frontend
- Apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no frontend (públicos por design)
- Chave Gemini APENAS nos secrets das Edge Functions
- Sanitização de inputs com Zod schemas
- Proteção XSS com React escaping + DOMPurify
- CSP headers configurados no hosting

### Backend (Supabase)
- **RLS (Row Level Security)** em todas as tabelas
- **JWT verification** em todas Edge Functions
- **Storage RLS**: upload/leitura apenas na pasta do próprio usuário
- **Service Role Key** apenas nas Edge Functions, nunca no frontend
- **Rate limiting** nativo do Supabase + custom por função

### Autenticação
- Supabase Auth com email/senha
- Sessão persistida no localStorage (gerenciado pelo SDK)
- Auto-refresh de tokens
- Rotas protegidas no frontend com redirect para `/login`

---

## Performance

- **Code splitting**: Vite gera chunks separados (vendor, supabase, query, ui)
- **Realtime**: Supabase Realtime evita polling desnecessário
- **Stale time**: TanStack Query com staleTime de 60s
- **Skeleton loading**: Placeholders visuais durante carregamento
- **Fila de processamento**: Áudio/texto processados async, UI não bloqueia
- **PWA**: manifest.json para instalação como app
