import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Search, BookOpen, ArrowRight, Sparkles, Users, Library, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ispkLogo from "@/assets/ispk-logo.jpg";
import bibliotecaBg from "@/assets/biblioteca-bg.jpg";
import { lazy, Suspense } from "react";


const Book3D = lazy(() => import("@/components/Book3D").then(m => ({ default: m.Book3D })));

type View = "home" | "login" | "register";

const Landing = () => {
  const [view, setView] = useState<View>("home");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: 0, categories: 0, students: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [booksRes, catsRes, studentsRes] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        books: booksRes.count ?? 0,
        categories: catsRes.count ?? 0,
        students: studentsRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  if (user) {
    navigate("/inicio", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      navigate("/inicio");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/inicio` },
    });
    if (error) {
      toast({ title: "Erro ao registar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique o seu email para confirmar a conta." });
      setView("login");
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/pesquisa?q=${encodeURIComponent(search.trim())}`);
    else navigate("/catalogo");
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img
          src={bibliotecaBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-secondary/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-accent/8 blur-3xl"
        />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-4 border-b border-border/50 bg-card/60 backdrop-blur-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img src={ispkLogo} alt="ISPK" className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/30 shadow-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-accent rounded-full border-2 border-card" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-foreground leading-tight">Biblioteca Virtual</h1>
            <p className="text-[10px] text-muted-foreground">ISPK · Instituto Superior Politécnico Katangoji</p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center relative flex-1 max-w-sm mx-8"
        >
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground z-10" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar livros..."
            className="w-full pl-9 pr-4 h-9 rounded-xl border border-border bg-background/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </motion.form>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("login")}
            className="font-semibold"
          >
            <LogIn className="h-4 w-4 mr-1.5" />
            Entrar
          </Button>
          <Button
            size="sm"
            onClick={() => setView("register")}
            className="font-semibold shadow-lg shadow-primary/20"
          >
            Cadastrar
          </Button>
        </motion.div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-73px)] px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ── HOME VIEW ── */}
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl text-center"
            >
              {/* Logo ISPK */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8 flex flex-col items-center gap-3"
              >
              </motion.div>

              {/* Welcome headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight"
              >
                Bem-vindo à<br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Biblioteca Virtual ISPK
                </span>
                <br />
                <span className="block text-lg md:text-xl font-medium text-muted-foreground mt-2">Instituto Superior Politécnico Katangoji</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed"
              >
                Explore nosso acervo físico e digital.<br className="hidden sm:block" />
                Milhares de títulos ao alcance de um clique.
              </motion.p>

              {/* Mobile search */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex md:hidden items-center relative mb-8"
              >
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground z-10" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar livros..."
                  className="w-full pl-11 pr-4 h-12 rounded-2xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-xl text-sm font-semibold"
                >
                  Buscar
                </button>
              </motion.form>

              {/* ── Hero Carousel ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="mb-8 w-full"
              >
              </motion.div>

              {/* ── 3 MAIN CTAs ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
              >
                {/* Login Card */}
                <motion.button
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setView("login")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-red-800 p-6 text-left shadow-xl shadow-primary/25 cursor-pointer"
                >
                  <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
                  <LogIn className="h-7 w-7 text-white mb-3 relative z-10" />
                  <h3 className="text-lg font-bold text-white mb-1 relative z-10">Entrar</h3>
                  <p className="text-white/70 text-xs relative z-10">Aceda à sua conta e a todos os recursos</p>
                  <ArrowRight className="h-4 w-4 text-white/60 mt-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Register Card */}
                <motion.button
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setView("register")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-orange-700 p-6 text-left shadow-xl shadow-secondary/25 cursor-pointer"
                >
                  <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
                  <User className="h-7 w-7 text-white mb-3 relative z-10" />
                  <h3 className="text-lg font-bold text-white mb-1 relative z-10">Criar Conta</h3>
                  <p className="text-white/70 text-xs relative z-10">Registe-se gratuitamente como estudante</p>
                  <ArrowRight className="h-4 w-4 text-white/60 mt-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Guest Card */}
                <motion.button
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/catalogo")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/80 to-yellow-600 p-6 text-left shadow-xl shadow-accent/20 cursor-pointer"
                >
                  <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
                  <BookOpen className="h-7 w-7 text-accent-foreground mb-3 relative z-10" />
                  <h3 className="text-lg font-bold text-accent-foreground mb-1 relative z-10">Visitar como Convidado</h3>
                  <p className="text-accent-foreground/70 text-xs relative z-10">Explore o catálogo sem fazer login</p>
                  <ArrowRight className="h-4 w-4 text-accent-foreground/60 mt-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex items-center justify-center gap-8 text-center"
              >
                {[
                  { icon: BookOpen, value: stats.books.toLocaleString(), label: "Títulos" },
                  { icon: Library, value: stats.categories.toLocaleString(), label: "Categorias" },
                  { icon: Users, value: stats.students.toLocaleString(), label: "Estudantes" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <s.icon className="h-4 w-4 text-muted-foreground mb-0.5" />
                    <span className="text-2xl font-bold text-foreground">{s.value}</span>
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Guest disclaimer */}

           

              {/* Visão e Missão */}
             
            </motion.div>
          )}

          {/* ── LOGIN VIEW ── */}
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              <button
                onClick={() => setView("home")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Voltar
              </button>

              <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-foreground/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-red-800 flex items-center justify-center shadow-lg shadow-primary/30">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Bem-vindo de volta</h2>
                    <p className="text-xs text-muted-foreground">Entre na sua conta ISPK</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Palavra-passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/25" disabled={loading}>
                    {loading ? "A processar..." : "Entrar"}
                  </Button>
                </form>

                <div className="mt-5 pt-5 border-t border-border text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Não tem conta?{" "}
                    <button onClick={() => setView("register")} className="text-primary font-semibold hover:underline">
                      Criar conta
                    </button>
                  </p>
                  <button
                    onClick={() => navigate("/catalogo")}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Ou visitar como convidado →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REGISTER VIEW ── */}
          {view === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              <button
                onClick={() => setView("home")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Voltar
              </button>

              <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-foreground/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-secondary to-orange-700 flex items-center justify-center shadow-lg shadow-secondary/30">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Criar conta</h2>
                    <p className="text-xs text-muted-foreground">Registe-se gratuitamente</p>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        placeholder="O seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password">Palavra-passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/25"
                    disabled={loading}
                  >
                    {loading ? "A criar conta..." : "Criar Conta"}
                  </Button>
                </form>

                <div className="mt-5 pt-5 border-t border-border text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Já tem conta?{" "}
                    <button onClick={() => setView("login")} className="text-primary font-semibold hover:underline">
                      Entrar
                    </button>
                  </p>
                  <button
                    onClick={() => navigate("/catalogo")}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Ou visitar como convidado →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default Landing;
