-- Create storage buckets for user files
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads during registration and authenticated user uploads
CREATE POLICY "Allow anonymous uploads during registration" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-files');

CREATE POLICY "Users can view all files" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-files');

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);
