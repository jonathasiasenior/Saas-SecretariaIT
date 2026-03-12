-- Create audio uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-uploads',
  'audio-uploads',
  false,
  10485760, -- 10MB
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users upload own audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own audio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audio-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own audio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audio-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
