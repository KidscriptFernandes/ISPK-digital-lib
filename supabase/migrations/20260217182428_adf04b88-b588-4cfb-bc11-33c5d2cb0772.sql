
-- Fix permissive policy: require user_id to match
DROP POLICY "Anyone can insert views" ON public.book_views;
CREATE POLICY "Users can insert own views" ON public.book_views FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
