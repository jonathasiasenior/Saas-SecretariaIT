# Regras de Negócio - Secretária Inteligente

## Visão Geral

O sistema funciona como uma secretária inteligente pessoal. O usuário envia comandos por **áudio** (até 1 minuto) ou **texto**, e a IA interpreta e organiza automaticamente em dois tipos:

1. **Anotação**: Nota pessoal organizada como um diário
2. **Agenda**: Compromisso com data, hora, local e descrição

---

## Fluxo de Entrada de Dados

### Via Áudio
1. Usuário clica no botão FAB (microfone) → seleciona "Gravar Áudio"
2. Seleciona o modo: **Auto**, **Agenda** ou **Anotação**
3. Grava áudio (máximo 60 segundos, limite 10MB)
4. Ao parar, pode regravar ou enviar
5. Ao enviar:
   - Áudio é uploaded para Supabase Storage (`audio-uploads/{user_id}/{uuid}.webm`)
   - Item criado na `processing_queue` com status `pending`
   - Edge Function `process-audio` é invocada
   - Gemini transcreve o áudio → classifica → cria evento ou nota
   - Queue atualizada para `completed` com referência ao resultado
   - Frontend recebe atualização via Realtime
   - Toast de confirmação exibido

### Via Texto
1. Usuário clica no botão FAB → seleciona "Digitar Texto"
2. Seleciona o modo: **Auto**, **Agenda** ou **Anotação**
3. Digita o texto (máximo 5000 caracteres)
4. Ao enviar:
   - Item criado na `processing_queue`
   - Edge Function `process-text` é invocada
   - Gemini classifica o texto → cria evento ou nota
   - Mesmo fluxo de atualização via Realtime

### Via Manual
- Usuário pode criar eventos ou notas manualmente pelos formulários
- Não passa pela IA, é salvo diretamente no banco

---

## Regras de Classificação (IA)

### Classificação como AGENDA
O conteúdo é classificado como agenda quando:
- Menciona **data** (amanhã, segunda, 15/03, próxima semana)
- Menciona **horário** (14h, às 3 da tarde, manhã)
- Menciona **compromisso** (reunião, consulta, evento, encontro)
- Usuário explicitamente diz "agenda" ou "compromisso"
- Modo selecionado é "Agenda"

**Campos extraídos:**
| Campo | Obrigatório | Padrão |
|-------|:-----------:|--------|
| `title` | Sim | "Evento sem título" |
| `date` | Sim | Data de hoje |
| `time` | Não | 09:00 |
| `end_time` | Não | null |
| `location` | Não | null |
| `description` | Não | null |
| `all_day` | Não | false |

### Classificação como ANOTAÇÃO
O conteúdo é classificado como anotação quando:
- É uma **ideia**, reflexão, pensamento
- É uma **lista** (compras, tarefas, itens)
- É uma **informação** para lembrar
- Não tem data/hora específicas de compromisso
- Usuário explicitamente diz "anotação" ou "nota"
- Modo selecionado é "Anotação"

**Campos extraídos:**
| Campo | Obrigatório | Padrão |
|-------|:-----------:|--------|
| `title` | Sim | "Anotação sem título" |
| `content` | Sim | Transcrição/texto original |
| `tags` | Não | [] |
| `category` | Não | null |

### Modo "Auto"
Quando o usuário seleciona "Auto", a IA decide automaticamente entre agenda e anotação baseado no conteúdo.

---

## Calendário / Agenda

### Visualizações
| Filtro | Descrição | Layout |
|--------|-----------|--------|
| 1 Dia | Dia único selecionado | Coluna única, detalhes completos |
| 3 Dias | 3 dias consecutivos | 3 colunas lado a lado |
| 7 Dias (padrão) | Semana completa | Grid semanal |
| 1 Mês | Mês inteiro | Grid mensal simplificado |

### Navegação
- Botões **anterior/próximo** avançam pelo intervalo do filtro ativo
- Botão **Hoje** volta para a data atual
- Clicar no cabeçalho de um dia abre o formulário de criação

### Eventos
- Cada evento tem uma **cor** personalizável (8 opções)
- Eventos podem ser criados, editados e deletados
- Eventos mostram: título, horário, local (se houver)
- Fonte do evento é indicada (voz, texto, manual)

---

## Anotações / Diário

### Organização
- Notas exibidas em grid responsivo (1-3 colunas)
- Ordenadas por: fixadas primeiro, depois por data (mais recentes primeiro)
- Cada nota mostra: título, preview do conteúdo (2 linhas), tags, data
- Indicador visual da fonte (microfone para voz, teclado para texto)

### Busca
- Full-text search em português usando PostgreSQL `to_tsvector`
- Busca por título e conteúdo simultaneamente
- Resultados filtrados em tempo real

