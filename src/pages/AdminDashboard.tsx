import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { BookOpen, Users, CheckCircle, AlertCircle, ShieldCheck, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Stats {
  totalBooks: number;
  totalStudents: number;
  availableBooks: number;
  loanedBooks: number;
  totalAdmins: number;
  totalViews: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalBooks: 0, totalStudents: 0, availableBooks: 0, loanedBooks: 0, totalAdmins: 0, totalViews: 0 });
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const [booksRes, rolesRes, loansRes, viewsRes] = await Promise.all([
      supabase.from("books").select("id, available"),
      supabase.from("user_roles").select("role"),
      supabase.from("book_loans").select("*, books(title, author)").order("created_at", { ascending: false }).limit(5),
      supabase.from("book_views").select("id", { count: "exact" }),
    ]);

    const books = booksRes.data || [];
    const roles = rolesRes.data || [];
    const admins = roles.filter(r => r.role === "admin").length;
    const students = roles.filter(r => r.role === "student").length;

    setStats({
      totalBooks: books.length,
      totalStudents: students,
      availableBooks: books.filter(b => b.available).length,
      loanedBooks: books.filter(b => !b.available).length,
      totalAdmins: admins,
      totalViews: viewsRes.count || 0,
    });
    setRecentLoans(loansRes.data || []);
    setLoading(false);
  }

  const statCards = [
    { label: "Total de Livros", value: stats.totalBooks, icon: BookOpen, color: "from-primary to-red-700", link: "/admin/livros" },
    { label: "Alunos Cadastrados", value: stats.totalStudents, icon: Users, color: "from-secondary to-orange-600", link: "/admin/utilizadores" },
    { label: "Livros Disponíveis", value: stats.availableBooks, icon: CheckCircle, color: "from-emerald-600 to-green-700", link: "/admin/livros" },
    { label: "Livros Emprestados", value: stats.loanedBooks, icon: AlertCircle, color: "from-amber-500 to-orange-600", link: "/admin/livros" },
    { label: "Administradores", value: stats.totalAdmins, icon: ShieldCheck, color: "from-violet-600 to-purple-700", link: "/admin/administradores" },
    { label: "Total de Consultas", value: stats.totalViews, icon: Eye, color: "from-sky-500 to-blue-700", link: "/admin/definicoes" },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-red-800 to-secondary p-8 shadow-2xl shadow-primary/30">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-black/20 blur-xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Painel Administrativo
              </h1>
              <p className="text-white/70 mt-1">Centro de controlo da Biblioteca Virtual ISPK</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <Link to={card.link}>
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${card.color} p-6`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-4xl font-bold text-white">{card.value.toLocaleString()}</p>
                          <p className="text-white/80 text-sm mt-1 font-medium">{card.label}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <card.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Loans */}
        {recentLoans.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Últimos Empréstimos</h2>
                </div>
                <div className="space-y-3">
                  {recentLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{loan.books?.title || "—"}</p>
                        <p className="text-xs text-muted-foreground">{loan.books?.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Devolução:</p>
                        <p className="text-xs font-semibold text-foreground">
                          {new Date(loan.due_date).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Gerir Livros", url: "/admin/livros", color: "bg-primary/10 text-primary hover:bg-primary/20" },
            { label: "Empréstimos", url: "/admin/emprestimos", color: "bg-secondary/10 text-secondary hover:bg-secondary/20" },
            { label: "Gerir Utilizadores", url: "/admin/utilizadores", color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20" },
            { label: "Administradores", url: "/admin/administradores", color: "bg-fuchsia-500/10 text-fuchsia-600 hover:bg-fuchsia-500/20" },
            { label: "Categorias & Stats", url: "/admin/definicoes", color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.url}
              className={`${link.color} rounded-2xl p-4 text-sm font-semibold text-center transition-all hover:scale-105`}
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
