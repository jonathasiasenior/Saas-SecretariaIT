CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('voice', 'text', 'manual')),
  raw_input TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_notes_search ON notes USING gin(to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(content, '')));

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE notes;