### Fixar/Desafixar
- Notas podem ser fixadas no topo da lista
- Limite: sem limite de notas fixadas

---

## Notificações

### Canais Disponíveis
| Canal | Descrição | Requisito |
|-------|-----------|-----------|
| Push | Notificação nativa no navegador/celular | Permissão do navegador |
| Email | Email via Resend API | Email do cadastro |
| WhatsApp | Mensagem via Z-API | Número de telefone configurado |

### Tempos de Notificação (padrão)
- **24 horas** antes do evento
- **8 horas** antes do evento
- **1 hora** antes do evento

### Configuração
- Cada canal pode ser ativado/desativado individualmente
- Cada tempo pode ser ativado/desativado individualmente
- Configurações são **globais** (afetam todos os novos eventos)
- Eventos individuais podem ter notificações personalizadas

### Mecanismo
- pg_cron roda a cada **5 minutos**
- Verifica eventos com `start_at` dentro das janelas de 24h/8h/1h
- Flags `notified_24h/8h/1h` evitam notificações duplicadas
- Cada envio é registrado na `notification_log`

---

## Gestão de Usuários

### Registro
- Usuário se registra com: nome, email, senha
- Trigger automático cria: profile + settings + subscription
- Email de confirmação enviado (Supabase Auth)

### Perfis
| Campo | Descrição |
|-------|-----------|
| `full_name` | Nome completo |
| `email` | Email (único) |
| `role` | `user` ou `admin` |
| `is_active` | Ativo/inativo |
| `phone` | Para WhatsApp (opcional) |
| `timezone` | Padrão: America/Sao_Paulo |

### Funções (Roles)
| Role | Permissões |
|------|-----------|
| `user` | CRUD próprios dados, ver próprias configurações |
| `admin` | Tudo do user + criar/editar/desativar qualquer usuário + gerenciar assinaturas |

### Admin pode:
- Criar novos usuários (com senha temporária)
- Ativar/desativar usuários
- Promover/rebaixar para admin
- Ver lista de todos os usuários
- Ver plano/status de cada usuário

---

## Assinaturas / Planos

### Planos Disponíveis
| Plano | Eventos/mês | Notas/mês | Áudio min/mês | Status |
|-------|:-----------:|:---------:|:-------------:|--------|
| Free | 100 | 100 | 60 | Ativo para todos |
| Pro | 500 | 500 | 300 | Futuro |
| Enterprise | Ilimitado | Ilimitado | Ilimitado | Futuro |

**Nota**: Atualmente todos os usuários são Free sem restrições aplicadas. A estrutura existe para implementação futura de cobrança.

---

## Fila de Processamento

### Status
| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando processamento |
| `processing` | Sendo processado pela IA |
| `completed` | Processado com sucesso |
| `failed` | Erro no processamento |

### Comportamento
- Itens ficam na fila enquanto `pending` ou `processing`
- Frontend mostra indicador visual para itens na fila
- Atualização automática via Supabase Realtime
- Botão de refresh manual disponível
- Em caso de falha: mensagem de erro exibida, usuário pode tentar novamente
- Máximo de 3 tentativas por item (`retry_count`)

### Polling
- Enquanto houver itens `pending`/`processing`, o frontend faz polling a cada 3 segundos
- Quando não há itens, o polling é desativado (economia de recursos)
- Realtime complementa o polling para atualizações instantâneas

---

## Temas

### Temas Disponíveis
| Tema | Fundo | Accent | Vibe |
|------|-------|--------|------|
| Dark (padrão) | Escuro neutro | Roxo | Profissional, moderno |
| Light | Claro | Roxo | Limpo, acessível |
| Purple | Roxo profundo | Lilás | Elegante, premium |
| Blue | Azul profundo | Azul claro | Calmo, focado |

### Comportamento
- Tema salvo no `localStorage` para carregamento instantâneo (sem flash)
- Sincronizado com `user_settings.theme` no banco quando autenticado
- Transição suave de 0.3s ao trocar temas
- Todas as cores da UI derivam de CSS custom properties
- Troca disponível no Header e na página de Configurações

---

## Regras de Segurança

1. **Isolamento de dados**: Cada usuário só vê seus próprios dados (RLS)
2. **API keys**: Chave Gemini NUNCA no frontend, apenas em Edge Functions
3. **Autenticação**: JWT verificado em toda requisição ao backend
4. **Storage**: Áudio em bucket privado, acesso restrito por pasta do usuário
5. **Validação**: Inputs validados com Zod antes de enviar ao backend
6. **XSS**: React escaping nativo + DOMPurify para conteúdo rich
7. **Admin**: Funções administrativas verificam `role = 'admin'` no backend
