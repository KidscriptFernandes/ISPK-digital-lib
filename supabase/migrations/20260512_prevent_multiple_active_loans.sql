-- Prevent multiple active loans for the same book
-- Create a function to check for duplicate active loans
CREATE OR REPLACE FUNCTION public.prevent_duplicate_active_loans()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if there's already an active loan for this book
  IF NEW.return_date IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.book_loans
      WHERE book_id = NEW.book_id
      AND return_date IS NULL
      AND id != COALESCE(OLD.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Este livro já possui um empréstimo ativo. Aguarde até que seja devolvido.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on book_loans table
DROP TRIGGER IF EXISTS check_duplicate_active_loans ON public.book_loans;
CREATE TRIGGER check_duplicate_active_loans
BEFORE INSERT OR UPDATE ON public.book_loans
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_active_loans();
