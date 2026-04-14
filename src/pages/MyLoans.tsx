import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";

const MyLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("book_loans")
        .select("*, books(title, author, cover_image_url)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      setLoans(data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const active = loans.filter(l => !l.return_date);
  const returned = loans.filter(l => !!l.return_date);

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Empréstimos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe os seus empréstimos de livros</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{active.length}</p><p className="text-xs text-muted-foreground">Ativos</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{returned.length}</p><p className="text-xs text-muted-foreground">Devolvidos</p></CardContent></Card>
        </div>

        {loans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Ainda não tem empréstimos.</p>
              <Link to="/catalogo" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">Explorar catálogo</Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Livro</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Devolução</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const isActive = !loan.return_date;
                    const isOverdue = isActive && new Date(loan.due_date) < new Date();
                    return (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {loan.books?.cover_image_url && <img src={loan.books.cover_image_url} alt="" className="h-10 w-7 object-cover rounded" />}
                            <div>
                              <p className="font-medium text-sm">{loan.books?.title}</p>
                              <p className="text-xs text-muted-foreground">{loan.books?.author}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(loan.loan_date), "dd MMM yyyy", { locale: pt })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(loan.due_date), "dd MMM yyyy", { locale: pt })}
                        </TableCell>
                        <TableCell>
                          {loan.return_date ? (
                            <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Devolvido</Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" /> Atrasado</Badge>
                          ) : (
                            <Badge variant="default" className="gap-1"><Clock className="h-3 w-3" /> Ativo</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default MyLoans;
