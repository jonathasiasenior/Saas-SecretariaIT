CREATE TABLE IF NOT EXISTS processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL CHECK (input_type IN ('audio', 'text')),
  mode TEXT NOT NULL DEFAULT 'auto' CHECK (mode IN ('anotacao', 'agenda', 'auto')),
  audio_url TEXT,
  text_input TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_type TEXT CHECK (result_type IN ('event', 'note')),
  result_id UUID,
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_queue_status ON processing_queue(status, created_at);
CREATE INDEX idx_queue_user ON processing_queue(user_id, created_at DESC);

ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own queue" ON processing_queue
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE processing_queue;
