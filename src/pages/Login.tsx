import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ispkLogo from "@/assets/ispk-logo.jpg";
import bibliotecaBg from "@/assets/biblioteca-bg.jpg";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ books: 0, categories: 0, students: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setIsLogin(searchParams.get("mode") !== "register");
  }, [searchParams]);

  useEffect(() => {
    async function loadStats() {
      const [booksRes, catsRes, profilesRes] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        books: booksRes.count || 0,
        categories: catsRes.count || 0,
        students: profilesRes.count || 0,
      });
    }
    loadStats();
  }, []);

  if (user) {
    navigate("/inicio", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      } else {
        navigate("/inicio");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/inicio` },
      });
      if (error) {
        toast({ title: "Erro ao registar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Conta criada!", description: "Verifique o seu email para confirmar a conta." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <img src={bibliotecaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center z-10 px-8">
          <img src={ispkLogo} alt="ISPK" className="h-28 w-28 rounded-2xl mx-auto mb-8 shadow-2xl" />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Biblioteca Virtual
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-sm mx-auto">Instituto Superior Politécnico Katangoji</p>
          <div className="mt-8 flex justify-center gap-8 text-primary-foreground/60 text-sm">
            <div className="text-center"><div className="text-2xl font-bold text-primary-foreground">{stats.books.toLocaleString()}</div><div>Livros</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-primary-foreground">{stats.categories}</div><div>Categorias</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-primary-foreground">{stats.students.toLocaleString()}</div><div>Estudantes</div></div>
          </div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={ispkLogo} alt="ISPK" className="h-16 w-16 rounded-xl" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? "Bem-vindo de volta" : "Criar conta"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isLogin ? "Entre na sua conta para aceder à biblioteca" : "Registe-se para aceder ao acervo"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="O seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "A processar..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>

            {isLogin && (
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    toast({ title: "Email necessário", description: "Introduza o seu email para recuperar a palavra-passe.", variant: "destructive" });
                    return;
                  }
                  setLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) {
                    toast({ title: "Erro", description: error.message, variant: "destructive" });
                  } else {
                    toast({ title: "Email enviado", description: "Verifique a sua caixa de entrada para redefinir a palavra-passe." });
                  }
                  setLoading(false);
                }}
                className="w-full text-sm text-primary hover:underline mt-1"
              >
                Esqueci a minha palavra-passe
              </button>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? "Registar-se" : "Entrar"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
