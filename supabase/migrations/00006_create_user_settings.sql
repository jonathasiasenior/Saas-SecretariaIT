CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'purple', 'blue')),
  notification_whatsapp BOOLEAN NOT NULL DEFAULT false,
  notification_email BOOLEAN NOT NULL DEFAULT true,
  notification_push BOOLEAN NOT NULL DEFAULT true,
  default_notify_24h BOOLEAN NOT NULL DEFAULT true,
  default_notify_8h BOOLEAN NOT NULL DEFAULT true,
  default_notify_1h BOOLEAN NOT NULL DEFAULT true,
  push_subscription JSONB,
  calendar_default_view TEXT NOT NULL DEFAULT '7d' CHECK (calendar_default_view IN ('1d', '3d', '7d', '1m')),
  language TEXT NOT NULL DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
