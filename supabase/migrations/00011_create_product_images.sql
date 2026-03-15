CREATE TABLE IF NOT EXISTS product_image_originals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  width INT,
  height INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_image_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_image_id UUID NOT NULL REFERENCES product_image_originals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  style TEXT NOT NULL CHECK (style IN ('CHAMATIVO', 'CONSERVADOR')),
  prompt_used TEXT NOT NULL,
  openai_model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  storage_path TEXT,
  retry_of_generation_id UUID REFERENCES product_image_generations(id) ON DELETE SET NULL,
  is_liked BOOLEAN NOT NULL DEFAULT false,
  is_disliked BOOLEAN NOT NULL DEFAULT false,
  is_in_gallery BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_image_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES product_image_generations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('LIKE', 'DISLIKE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (generation_id, user_id)
);

CREATE INDEX idx_product_originals_user_created
  ON product_image_originals(user_id, created_at DESC);

CREATE INDEX idx_product_generations_user_created
  ON product_image_generations(user_id, created_at DESC);

CREATE INDEX idx_product_generations_original_created
  ON product_image_generations(original_image_id, created_at DESC);

CREATE INDEX idx_product_feedback_user_created
  ON product_image_feedback(user_id, created_at DESC);

ALTER TABLE product_image_originals ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_image_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_image_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own product originals" ON product_image_originals
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own product generations" ON product_image_generations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own product feedback" ON product_image_feedback
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE product_image_generations;
