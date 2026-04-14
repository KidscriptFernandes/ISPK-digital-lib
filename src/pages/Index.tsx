import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Library, Users, TrendingUp, Search, ArrowRight, BookMarked } from "lucide-react";
import ispkLogo from "@/assets/ispk-logo.jpg";
import { BooksCarousel } from "@/components/BooksCarousel";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const CATEGORY_COLORS = [
  "from-primary to-red-700",
  "from-secondary to-orange-600",
  "from-accent to-yellow-500",
  "from-red-800 to-primary",
  "from-orange-500 to-amber-600",
  "from-yellow-600 to-secondary",
];

const Index = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalCategories: 0, activeLoans: 0, totalUsers: 0, totalViews: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [booksRes, catsRes, loansRes, recentRes, profilesRes, viewsRes] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("*"),
        supabase.from("book_loans").select("id", { count: "exact", head: true }).is("return_date", null),
        supabase.from("books").select("*, categories(name)").order("created_at", { ascending: false }).limit(4),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("book_views").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        totalBooks: booksRes.count || 0,
        totalCategories: catsRes.data?.length || 0,
        activeLoans: loansRes.count || 0,
        totalUsers: profilesRes.count || 0,
        totalViews: viewsRes.count || 0,
      });
      setCategories(catsRes.data || []);
      setRecentBooks(recentRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/pesquisa?q=${encodeURIComponent(search.trim())}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-6 sm:pb-10 overflow-hidden">

        {/* ── HERO BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
          style={{ minHeight: 220 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(15,80%,18%)] via-[hsl(0,72%,32%)] to-[hsl(24,100%,40%)]" />
          <div className="absolute -top-16 -right-16 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute top-0 right-0 w-full h-full opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="hidden sm:block absolute bottom-0 right-0 opacity-20 select-none pointer-events-none">
            <svg width="260" height="180" viewBox="0 0 260 180" fill="white" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="200" cy="170" rx="60" ry="10" opacity="0.3" />
              <rect x="170" y="80" width="10" height="90" rx="5" />
              <circle cx="175" cy="68" r="16" />
              <path d="M160 120 Q140 100 120 110 L100 150 L130 145 Z" />
              <rect x="60" y="40" width="6" height="140" rx="3" />
              <path d="M30 40 Q60 20 90 40 L90 180 L30 180 Z" />
              <path d="M90 40 Q120 20 150 40 L150 180 L90 180 Z" opacity="0.6" />
            </svg>
          </div>

          <div className="relative z-10 p-5 sm:p-8 md:p-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <div className="mb-3 sm:mb-4">
                <img src={ispkLogo} alt="Logotipo ISPK" className="h-10 sm:h-14 md:h-16 w-auto rounded-lg shadow-lg" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight mb-2 sm:mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Bem-vindo à<br />
                <span className="text-accent">Biblioteca Virtual</span> ISPK
              </h1>
              <p className="text-white/75 text-sm sm:text-base md:text-lg max-w-lg mb-5 sm:mb-7 leading-relaxed">
                Acesso remoto ao nosso acervo digital. Estude com autonomia, explore prateleiras virtuais e aprofunde seus conhecimentos.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link to="/catalogo"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-accent/90 transition-all hover:scale-105 shadow-lg shadow-accent/30 text-sm sm:text-base">
                  Explorar Acervo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/prateleiras"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-white/20 transition-all text-sm sm:text-base">
                  Ver Prateleiras
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── SEARCH ── */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground z-10" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar livros, autores..."
            className="w-full pl-10 sm:pl-12 pr-24 sm:pr-32 h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-border bg-card text-foreground text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-primary/90 transition-all text-xs sm:text-sm"
          >
            Pesquisar
          </button>
        </motion.form>

        {/* ── STATS ── */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Materiais Disponíveis", value: stats.totalBooks.toLocaleString(), sub: "Livros, monografias e trabalhos", icon: BookOpen, gradient: "from-primary/10 to-primary/5", iconBg: "bg-primary/15", iconColor: "text-primary", num: "text-primary" },
            { label: "Utilizadores Ativos", value: stats.totalUsers.toLocaleString(), sub: "Estudantes e pesquisadores", icon: Users, gradient: "from-secondary/10 to-secondary/5", iconBg: "bg-secondary/15", iconColor: "text-secondary", num: "text-secondary" },
            { label: "Acessos / Consultas", value: stats.totalViews.toLocaleString(), sub: "Total de consultas ao acervo", icon: TrendingUp, gradient: "from-accent/20 to-accent/10", iconBg: "bg-accent/20", iconColor: "text-accent-foreground", num: "text-accent-foreground" },
            { label: "Categorias", value: stats.totalCategories.toLocaleString(), sub: "Áreas de conhecimento", icon: Library, gradient: "from-primary/10 to-secondary/10", iconBg: "bg-primary/10", iconColor: "text-primary", num: "text-primary" },
          ].map((s) => (
            <motion.div key={s.label} variants={item}>
              <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${s.gradient} border border-border p-3 sm:p-5 hover:shadow-lg transition-all hover:-translate-y-1 group`}>
                <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl ${s.iconBg} flex items-center justify-center mb-2 sm:mb-3`}>
                  <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.iconColor}`} />
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${s.num} mb-0.5`}>{s.value}</p>
                <p className="text-xs sm:text-sm font-semibold text-foreground">{s.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-snug">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CATEGORIES ── */}
        {categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Navegue por Categorias
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">Explore por área de conhecimento</p>
              </div>
              <Link to="/prateleiras" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Ver Todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div key={cat.id} variants={item} whileHover={{ scale: 1.04, y: -4 }} transition={{ duration: 0.2 }}>
                  <Link to={`/catalogo?cat=${cat.id}`}>
                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} p-5 cursor-pointer group shadow-md hover:shadow-xl transition-shadow`}>
                      <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
                      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10" />
                      <Library className="h-7 w-7 text-white mb-3 relative z-10 drop-shadow" />
                      <p className="font-bold text-white text-base relative z-10 drop-shadow">{cat.name}</p>
                      {cat.description && (
                        <p className="text-white/70 text-xs mt-1 line-clamp-1 relative z-10">{cat.description}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* ── LIVROS VÁRIOS - Netflix Carousel ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Livros Vários
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">Deslize para explorar todo o acervo</p>
            </div>
            <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Ver Todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <BooksCarousel />
        </div>

        {/* ── RECENT BOOKS ── */}
        {recentBooks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Materiais em Destaque
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">Adicionados recentemente ao acervo</p>
              </div>
              <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Ver Todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentBooks.map((book) => (
                <motion.div key={book.id} variants={item} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                  <Link to={`/livro/${book.id}`}>
                    <div className="rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl transition-shadow group">
                      <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/10">
                            <BookMarked className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-medium">Ver detalhes →</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">{book.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                        {book.categories?.name && (
                          <span className="inline-block mt-2 text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {book.categories.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
