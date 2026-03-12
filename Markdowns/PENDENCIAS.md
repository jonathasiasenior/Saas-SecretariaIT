# Pendências

## 1. Integração WhatsApp (Z-API)

Configurar envio de notificações via WhatsApp usando Z-API.

**O que falta:**
- Criar conta na [Z-API](https://z-api.io)
- Conectar instância do WhatsApp
- Adicionar as secrets no Supabase em **Settings > Edge Functions > Secrets**:
  - `WHATSAPP_INSTANCE_ID`
  - `WHATSAPP_TOKEN`

**Função pronta:** `supabase/functions/send-notification-whatsapp/index.ts`

---

## 2. Integração Email (Resend)

Configurar envio de notificações por email usando Resend.

**O que falta:**
- Criar conta na [Resend](https://resend.com) (plano gratuito disponível)
- Verificar o domínio `secretaria-inteligente.com` no Resend
- Adicionar a secret no Supabase em **Settings > Edge Functions > Secrets**:
  - `RESEND_API_KEY`

**Função pronta:** `supabase/functions/send-notification-email/index.ts`

---

> Enquanto essas integrações não estiverem configuradas, o cron roda normalmente mas não envia nada — os eventos são marcados como notificados no banco sem disparo real.
