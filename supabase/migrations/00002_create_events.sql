CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  color TEXT DEFAULT '#8B5CF6',
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('voice', 'text', 'manual')),
  raw_input TEXT,
  notify_24h BOOLEAN NOT NULL DEFAULT true,
  notify_8h BOOLEAN NOT NULL DEFAULT true,
  notify_1h BOOLEAN NOT NULL DEFAULT true,
  notified_24h BOOLEAN NOT NULL DEFAULT false,
  notified_8h BOOLEAN NOT NULL DEFAULT false,
  notified_1h BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_user_start ON events(user_id, start_at);
CREATE INDEX idx_events_notification ON events(start_at)
  WHERE notified_24h = false OR notified_8h = false OR notified_1h = false;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own events" ON events
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE events;
