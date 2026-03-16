# 🏗️ MicroSaaS — Documento de Arquitetura Completo
## Plataforma Dual: QTC (Quero Te Conhecer) + Rede de Profissionais

> **Versão:** 1.0.0  
> **Stack:** React 18 + TypeScript + Vite · Supabase · OpenAI · Deploy via `/dist`  
> **Objetivo:** Documento de referência para implementação via IA (Cursor, Copilot, Windsurf)

---

## 📋 ÍNDICE

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Stack Técnico Completo](#2-stack-técnico-completo)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Banco de Dados — Modelagem Completa](#4-banco-de-dados--modelagem-completa)
5. [Autenticação e Onboarding](#5-autenticação-e-onboarding)
6. [Módulo QTC — Quero Te Conhecer](#6-módulo-qtc--quero-te-conhecer)
7. [Módulo Rede de Profissionais](#7-módulo-rede-de-profissionais)
8. [Chat em Tempo Real](#8-chat-em-tempo-real)
9. [Sistema de Notificações](#9-sistema-de-notificações)
10. [Integrações OpenAI](#10-integrações-openai)
11. [Segurança Avançada](#11-segurança-avançada)
12. [Performance e Otimizações](#12-performance-e-otimizações)
13. [UI/UX — Sistema de Design](#13-uiux--sistema-de-design)
14. [Rotas e Navegação](#14-rotas-e-navegação)
15. [Variáveis de Ambiente](#15-variáveis-de-ambiente)
16. [Deploy — Passo a Passo](#16-deploy--passo-a-passo)
17. [Fases de Implementação](#17-fases-de-implementação)
18. [Componentes Compartilhados](#18-componentes-compartilhados)
19. [Regras de Negócio Consolidadas](#19-regras-de-negócio-consolidadas)

---

## 1. VISÃO GERAL DO PRODUTO

### O que é
Plataforma SaaS web responsiva (mobile-first) com dois módulos independentes acessados pelo mesmo login. O usuário escolhe qual módulo quer usar no onboarding, podendo ativar ambos futuramente.

### Módulos

| Módulo | Descrição | Inspiração |
|--------|-----------|------------|
| **QTC — Quero Te Conhecer** | Conexões afetivas para comunidades religiosas com feed de swipe | Tinder |
| **Rede de Profissionais** | Portfólio e networking profissional com feed de posts | LinkedIn + Instagram |

### Princípios do Produto
- **Mobile-First:** Toda UI projetada primeiro para telas de 375px
- **Zero Backend Próprio:** Tudo roda via Supabase — sem servidor Node.js próprio
- **Deploy Simples:** Build gera `/dist` estático — sobe em qualquer CDN
- **Privacidade:** Dados pessoais protegidos por RLS; fotos servidas com URL assinada
- **IA como Assistente:** OpenAI apenas para auxiliar o usuário, nunca para substituir decisões

---

## 2. STACK TÉCNICO COMPLETO

### Frontend
```
React 18              — UI principal com Concurrent Mode
TypeScript 5          — Tipagem estrita em todo o projeto
Vite 5                — Build tool ultrarrápido com HMR
React Router v6       — Roteamento client-side com layouts aninhados
Zustand               — Estado global leve (auth, módulo ativo, notificações)
TanStack Query v5     — Cache de dados, fetching, invalidação automática
Tailwind CSS v3       — Estilização utilitária com design tokens customizados
Framer Motion         — Animações: swipe de cards, transições de página
Radix UI Primitives   — Componentes acessíveis (modal, tooltip, dropdown)
React Hook Form       — Formulários com performance otimizada
Zod                   — Validação de schemas no frontend e compartilhado
Lucide React          — Ícones consistentes e leves
date-fns              — Manipulação de datas
```

### Backend (Supabase — BaaS)
```
Supabase Auth         — JWT, email/senha, Google OAuth, magic link
PostgreSQL 15         — Banco relacional com extensões (uuid-ossp, pg_trgm)
Supabase Realtime     — WebSocket para chat e notificações ao vivo
Supabase Storage      — Armazenamento de fotos com transformações de imagem
Supabase Edge Funcs   — Serverless TypeScript (Deno) para lógica sensível
Row Level Security    — Segurança a nível de linha em todas as tabelas
Database Functions    — Triggers SQL para lógica de match e contadores
```

### Integrações Externas
```
OpenAI API            — Moderação de conteúdo e sugestões de texto
  └─ Acesso APENAS via Supabase Edge Functions (chave NUNCA no frontend)
```

### Ferramentas de Dev
```
ESLint + Prettier     — Qualidade e formatação de código
Husky + lint-staged   — Pre-commit hooks
Vitest                — Testes unitários
Playwright            — Testes E2E
```

---

## 3. ESTRUTURA DE PASTAS

```
projeto-raiz/
│
├── public/
│   ├── _redirects              # Netlify: redireciona tudo para index.html
│   └── _headers                # Netlify: headers de segurança (CSP, CORS)
│
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Router + Providers globais
│   │
│   ├── app/
│   │   ├── providers/          # QueryClient, AuthProvider, ThemeProvider
│   │   └── routes/             # Definição centralizada de rotas
│   │
│   ├── modules/
│   │   ├── qtc/
│   │   │   ├── components/
│   │   │   │   ├── SwipeCard.tsx         # Card animado do feed
│   │   │   │   ├── SwipeStack.tsx        # Stack de cards com gestos
│   │   │   │   ├── MatchModal.tsx        # Modal de celebração de match
│   │   │   │   ├── LikeButton.tsx        # Botão curtir com animação
│   │   │   │   └── ProfileView.tsx       # Visualização expandida de perfil
│   │   │   ├── hooks/
│   │   │   │   ├── useSwipeFeed.ts       # Lógica do feed + prefetch
│   │   │   │   ├── useLike.ts            # Ação de curtir
│   │   │   │   └── useMatches.ts         # Lista de matches
│   │   │   ├── pages/
│   │   │   │   ├── QtcHomePage.tsx       # Feed de swipe
│   │   │   │   ├── MatchesPage.tsx       # Lista de matches
│   │   │   │   ├── QtcProfilePage.tsx    # Meu perfil QTC
│   │   │   │   └── QtcOnboarding.tsx     # Setup inicial do perfil QTC
│   │   │   └── services/
│   │   │       ├── qtc.service.ts        # Queries Supabase do módulo
│   │   │       └── qtc.types.ts          # Types TypeScript do módulo
│   │   │
│   │   └── professionals/
│   │       ├── components/
│   │       │   ├── PostCard.tsx          # Card de post no feed
│   │       │   ├── PostComments.tsx      # Seção de comentários
│   │       │   ├── CreatePostModal.tsx   # Modal de criação de post
│   │       │   ├── ProProfileCard.tsx    # Card de profissional
│   │       │   └── PhotoUploader.tsx     # Upload múltiplo de fotos
│   │       ├── hooks/
│   │       │   ├── useFeed.ts            # Feed infinito
│   │       │   ├── usePost.ts            # CRUD de posts
│   │       │   └── useProProfile.ts      # Perfil profissional
│   │       ├── pages/
│   │       │   ├── ProFeedPage.tsx       # Feed principal
│   │       │   ├── ProProfilePage.tsx    # Perfil do profissional
│   │       │   ├── PostDetailPage.tsx    # Post individual + comentários
│   │       │   └── ProOnboarding.tsx     # Setup do perfil profissional
│   │       └── services/
│   │           ├── pro.service.ts
│   │           └── pro.types.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/                       # Componentes base (Button, Input, etc.)
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.tsx        # Janela de conversa
│   │   │   │   ├── MessageBubble.tsx     # Bolha de mensagem com status
│   │   │   │   ├── MessageInput.tsx      # Campo de envio com emoji
│   │   │   │   └── ConversationList.tsx  # Lista de conversas
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx          # Layout principal (nav + content)
│   │   │   │   ├── BottomNav.tsx         # Navegação inferior mobile
│   │   │   │   └── TopBar.tsx            # Cabeçalho com título e ações
│   │   │   └── common/
│   │   │       ├── Avatar.tsx
│   │   │       ├── PhotoGallery.tsx
│   │   │       ├── InfiniteList.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── NotificationBadge.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts               # Hook de autenticação
│   │   │   ├── useNotifications.ts      # Hook de notificações realtime
│   │   │   ├── useChat.ts               # Hook de chat realtime
│   │   │   ├── useMediaUpload.ts        # Upload para Supabase Storage
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase.ts              # Cliente Supabase configurado
│   │   │   ├── supabase.types.ts        # Tipos gerados pelo Supabase CLI
│   │   │   └── constants.ts             # Constantes globais
│   │   │
│   │   └── store/
│   │       ├── auth.store.ts            # Estado: user, session, loading
│   │       ├── notification.store.ts    # Estado: contagem de notificações
│   │       └── module.store.ts          # Estado: módulo ativo
│   │
│   └── styles/
│       ├── globals.css                  # Tokens CSS, reset, variáveis
│       └── animations.css               # Keyframes reutilizáveis
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   ├── 002_qtc_module.sql
│   │   ├── 003_professionals_module.sql
│   │   ├── 004_chat.sql
│   │   ├── 005_notifications.sql
│   │   ├── 006_rls_policies.sql
│   │   └── 007_functions_triggers.sql
│   └── functions/
│       ├── moderate-content/index.ts    # Moderação via OpenAI
│       ├── suggest-bio/index.ts         # Sugestão de bio via OpenAI
│       └── send-notification/index.ts  # Notificações push (futuro)
│
├── .env.example
├── .env.local                           # NUNCA commitar
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. BANCO DE DADOS — MODELAGEM COMPLETA

> Todas as tabelas usam `uuid` como PK gerado via `gen_random_uuid()`.  
> Timestamps em `timestamptz` com `DEFAULT now()`.  
> RLS habilitado em todas as tabelas.

---

### 4.1 Tabela: `profiles` (extensão do auth.users)

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL CHECK (length(full_name) >= 2),
  username        TEXT UNIQUE,
  avatar_url      TEXT,
  bio             TEXT CHECK (length(bio) <= 500),
  birth_date      DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone           TEXT,
  active_modules  TEXT[] DEFAULT '{}',  -- ['qtc', 'professionals']
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Trigger: atualiza updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: cria profile ao criar usuário no Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 4.2 Módulo QTC — Tabelas

```sql
-- Perfil específico do módulo QTC
CREATE TABLE qtc_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  church_name     TEXT,                          -- Igreja que frequenta
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  looking_for     TEXT NOT NULL CHECK (
                    looking_for IN ('relationship', 'friendship', 'both')
                  ),
  height_cm       INT CHECK (height_cm BETWEEN 100 AND 250),
  photos          TEXT[] DEFAULT '{}',           -- Max 6 URLs do Storage
  is_visible      BOOLEAN DEFAULT true,          -- Aparece no feed?
  last_seen       TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Likes dados entre usuários
CREATE TABLE qtc_likes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_self_like CHECK (from_user_id != to_user_id),
  CONSTRAINT unique_like UNIQUE (from_user_id, to_user_id)
);

-- Passes (não curtir) — evita reaparecer no feed
CREATE TABLE qtc_passes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_pass UNIQUE (from_user_id, to_user_id)
);

-- Matches confirmados
CREATE TABLE qtc_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active       BOOLEAN DEFAULT true,           -- false = match desfeito
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ordered_match CHECK (user_a_id < user_b_id),
  CONSTRAINT unique_match UNIQUE (user_a_id, user_b_id)
);

-- Trigger: detecta match mútuo automaticamente
CREATE OR REPLACE FUNCTION check_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
  v_user_a UUID;
  v_user_b UUID;
  v_conversation_id UUID;
BEGIN
  -- Verifica se existe like no sentido oposto
  IF EXISTS (
    SELECT 1 FROM qtc_likes
    WHERE from_user_id = NEW.to_user_id
      AND to_user_id = NEW.from_user_id
  ) THEN
    -- Ordena IDs para evitar duplicata
    v_user_a := LEAST(NEW.from_user_id, NEW.to_user_id);
    v_user_b := GREATEST(NEW.from_user_id, NEW.to_user_id);

    -- Cria o match
    INSERT INTO qtc_matches (user_a_id, user_b_id)
    VALUES (v_user_a, v_user_b)
    ON CONFLICT DO NOTHING;

    -- Cria a conversa automaticamente
    INSERT INTO conversations (participant_a, participant_b)
    VALUES (v_user_a, v_user_b)
    RETURNING id INTO v_conversation_id;

    -- Cria notificação de match para ambos
    INSERT INTO notifications (user_id, type, reference_id, payload)
    VALUES
      (NEW.from_user_id, 'match', v_conversation_id,
        json_build_object('matched_with', NEW.to_user_id)),
      (NEW.to_user_id, 'match', v_conversation_id,
        json_build_object('matched_with', NEW.from_user_id));
  ELSE
    -- Apenas like: notifica o destinatário
    INSERT INTO notifications (user_id, type, reference_id, payload)
    VALUES (
      NEW.to_user_id, 'like', NEW.from_user_id,
      json_build_object('from_user', NEW.from_user_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_qtc_like_created
  AFTER INSERT ON qtc_likes
  FOR EACH ROW EXECUTE FUNCTION check_mutual_like();
```

---

### 4.3 Módulo Rede de Profissionais — Tabelas

```sql
-- Perfil profissional
CREATE TABLE pro_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profession        TEXT NOT NULL CHECK (length(profession) >= 2),
  specialties       TEXT[] DEFAULT '{}',          -- Especialidades
  description       TEXT CHECK (length(description) <= 1000),
  city              TEXT NOT NULL,
  state             TEXT NOT NULL,
  whatsapp          TEXT,                          -- Formato: 5511999999999
  website_url       TEXT,
  portfolio_photos  TEXT[] DEFAULT '{}',           -- Max 10 URLs
  years_experience  INT CHECK (years_experience >= 0),
  is_available      BOOLEAN DEFAULT true,
  service_area      TEXT[],                        -- Cidades/regiões atendidas
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Posts do feed profissional
CREATE TABLE pro_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caption         TEXT CHECK (length(caption) <= 500),
  photo_urls      TEXT[] NOT NULL DEFAULT '{}',   -- 1 a 4 fotos obrigatórias
  likes_count     INT DEFAULT 0,
  comments_count  INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,            -- false = post deletado (soft delete)
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT has_photos CHECK (array_length(photo_urls, 1) BETWEEN 1 AND 4)
);

-- Curtidas em posts
CREATE TABLE pro_post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES pro_posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id)
);

-- Comentários em posts
CREATE TABLE pro_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES pro_posts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 300),
  is_active   BOOLEAN DEFAULT true,               -- Soft delete
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Seguir profissional (para futuro algoritmo de feed personalizado)
CREATE TABLE pro_follows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Triggers para manter contadores atualizados
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pro_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pro_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_liked   AFTER INSERT ON pro_post_likes FOR EACH ROW EXECUTE FUNCTION increment_likes_count();
CREATE TRIGGER on_post_unliked AFTER DELETE ON pro_post_likes FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();
```

---

### 4.4 Chat — Tabelas

```sql
-- Conversas (geradas automaticamente por match ou manualmente no futuro)
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_b   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT ordered_participants CHECK (participant_a < participant_b),
  CONSTRAINT unique_conversation UNIQUE (participant_a, participant_b)
);

-- Mensagens
CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content           TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 2000),
  status            TEXT DEFAULT 'sent'
                      CHECK (status IN ('sent', 'delivered', 'read')),
  delivered_at      TIMESTAMPTZ,
  read_at           TIMESTAMPTZ,
  is_deleted        BOOLEAN DEFAULT false,        -- Soft delete (apagar para mim)
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Index para performance em listagem de mensagens por conversa
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Trigger: atualiza last_message_at na conversa
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
```

---

### 4.5 Notificações — Tabela

```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (
                  type IN ('like', 'match', 'message', 'comment', 'follow', 'system')
                ),
  reference_id  UUID,                             -- ID da entidade relacionada
  payload       JSONB DEFAULT '{}',               -- Dados extras
  is_read       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index para listar notificações não lidas rapidamente
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;
```

---

## 5. AUTENTICAÇÃO E ONBOARDING

### 5.1 Fluxo Completo de Cadastro

```
PASSO 1 — Landing Page
  └─ CTA: "Começar Agora" / "Entrar"

PASSO 2 — Escolha de Módulo (pré-cadastro)
  └─ Card: QTC — Quero Te Conhecer
  └─ Card: Rede de Profissionais
  └─ Opção: "Ambos" (ativa os dois módulos)

PASSO 3 — Cadastro
  └─ Campos: Nome completo, Email, Senha (mín. 8 chars, 1 maiúscula, 1 número)
  └─ OU: "Continuar com Google"
  └─ Checkbox: Aceitar termos de uso e política de privacidade

PASSO 4 — Verificação de Email
  └─ Email enviado com link de confirmação
  └─ Tela aguardando confirmação com opção de reenvio

PASSO 5 — Perfil Base (obrigatório para todos)
  └─ Foto de perfil (obrigatória)
  └─ Data de nascimento (mín. 18 anos)
  └─ Gênero
  └─ Cidade / Estado

PASSO 6a — Onboarding QTC (se escolheu QTC)
  └─ Igreja que frequenta
  └─ O que está buscando (Relacionamento / Amizade / Ambos)
  └─ Fotos adicionais (mín. 1, máx. 6)
  └─ Bio (até 300 caracteres)

PASSO 6b — Onboarding Profissional (se escolheu Profissional)
  └─ Profissão/Área
  └─ Especialidades (tags)
  └─ Descrição dos serviços (até 500 caracteres)
  └─ WhatsApp para contato
  └─ Pelo menos 1 foto de portfólio

PASSO 7 — Redirecionamento para Home do módulo escolhido
```

### 5.2 Regras de Auth

- Idade mínima: 18 anos (validada no frontend E via trigger SQL)
- Email confirmado obrigatório antes de acessar qualquer módulo
- Sessão persistida no `localStorage` via Supabase Auth SDK
- Ao fazer logout: limpar Zustand store + invalidar todas as queries do TanStack Query
- Social login (Google): preenche nome e foto automaticamente, ainda assim passa pelo onboarding

### 5.3 Proteção de Rotas

```typescript
// Middleware de proteção por status do usuário
// routes/ProtectedRoute.tsx
type RouteStatus =
  | 'public'           // Acesso sem login (landing, login, cadastro)
  | 'authenticated'    // Login necessário
  | 'qtc_active'       // Deve ter módulo QTC ativo e perfil completo
  | 'pro_active'       // Deve ter módulo profissional ativo e perfil completo

// Redirecionamentos automáticos:
// Não autenticado → /auth/login
// Autenticado sem onboarding → /onboarding
// QTC sem perfil completo → /qtc/onboarding
// Profissional sem perfil completo → /pro/onboarding
```

---

## 6. MÓDULO QTC — QUERO TE CONHECER

### 6.1 Feed de Swipe — Regras de Negócio

**O que o feed mostra:**
- Perfis com `is_visible = true`
- Com pelo menos 1 foto
- Com perfil QTC completo
- Que NÃO foram curtidos ou passados pelo usuário atual
- De gênero diferente do usuário (padrão, pode ser alterado nas preferências)

**Algoritmo de ordenação do feed:**
1. Primeiro: usuários da mesma cidade
2. Segundo: usuários do mesmo estado
3. Terceiro: demais usuários
4. Fator secundário: perfis mais completos aparecem antes

**Query do Feed:**
```sql
SELECT qp.*, p.full_name, p.avatar_url, p.bio, p.birth_date
FROM qtc_profiles qp
JOIN profiles p ON p.id = qp.user_id
WHERE
  qp.is_visible = true
  AND qp.user_id != auth.uid()
  AND array_length(qp.photos, 1) >= 1
  AND qp.user_id NOT IN (
    SELECT to_user_id FROM qtc_likes WHERE from_user_id = auth.uid()
  )
  AND qp.user_id NOT IN (
    SELECT to_user_id FROM qtc_passes WHERE from_user_id = auth.uid()
  )
ORDER BY
  (qp.city = (SELECT city FROM qtc_profiles WHERE user_id = auth.uid())) DESC,
  (qp.state = (SELECT state FROM qtc_profiles WHERE user_id = auth.uid())) DESC,
  p.created_at DESC
LIMIT 20;
```

**Prefetch:** Quando restam 3 cards, buscar os próximos 20 automaticamente.

### 6.2 Interações do Swipe

```
Gesto / Ação          → Resultado
─────────────────────────────────────────────
Swipe direita         → Like (coração verde aparece)
Swipe esquerda        → Pass (X vermelho aparece)
Botão ❤️              → Like (equivalente ao swipe direito)
Botão ✕               → Pass (equivalente ao swipe esquerdo)
Botão ↩ (voltar)      → Desfaz último pass (máx. 1 por sessão no plano free)
Clique na foto        → Expande para ver todas as fotos e bio completa
```

**Animações (Framer Motion):**
- Drag: Card segue o dedo/cursor com rotação suave
- Threshold em 100px: ícone de like/pass aparece ao arrastar
- Release após threshold: card voa para fora da tela
- Release antes do threshold: card volta ao centro com spring animation
- Próximo card escala de 0.95 para 1.0 conforme o primeiro é movido

### 6.3 Sistema de Match

```
1. Usuário A swipa direito em B → INSERT em qtc_likes
2. Trigger SQL verifica se B já curtiu A
3. Se SIM (match mútuo):
   a. INSERT em qtc_matches (user_a, user_b ordenados por UUID)
   b. INSERT em conversations (participant_a, participant_b)
   c. INSERT em notifications para A: type='match'
   d. INSERT em notifications para B: type='match'
   e. Frontend de A recebe evento Realtime → exibe MatchModal animado
4. Se NÃO:
   a. INSERT em notifications para B: type='like' (sem revelar quem curtiu)
   b. Nenhuma ação visível para A
```

**MatchModal:** Animação de celebração com confetti, fotos dos dois, botão "Enviar Mensagem" e botão "Ver Mais Perfis".

### 6.4 Perfil QTC — Visualização

Ao expandir um card:
```
Foto principal + galeria (swipe horizontal)
Nome + Idade calculada
Cidade / Estado
Igreja
Buscando: [tag]
Bio completa
Altura (se preenchida)
Botões de ação: Pass / Like
```

### 6.5 Tela de Matches

- Lista de todos os matches do usuário
- Ordenado por: última mensagem recente primeiro, depois por data do match
- Indicador de mensagens não lidas
- Clique → abre o chat

---

## 7. MÓDULO REDE DE PROFISSIONAIS

### 7.1 Feed de Posts — Regras de Negócio

**Ordenação:**
- Padrão: cronológico reverso (mais recentes primeiro)
- Posts de profissionais seguidos aparecem levemente priorizados
- Posts com mais engajamento nas últimas 24h sobem levemente

**Paginação:** Cursor-based pagination (infinito, 10 posts por vez)

**O feed exibe:**
- Post com fotos (1-4, navegação horizontal no card)
- Nome e profissão do autor com link para perfil
- Caption (expandível se > 3 linhas)
- Contagem de curtidas e comentários
- Botões: Curtir, Comentar, Compartilhar (copia link), Contato (WhatsApp)

### 7.2 Perfil do Profissional

```
Header:
  Foto de perfil + Nome
  Profissão + Especialidades (chips)
  Cidade | Anos de experiência | Disponibilidade (badge)

Sobre:
  Descrição completa dos serviços

Portfólio:
  Grid de fotos (3 colunas, clique para lightbox)

Contato:
  Botão WhatsApp (abre wa.me/numero)
  Website (link externo)
  Cidade de atendimento

Posts:
  Lista dos posts do profissional (grid ou lista)
```

### 7.3 Criação de Post

```
1. Botão "+" na navbar abre CreatePostModal
2. Upload de 1 a 4 fotos (drag & drop ou seleção)
3. Preview das fotos com opção de reordenar
4. Campo de legenda (máx 500 chars, contador visível)
5. Antes de publicar: Edge Function modera o conteúdo via OpenAI
6. Se aprovado: INSERT em pro_posts → aparece no feed em tempo real
7. Se reprovado: mensagem amigável explicando o motivo
```

### 7.4 Curtidas e Comentários

**Curtir:**
- Toggle: curtir / descurtir
- Animação de coração (like Instagram)
- Contador atualizado em tempo real via trigger

**Comentários:**
- Expansão inline abaixo do post
- Mostrar últimos 3 comentários no card do feed
- Clique em "Ver todos os comentários" → abre PostDetailPage
- Moderação via OpenAI antes de publicar
- Dono pode deletar qualquer comentário do próprio post

---

## 8. CHAT EM TEMPO REAL

### 8.1 Arquitetura

```
Frontend                    Supabase Realtime              Database
────────                    ────────────────               ────────
  │                                │                          │
  ├── Subscribe ao canal           │                          │
  │   messages:{conv_id}  ─────►  │                          │
  │                                │                          │
  ├── INSERT mensagem ─────────────┼─────────────────────────►│
  │                                │◄── Broadcast do INSERT ──┤
  │◄───────────────── Evento ──────┤                          │
  │                                │                          │
  ├── Marcar delivered ────────────┼─────────────────────────►│
  │                                │◄── Broadcast UPDATE ─────┤
  │◄───────────────── Evento ──────┤                          │
```

### 8.2 Status de Mensagens (estilo WhatsApp)

```
Ícone   Status       Quando ocorre
──────  ─────────    ─────────────────────────────────────
 ✓      sent         Mensagem salva no banco
 ✓✓     delivered    Destinatário está com o app aberto
 ✓✓🔵   read         Destinatário abriu a conversa
```

**Implementação do status:**

```typescript
// Ao abrir uma conversa: marcar todas como 'delivered'
supabase.from('messages')
  .update({ status: 'delivered', delivered_at: new Date() })
  .eq('conversation_id', convId)
  .neq('sender_id', myUserId)
  .eq('status', 'sent')

// Ao focar na aba da conversa: marcar como 'read'
supabase.from('messages')
  .update({ status: 'read', read_at: new Date() })
  .eq('conversation_id', convId)
  .neq('sender_id', myUserId)
  .in('status', ['sent', 'delivered'])

// Subscription para receber updates de status das próprias mensagens
supabase
  .channel(`messages:${convId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${convId}`
  }, handleStatusUpdate)
  .subscribe()
```

### 8.3 UI do Chat

```
┌─────────────────────────────┐
│  ← [Avatar] Nome            │  ← TopBar com back + perfil
├─────────────────────────────┤
│                             │
│   [Mensagem deles]          │  ← Bolha esquerda (cinza)
│                             │
│              [Mensagem minha] ✓✓🔵  │  ← Bolha direita (cor primária)
│                             │
│   [Mensagem deles]          │
│                             │
├─────────────────────────────┤
│  [😊] [Digite...     ] [►]  │  ← Input bar
└─────────────────────────────┘
```

**Features do chat:**
- Scroll automático para última mensagem ao abrir
- Agrupamento de mensagens por data (separadores "Hoje", "Ontem", "12/03/2026")
- "Digitando..." indicator quando o outro está escrevendo (via Realtime Presence)
- Carregamento de mensagens anteriores ao scroll para cima (paginação reversa)
- Proteção contra spam: máx. 30 mensagens por minuto

### 8.4 Lista de Conversas

- Ordenada por `last_message_at DESC`
- Preview da última mensagem (truncado em 50 chars)
- Badge com contagem de mensagens não lidas
- Foto e nome do contato
- Tempo relativo da última mensagem ("2 min", "ontem", "12/03")

---

## 9. SISTEMA DE NOTIFICAÇÕES

### 9.1 Tipos de Notificação

| Type | Mensagem | Módulo |
|------|----------|--------|
| `like` | "Alguém curtiu seu perfil! 👀" | QTC |
| `match` | "Você fez um match! 🎉 Diga olá" | QTC |
| `message` | "[Nome]: [preview da mensagem]" | QTC |
| `comment` | "[Nome] comentou no seu post" | Profissional |
| `follow` | "[Nome] começou a seguir você" | Profissional |
| `system` | Avisos gerais da plataforma | Ambos |

> **Privacidade QTC:** Notificação de `like` NÃO revela quem curtiu.  
> O usuário só descobre se houver match.

### 9.2 Entrega em Tempo Real

```typescript
// Subscribe ao canal de notificações do usuário logado
supabase
  .channel(`notifications:${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Atualizar contador no Zustand
    // Exibir toast de notificação
    // Tocar som (se habilitado)
  })
  .subscribe()
```

### 9.3 Centro de Notificações

- Ícone de sino na TopBar com badge de contagem não lida
- Ao clicar: drawer lateral ou página com lista de notificações
- Clique em notificação: navega para a entidade relacionada + marca como lida
- Botão "Marcar todas como lidas"

---

## 10. INTEGRAÇÕES OPENAI

> ⚠️ **REGRA DE OURO:** A `OPENAI_API_KEY` NUNCA é enviada ao frontend.  
> Todo acesso à OpenAI passa por Supabase Edge Functions.

### 10.1 Moderação de Bio e Conteúdo

**Edge Function: `moderate-content`**
```typescript
// Chamada via Supabase Functions client
const { data } = await supabase.functions.invoke('moderate-content', {
  body: { text: bioText, type: 'bio' }
})
// Response: { approved: boolean, reason?: string, severity?: 'low'|'medium'|'high' }

// Internamente usa: POST https://api.openai.com/v1/moderations
// Model: text-moderation-latest
// Custo: praticamente zero (~$0.0001 por chamada)
```

**Quando chamar:**
- Ao salvar bio do perfil (QTC e Profissional)
- Ao publicar comentário
- Ao publicar caption de post
- Ao enviar mensagem no chat (apenas verificação básica de extremos)

### 10.2 Sugestão de Bio com IA

**Edge Function: `suggest-bio`**
```typescript
// Chamada com contexto do usuário
const { data } = await supabase.functions.invoke('suggest-bio', {
  body: {
    type: 'qtc',          // ou 'professional'
    context: {
      profession: 'Eletricista',
      city: 'São Paulo',
      looking_for: 'relationship'
    }
  }
})
// Response: { suggestion: string }

// Internamente usa: gpt-4o-mini
// Prompt base: "Crie uma bio autêntica, simpática e em português..."
// Max tokens: 150
// Temperature: 0.8 (criativa mas coerente)
```

**UX:** Botão "✨ Sugerir com IA" ao lado do campo de bio. Mostra skeleton loading enquanto aguarda. Resultado aparece no campo para o usuário editar antes de salvar.

### 10.3 Busca Semântica de Profissionais (Futuro / Fase 2)

```
Usuário digita: "preciso de um eletricista em São Paulo"
OpenAI converte para embedding
Supabase pgvector faz similarity search nos perfis profissionais
Resultado ranqueado por relevância semântica
```
> Implementar apenas após produto validado. Requer extensão `pgvector` no Supabase.

---

## 11. SEGURANÇA AVANÇADA

### 11.1 Row Level Security — Políticas Completas

```sql
-- ═══════════════ profiles ═══════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ver perfis (necessário para o feed)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas o próprio usuário pode modificar seu perfil
CREATE POLICY "profiles_own_write" ON profiles
  FOR ALL USING (auth.uid() = id);

-- ═══════════════ qtc_likes ═══════════════
ALTER TABLE qtc_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_insert_own" ON qtc_likes
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "likes_select_involved" ON qtc_likes
  FOR SELECT USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

-- ═══════════════ messages ═══════════════
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_participants_only" ON messages
  FOR ALL USING (
    auth.uid() IN (
      SELECT participant_a FROM conversations WHERE id = conversation_id
      UNION
      SELECT participant_b FROM conversations WHERE id = conversation_id
    )
  );

-- ═══════════════ pro_posts ═══════════════
ALTER TABLE pro_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read" ON pro_posts
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "posts_owner_write" ON pro_posts
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════ notifications ═══════════════
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_only" ON notifications
  FOR ALL USING (auth.uid() = user_id);
```

### 11.2 Supabase Storage — Configuração de Buckets

```
Bucket: avatars
  └─ Acesso: público (URLs diretas para fotos de perfil)
  └─ Max size: 5MB
  └─ Allowed types: image/jpeg, image/png, image/webp

Bucket: qtc-photos
  └─ Acesso: público
  └─ Max size: 10MB por arquivo
  └─ Path: {user_id}/{filename}
  └─ RLS: apenas o dono pode fazer upload/delete

Bucket: pro-photos
  └─ Acesso: público
  └─ Max size: 10MB por arquivo
  └─ Path: {user_id}/{post_id}/{filename}
```

### 11.3 Configuração de Headers de Segurança

**`public/_headers` (Netlify):**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(self), microphone=(), geolocation=(self)
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https://[seu-projeto].supabase.co; connect-src 'self' https://[seu-projeto].supabase.co wss://[seu-projeto].supabase.co; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com
```

### 11.4 Validações de Segurança

```typescript
// Zod schema exemplo: perfil QTC
const qtcProfileSchema = z.object({
  church_name: z.string().min(2).max(100).trim(),
  city: z.string().min(2).max(100).trim(),
  state: z.string().length(2).toUpperCase(),
  looking_for: z.enum(['relationship', 'friendship', 'both']),
  bio: z.string().max(300).trim().optional(),
  height_cm: z.number().int().min(100).max(250).optional(),
})

// Validar idade mínima
const birthDateSchema = z.date().max(
  new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000),
  { message: "Você deve ter pelo menos 18 anos" }
)
```

### 11.5 Rate Limiting

```typescript
// Na Edge Function de moderação de conteúdo:
// Máximo 10 chamadas por usuário por minuto
// Implementado via tabela de controle no Supabase

// No frontend: debounce de 300ms em buscas
// Limite de swipes: sem limite (produto free)
// Limite de mensagens: 30/minuto por conversa
// Limite de posts: 10 posts por dia por usuário
```

---

## 12. PERFORMANCE E OTIMIZAÇÕES

### 12.1 React e Bundle

```typescript
// Code splitting por módulo — carrega só o necessário
const QtcModule = lazy(() => import('./modules/qtc'))
const ProfessionalsModule = lazy(() => import('./modules/professionals'))

// Suspense com loading state personalizado
<Suspense fallback={<ModuleLoadingScreen />}>
  <QtcModule />
</Suspense>
```

### 12.2 TanStack Query — Configuração de Cache

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 min: dados "frescos"
      gcTime: 30 * 60 * 1000,           // 30 min: mantém em cache
      retry: 2,
      refetchOnWindowFocus: false,       // Não refetch ao focar janela
    },
  },
})

// Prefetch dos próximos cards do feed QTC
// Acionado quando restam 3 cards visíveis
queryClient.prefetchQuery({
  queryKey: ['qtc-feed', 'page-2'],
  queryFn: () => fetchNextFeedPage(),
})
```

### 12.3 Imagens

```typescript
// Usar transformações do Supabase Storage
// Formato: {url}?width=400&height=400&resize=cover&quality=80

function getOptimizedImageUrl(originalUrl: string, width: number, height: number) {
  if (!originalUrl?.includes('supabase.co')) return originalUrl
  return `${originalUrl}?width=${width}&height=${height}&resize=cover&quality=80`
}

// Lazy loading nativo via HTML
<img
  src={getOptimizedImageUrl(photo, 400, 500)}
  loading="lazy"
  decoding="async"
  alt={`Foto de ${name}`}
/>
```

### 12.4 Virtualização do Feed de Profissionais

```typescript
// TanStack Virtual para renderizar apenas os posts visíveis na tela
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: posts.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 480,      // Altura estimada de cada post card
  overscan: 3,                  // Renderiza 3 itens além da tela
})
```

### 12.5 Outros

- **Debounce** em campos de busca: 300ms
- **Memoização** de componentes pesados: `React.memo` em `SwipeCard`, `PostCard`
- **useMemo** para cálculos de idade, formatação de datas
- **Intersection Observer** para infinite scroll no feed profissional
- **Service Worker** (Vite PWA plugin): cache de assets estáticos para funcionamento offline parcial

---

## 13. UI/UX — SISTEMA DE DESIGN

### 13.1 Tokens de Design (CSS Variables)

```css
:root {
  /* Cores Primárias — Tom caloroso e moderno */
  --color-primary:        #E84393;   /* Rosa vibrante — QTC */
  --color-primary-light:  #FF6EB5;
  --color-primary-dark:   #C4006F;

  --color-secondary:      #6C63FF;   /* Roxo/Indigo — Profissional */
  --color-secondary-light:#9B95FF;
  --color-secondary-dark: #4A3FCC;

  /* Neutros */
  --color-bg:             #FAFAFA;
  --color-surface:        #FFFFFF;
  --color-surface-2:      #F5F5F5;
  --color-border:         #E8E8E8;
  --color-text:           #1A1A2E;
  --color-text-muted:     #6B7280;
  --color-text-subtle:    #9CA3AF;

  /* Feedback */
  --color-success:        #10B981;
  --color-error:          #EF4444;
  --color-warning:        #F59E0B;

  /* Gradientes */
  --gradient-qtc:         linear-gradient(135deg, #E84393, #FF6EB5);
  --gradient-pro:         linear-gradient(135deg, #6C63FF, #9B95FF);
  --gradient-hero:        linear-gradient(135deg, #E84393 0%, #6C63FF 100%);

  /* Espaçamento */
  --spacing-xs:   4px;
  --spacing-sm:   8px;
  --spacing-md:   16px;
  --spacing-lg:   24px;
  --spacing-xl:   32px;
  --spacing-2xl:  48px;

  /* Border Radius */
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    20px;
  --radius-full:  9999px;

  /* Sombras */
  --shadow-card:  0 4px 24px rgba(0,0,0,0.08);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.15);
  --shadow-float: 0 8px 32px rgba(232,67,147,0.2);

  /* Tipografia */
  --font-sans:    'Plus Jakarta Sans', sans-serif;
  --font-display: 'Clash Display', sans-serif;
}
```

### 13.2 Componentes de Alta Conversão — Landing Page

```
Hero Section:
  Headline impactante + subheadline
  CTA principal (gradiente) + CTA secundário (outline)
  Preview animado dos dois módulos (mockup de celular)

Social Proof:
  Número de usuários cadastrados (contador animado)
  Depoimentos em carousel

Features Section:
  Cards dos dois módulos com hover effects
  Lista de benefícios com ícones animados

CTA Final:
  Fundo com gradiente hero
  Botão grande "Começar Gratuitamente"
```

### 13.3 Navegação Mobile (Bottom Nav)

```
QTC:        [🔥 Feed] [💚 Matches] [🔔 Notifs] [👤 Perfil]
Profissional: [🏠 Feed] [➕ Post] [🔔 Notifs] [👤 Perfil]
```

### 13.4 Micro-interações Essenciais

- **Swipe card:** Rotação + overlay colorido (verde like / vermelho pass)
- **Like de post:** Coração explode em partículas rosa ao double-tap
- **Match:** Confetti + zoom-in das fotos + música/vibração
- **Notificação nova:** Sine bell bounce no ícone
- **Mensagem enviada:** Checkmark aparece com slide-in

---

## 14. ROTAS E NAVEGAÇÃO

```
/ ─────────────────────────────── Landing Page (pública)
/auth/
  login ─────────────────────── Login (pública)
  register ──────────────────── Cadastro + escolha de módulo
  verify-email ──────────────── Aguardando confirmação
  forgot-password ────────────── Redefinir senha

/onboarding ───────────────────── Perfil base (após cadastro)

/qtc/ ─────────────────────────── [GUARD: qtc_active]
  (index) ──────────────────────  Feed de swipe
  matches ──────────────────────  Lista de matches
  chat/:conversationId ─────────  Chat da conversa
  notifications ────────────────  Central de notificações
  profile/me ───────────────────  Meu perfil QTC
  profile/:userId ──────────────  Perfil de outro usuário
  onboarding ───────────────────  Setup do perfil QTC
  settings ─────────────────────  Configurações do módulo

/pro/ ─────────────────────────── [GUARD: pro_active]
  (index) ──────────────────────  Feed de posts
  post/:postId ─────────────────  Post individual
  profile/me ───────────────────  Meu perfil profissional
  profile/:userId ──────────────  Perfil de profissional
  onboarding ───────────────────  Setup do perfil profissional
  new-post ─────────────────────  Criar post
  settings ─────────────────────  Configurações do módulo

/settings ─────────────────────── Configurações gerais
  account ──────────────────────  Email, senha
  modules ──────────────────────  Ativar/desativar módulos
  privacy ──────────────────────  Visibilidade, bloqueios
  notifications ────────────────  Preferências de notificação
  delete-account ───────────────  Excluir conta

/module-select ────────────────── Trocar de módulo ativo
```

---

## 15. VARIÁVEIS DE AMBIENTE

```bash
# .env.example — Commitar este arquivo (sem valores reais)

# ═══ Supabase ═══
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ═══ App Config ═══
VITE_APP_NAME=QTC & Rede Pro
VITE_APP_URL=https://seudominio.com.br

# ═══ OpenAI ═══
# NUNCA COLOCAR AQUI — Usar Supabase Secrets
# Configurar via: supabase secrets set OPENAI_API_KEY=sk-...
```

```bash
# .env.local — NUNCA commitar (adicionar ao .gitignore)
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=http://localhost:5173
```

---

## 16. DEPLOY — PASSO A PASSO

### 16.1 Configurar Supabase

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref SEU_PROJECT_REF

# 4. Rodar todas as migrations
supabase db push

# 5. Deploy das Edge Functions
supabase functions deploy moderate-content
supabase functions deploy suggest-bio

# 6. Configurar secrets (chaves privadas)
supabase secrets set OPENAI_API_KEY=sk-proj-...

# 7. Verificar tudo funcionando
supabase status
```

### 16.2 Build e Deploy Netlify

```bash
# Build local
npm run build
# Gera pasta /dist com todos os assets

# Deploy manual (arrastar /dist no Netlify Drop)
# OU via CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Configuração Netlify via painel:**
```
Build command:     npm run build
Publish directory: dist
Node version:      20
```

**Variáveis de Ambiente no Netlify:**
```
VITE_SUPABASE_URL     = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...
VITE_APP_URL          = https://seudominio.com.br
```

**Arquivo obrigatório `public/_redirects`:**
```
/*    /index.html   200
```
> Sem esse arquivo o React Router quebra ao dar F5 em qualquer rota.

### 16.3 Configurar Auth Redirect URLs no Supabase

No dashboard Supabase → Authentication → URL Configuration:
```
Site URL:              https://seudominio.com.br
Redirect URLs (Add):   https://seudominio.com.br/**
                       http://localhost:5173/**
```

---

## 17. FASES DE IMPLEMENTAÇÃO

### Fase 1 — Foundation (Semana 1-2)
```
[ ] Setup do projeto (Vite + React + TS + Tailwind + ESLint)
[ ] Configurar Supabase client e tipos gerados
[ ] Migrations: profiles, auth trigger
[ ] Auth completo: cadastro, login, Google OAuth, logout
[ ] Proteção de rotas
[ ] Onboarding: escolha de módulo + perfil base
[ ] AppShell com BottomNav e TopBar
[ ] Landing Page de alta conversão
[ ] Deploy inicial no Netlify
```

### Fase 2 — Módulo QTC Core (Semana 3-4)
```
[ ] Migrations: qtc_profiles, qtc_likes, qtc_passes, qtc_matches
[ ] RLS policies do módulo QTC
[ ] Trigger de match automático
[ ] Onboarding QTC (perfil + fotos)
[ ] Feed de swipe com animação (Framer Motion)
[ ] Ações de like e pass
[ ] Botão voltar (undo último pass)
[ ] Modal de celebração de match
[ ] Tela de matches
[ ] Perfil de outro usuário (read-only)
```

### Fase 3 — Chat (Semana 5)
```
[ ] Migrations: conversations, messages
[ ] RLS policies do chat
[ ] Hook useChat com Supabase Realtime
[ ] Lista de conversas ordenada
[ ] Janela de chat com histórico paginado
[ ] Status de mensagens (sent/delivered/read)
[ ] "Digitando..." via Realtime Presence
[ ] Notificações de nova mensagem
```

### Fase 4 — Notificações (Semana 5-6)
```
[ ] Migration: notifications
[ ] Trigger de notificação para likes e matches
[ ] Hook useNotifications com Realtime
[ ] Badge de contador na navbar
[ ] Central de notificações
[ ] Toast de notificação em tempo real
```

### Fase 5 — Módulo Profissional (Semana 6-7)
```
[ ] Migrations: pro_profiles, pro_posts, pro_post_likes, pro_comments, pro_follows
[ ] RLS policies do módulo profissional
[ ] Onboarding profissional
[ ] Feed infinito de posts
[ ] Card de post com carousel de fotos
[ ] Curtidas e comentários
[ ] Criação de post (upload múltiplo)
[ ] Perfil profissional completo
[ ] Tela de post individual
```

### Fase 6 — OpenAI e Polimento (Semana 8)
```
[ ] Edge Function: moderate-content
[ ] Edge Function: suggest-bio
[ ] Integrar moderação no fluxo de criação de conteúdo
[ ] Botão "Sugerir bio com IA"
[ ] Otimizações de performance (memo, virtualização, prefetch)
[ ] Testes unitários dos hooks críticos
[ ] Testes E2E dos fluxos principais
[ ] Revisão de acessibilidade (ARIA labels, contraste)
[ ] Deploy final + monitoramento
```

---

## 18. COMPONENTES COMPARTILHADOS

### `<Avatar size="sm|md|lg|xl" src? name fallback />`
Foto de perfil com fallback de iniciais, sempre circular.

### `<PhotoGallery photos onClose />`
Lightbox para visualização de fotos em tela cheia com navegação.

### `<SwipeCard profile onLike onPass onExpand />`
Card animado do feed QTC. Aceita drag gestures e botões.

### `<MessageBubble message isMine />`
Bolha de mensagem com status indicator (✓ ✓✓ ✓✓🔵).

### `<InfiniteList data fetchNextPage hasNextPage renderItem />`
Wrapper de virtualização + scroll infinito.

### `<NotificationBadge count />`
Círculo vermelho com número sobre ícone.

### `<PhotoUploader maxFiles accept onUpload />`
Upload com preview, reordenação e progress indicator.

### `<EmptyState icon title description action? />`
Tela de estado vazio com ilustração e CTA opcional.

### `<ModuleSwitch />`
Botão flutuante para trocar entre módulos QTC ↔ Profissional.

### `<ConfirmDialog title message onConfirm />`
Modal de confirmação de ação destrutiva.

---

## 19. REGRAS DE NEGÓCIO CONSOLIDADAS

### Usuários
- Idade mínima: **18 anos** (validação no formulário + constraint SQL)
- Um email por conta
- Pode ter perfil em **ambos os módulos** com o mesmo login
- Pode desativar a conta (soft delete: `is_active = false`)
- Pode deletar a conta (hard delete com CASCADE)

### QTC
- Mínimo **1 foto** para aparecer no feed
- Máximo **6 fotos** por perfil
- Bio máxima: **300 caracteres**
- Swipe não desfazível (exceto 1 undo por sessão no plano free)
- Chat só habilitado após match mútuo
- Notificação de like **não revela** a identidade de quem curtiu
- Usuário pode se tornar invisível no feed sem deletar conta

### Rede de Profissionais
- Mínimo **1 foto** de portfólio para ativar perfil
- Máximo **10 fotos** de portfólio
- Posts: **1 a 4 fotos** por post (obrigatório ter ao menos 1)
- Caption máxima: **500 caracteres**
- Comentário máximo: **300 caracteres**
- Máximo **10 posts por dia** por usuário
- Todo conteúdo publicado passa por moderação antes de aparecer

### Chat
- Apenas entre usuários com match (QTC)
- Máximo **2.000 caracteres** por mensagem
- Rate limit: **30 mensagens/minuto** por conversa
- Mensagem deletada aparece como "Mensagem apagada" (não some)
- Sem envio de arquivos/mídias na V1 (apenas texto)

### Moderação
- Bios, captions, comentários passam por OpenAI Moderation API
- Conteúdo reprovado: **não publicado**, usuário vê mensagem amigável
- 3 infrações de moderação: **conta suspensa temporariamente**
- Usuários podem **reportar** outros usuários (futuro)

---

*Documento de Arquitetura v1.0*
*Plataforma MicroSaaS — QTC + Rede de Profissionais*
*Gerado para implementação via IA assistida (Cursor / Windsurf / Copilot)*
