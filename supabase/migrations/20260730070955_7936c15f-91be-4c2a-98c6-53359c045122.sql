-- 1. Remove anonymous read access to profiles
DROP POLICY IF EXISTS "Anon can read profiles" ON public.profiles;

-- 2. Add WITH CHECK to admin loan updates
DROP POLICY IF EXISTS "Admins can update loans" ON public.book_loans;
CREATE POLICY "Admins can update loans" ON public.book_loans
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Restrict file listing in the books bucket (public URLs still work)
DROP POLICY IF EXISTS "Anyone can read book files" ON storage.objects;
CREATE POLICY "Admins can list book files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'books' AND has_role(auth.uid(), 'admin'::app_role));

-- 4. Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;