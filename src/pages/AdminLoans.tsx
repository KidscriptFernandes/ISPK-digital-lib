import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CheckCircle, Clock, RefreshCcw } from "lucide-react";

interface LoanRow {
  id: string;
  book_id: string;
  user_id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  books?: {
    title: string;
    author: string;
    cover_image_url: string | null;
  };
  full_name?: string | null;
}

const AdminLoans = () => {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { fetchLoans(); }, []);

  async function fetchLoans() {
    setLoading(true);
    const { data: loansData, error: loansError } = await supabase
      .from("book_loans")
      .select("*, books(title, author, cover_image_url)")
      .order("created_at", { ascending: false });

    if (loansError) {
      toast({ title: "Erro ao carregar empréstimos", description: loansError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!loansData || loansData.length === 0) {
      setLoans([]);
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set(loansData.map((loan) => loan.user_id)));
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds as string[]);

    const profilesMap: Record<string, string> = {};
    (profilesData || []).forEach((profile) => {
      profilesMap[profile.user_id] = profile.full_name || "Sem nome";
    });

    const merged = loansData.map((loan) => ({
      ...loan,
      full_name: profilesMap[loan.user_id] || "Sem nome",
    }));

    setLoans(merged);
    setLoading(false);
  }

  async function handleReturn(loan: LoanRow) {
    setProcessingId(loan.id);
    const returnDate = new Date().toISOString();

    const { error: loanError } = await supabase
      .from("book_loans")
      .update({ return_date: returnDate })
      .eq("id", loan.id);

    if (loanError) {
      toast({ title: "Erro ao marcar como devolvido", description: loanError.message, variant: "destructive" });
      setProcessingId(null);
      return;
    }

    const { error: bookError } = await supabase
      .from("books")
      .update({ available: true })
      .eq("id", loan.book_id);

    if (bookError) {
      toast({ title: "Erro ao atualizar livro", description: bookError.message, variant: "destructive" });
    }

    toast({ title: "Empréstimo atualizado", description: "O empréstimo foi marcado como devolvido." });
    await fetchLoans();
    setProcessingId(null);
  }

  async function handleReopen(loan: LoanRow) {
    setProcessingId(loan.id);

    const { error: loanError } = await supabase
      .from("book_loans")
      .update({ return_date: null })
      .eq("id", loan.id);

    if (loanError) {
      toast({ title: "Erro ao reabrir empréstimo", description: loanError.message, variant: "destructive" });
      setProcessingId(null);
      return;
    }

    const { error: bookError } = await supabase
      .from("books")
      .update({ available: false })
      .eq("id", loan.book_id);

    if (bookError) {
      toast({ title: "Erro ao atualizar livro", description: bookError.message, variant: "destructive" });
    }

    toast({ title: "Empréstimo reaberto", description: "O empréstimo voltou a ficar ativo." });
    await fetchLoans();
    setProcessingId(null);
  }

  const activeLoans = loans.filter((loan) => !loan.return_date);
  const returnedLoans = loans.filter((loan) => !!loan.return_date);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-gradient-to-br from-secondary via-orange-700 to-amber-600 p-7 shadow-xl shadow-secondary/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Empréstimos dos Utilizadores</h1>
              <p className="text-white/80 text-sm mt-1">Visualize todos os empréstimos e marque como devolvido quando precisar.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Card className="bg-white/10 border-white/10 shadow-none">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-white">{activeLoans.length}</p>
                  <p className="text-xs text-white/70 mt-1">Ativos</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/10 shadow-none">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-white">{returnedLoans.length}</p>
                  <p className="text-xs text-white/70 mt-1">Devolvidos</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : loans.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhum empréstimo encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="hidden lg:table-cell">Livro</TableHead>
                    <TableHead>Emprestado</TableHead>
                    <TableHead>Devolução</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const isActive = !loan.return_date;
                    const isOverdue = isActive && new Date(loan.due_date) < new Date();
                    return (
                      <TableRow key={loan.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm">{loan.full_name || "Sem nome"}</span>
                            <span className="text-xs text-muted-foreground">{loan.user_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-3">
                            {loan.books?.cover_image_url && <img src={loan.books.cover_image_url} alt="" className="h-10 w-7 object-cover rounded" />}
                            <div>
                              <p className="font-medium text-sm">{loan.books?.title || "—"}</p>
                              <p className="text-xs text-muted-foreground">{loan.books?.author || "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(loan.loan_date), "dd MMM yyyy", { locale: pt })}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(loan.due_date), "dd MMM yyyy", { locale: pt })}</TableCell>
                        <TableCell>
                          {loan.return_date ? (
                            <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Devolvido</Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" /> Atrasado</Badge>
                          ) : (
                            <Badge variant="default" className="gap-1"><Clock className="h-3 w-3" /> Ativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {loan.return_date ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReopen(loan)}
                              disabled={processingId === loan.id}
                            >
                              <RefreshCcw className="mr-2 h-4 w-4" /> Reabrir
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleReturn(loan)}
                              disabled={processingId === loan.id}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Marcar devolvido
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminLoans;
