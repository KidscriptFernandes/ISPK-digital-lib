import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import carousel1 from "@/assets/carousel-1.jpg";
import carousel2 from "@/assets/carousel-2.jpg";
import carousel3 from "@/assets/carousel-3.jpg";
import carousel4 from "@/assets/carousel-4.jpg";

const fallbackSlides = [
  { src: carousel1, title: "Biblioteca Moderna", subtitle: "Espaço de estudo e conhecimento" },
  { src: carousel2, title: "Acervo Diversificado", subtitle: "Milhares de títulos à sua disposição" },
  { src: carousel3, title: "Campus Universitário", subtitle: "Instituto Superior Politécnico Katangoji" },
  { src: carousel4, title: "Leitura Digital", subtitle: "Acesse livros online de qualquer lugar" },
];

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
    rotateY: dir > 0 ? 15 : -15,
    scale: 0.9,
  }),
  center: { x: 0, opacity: 1, rotateY: 0, scale: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
    rotateY: dir > 0 ? -15 : 15,
    scale: 0.9,
  }),
};

export function HeroCarousel() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [[current, direction], setCurrent] = useState([0, 0]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("carousel_slides")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) {
        setSlides(data.map(s => ({
          src: s.image_url,
          title: s.title || "",
          subtitle: s.subtitle || "",
        })));
      }
    };
    load();
  }, []);

  const paginate = useCallback((dir: number) => {
    setCurrent(([prev]) => {
      const len = slides.length || 1;
      return [(prev + dir + len) % len, dir];
    });
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [paginate, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl" style={{ perspective: 1200 }}>
      <div className="relative aspect-[16/7] sm:aspect-[16/6]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <img
              src={slides[current]?.src}
              alt={slides[current]?.title || "Slide"}
              className="w-full h-full object-cover"
              width={1280}
              height={720}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {(slides[current]?.title || slides[current]?.subtitle) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-16"
              >
                {slides[current]?.title && (
                  <h3 className="text-white text-lg sm:text-2xl font-bold drop-shadow-lg">
                    {slides[current].title}
                  </h3>
                )}
                {slides[current]?.subtitle && (
                  <p className="text-white/80 text-xs sm:text-sm mt-1">
                    {slides[current].subtitle}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background/80 transition-colors shadow-lg"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background/80 transition-colors shadow-lg"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-2 right-4 z-10 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent([i, i > current ? 1 : -1])}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
