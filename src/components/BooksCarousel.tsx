import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_image_url: string | null;
  publication_year: number | null;
  categories: { name: string } | null;
}

export function BooksCarousel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [scrollX, setScrollX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [maxScroll, setMaxScroll] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("books")
        .select("id, title, author, cover_image_url, publication_year, categories(name)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setBooks(data as Book[]);
    };
    load();
  }, []);

  const updateMaxScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) setMaxScroll(Math.max(0, el.scrollWidth - el.clientWidth));
  }, []);

  useEffect(() => {
    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);
    return () => window.removeEventListener("resize", updateMaxScroll);
  }, [books, updateMaxScroll]);

  const scrollBy = useCallback((dir: number) => {
    const el = containerRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    const next = Math.max(0, Math.min(scrollX + dir * step, maxScroll));
    setScrollX(next);
    el.scrollTo({ left: next, behavior: "smooth" });
  }, [scrollX, maxScroll]);

  // Auto-scroll
  useEffect(() => {
    if (books.length < 5 || isPaused || maxScroll <= 0) return;
    autoRef.current = setInterval(() => {
      setScrollX((prev) => {
        const el = containerRef.current;
        if (!el) return prev;
        const step = el.clientWidth * 0.75;
        let next = prev + step;
        if (next >= maxScroll) next = 0;
        el.scrollTo({ left: next, behavior: "smooth" });
        return next;
      });
    }, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [books.length, isPaused, maxScroll]);

  if (books.length === 0) return null;

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation buttons */}
      <button
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-0 bottom-0 z-20 w-10 md:w-12 flex items-center justify-center bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
        aria-label="Anterior"
      >
        <div className="h-9 w-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </div>
      </button>
      <button
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-0 bottom-0 z-20 w-10 md:w-12 flex items-center justify-center bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
        aria-label="Próximo"
      >
        <div className="h-9 w-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors">
          <ChevronRight className="h-5 w-5 text-foreground" />
        </div>
      </button>

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={(e) => setScrollX((e.target as HTMLDivElement).scrollLeft)}
      >
        {books.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]"
          >
            <Link to={`/livro/${book.id}`} className="block group/card">
              <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group-hover/card:-translate-y-2 bg-card border border-border">
                {/* Cover */}
                <div className="aspect-[2/3] overflow-hidden bg-muted relative">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/10">
                      <BookMarked className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-xs font-medium">Ver detalhes →</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="font-semibold text-foreground text-xs line-clamp-2 leading-tight">{book.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{book.author}</p>
                  {book.categories?.name && (
                    <span className="inline-block mt-1.5 text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {book.categories.name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      {maxScroll > 0 && (
        <div className="mt-3 mx-auto w-32 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary/60"
            animate={{ width: `${maxScroll > 0 ? ((scrollX / maxScroll) * 100) : 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
