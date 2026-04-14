
-- Create storage bucket for book PDFs and covers
INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', true);

-- Allow anyone to read files from the books bucket
CREATE POLICY "Anyone can read book files" ON storage.objects
FOR SELECT USING (bucket_id = 'books');

-- Allow admins to upload files
CREATE POLICY "Admins can upload book files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'books' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete book files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'books' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to update files
CREATE POLICY "Admins can update book files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'books' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
