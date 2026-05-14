-- Allow authenticated users to read active (not returned) book loans so the UI can block requests for books already borrowed.
DROP POLICY IF EXISTS "Users can read active loans" ON public.book_loans;
CREATE POLICY "Users can read active loans" ON public.book_loans
FOR SELECT TO authenticated
USING (return_date IS NULL);
