
CREATE POLICY "Anon can read books" ON public.books FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read categories" ON public.categories FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read profiles" ON public.profiles FOR SELECT TO anon USING (true);
