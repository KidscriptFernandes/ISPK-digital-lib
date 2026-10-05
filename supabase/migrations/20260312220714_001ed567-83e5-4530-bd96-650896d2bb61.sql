
-- Create access type enum
CREATE TYPE public.book_access_type AS ENUM ('online_public', 'online_registered', 'physical_only');

-- Add access_type column to books
ALTER TABLE public.books ADD COLUMN access_type public.book_access_type NOT NULL DEFAULT 'online_public';
