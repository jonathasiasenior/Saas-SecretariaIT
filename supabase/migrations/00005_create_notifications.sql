CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('push', 'whatsapp', 'email')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notification_log(user_id, created_at DESC);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON notification_log
  FOR SELECT USING (auth.uid() = user_id);
