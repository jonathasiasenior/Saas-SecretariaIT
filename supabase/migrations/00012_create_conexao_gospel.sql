CREATE TABLE IF NOT EXISTS qtc_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  church_name TEXT,
  looking_for TEXT NOT NULL CHECK (looking_for IN ('relationship', 'friendship', 'both')),
  bio TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  compatibility_focus TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qtc_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile_id UUID NOT NULL REFERENCES qtc_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('liked', 'passed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_profile_id)
);

CREATE TABLE IF NOT EXISTS pro_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  focus TEXT NOT NULL,
  score_label TEXT NOT NULL DEFAULT 'Em crescimento',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pro_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES pro_profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  reach_label TEXT NOT NULL,
  engagement_label TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qtc_profiles_visible_created
  ON qtc_profiles(is_visible, created_at DESC);

CREATE INDEX idx_qtc_actions_from_user_created
  ON qtc_actions(from_user_id, created_at DESC);

CREATE INDEX idx_pro_profiles_public_created
  ON pro_profiles(is_public, created_at DESC);

CREATE INDEX idx_pro_posts_profile_created
  ON pro_posts(profile_id, created_at DESC);

CREATE INDEX idx_pro_posts_public_created
  ON pro_posts(is_published, created_at DESC);

ALTER TABLE qtc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qtc_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own qtc profile" ON qtc_profiles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users read visible qtc profiles" ON qtc_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_visible = true);

CREATE POLICY "Users manage own qtc actions" ON qtc_actions
  FOR ALL USING (auth.uid() = from_user_id)
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users manage own pro profile" ON pro_profiles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users read public pro profiles" ON pro_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_public = true);

CREATE POLICY "Users manage own pro posts" ON pro_posts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users read public pro posts" ON pro_posts
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE OR REPLACE TRIGGER update_qtc_profiles_updated_at
  BEFORE UPDATE ON qtc_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_pro_profiles_updated_at
  BEFORE UPDATE ON pro_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_pro_posts_updated_at
  BEFORE UPDATE ON pro_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE qtc_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE qtc_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE pro_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE pro_posts;
