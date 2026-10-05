-- Create reading_positions table to track where users stopped reading
CREATE TABLE public.reading_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_number INT NOT NULL DEFAULT 1,
  scroll_position FLOAT DEFAULT 0,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reading_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only see/modify their own reading positions
CREATE POLICY "Users can read own reading positions" ON public.reading_positions 
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reading positions" ON public.reading_positions 
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reading positions" ON public.reading_positions 
FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_reading_positions_updated_at BEFORE UPDATE ON public.reading_positions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
