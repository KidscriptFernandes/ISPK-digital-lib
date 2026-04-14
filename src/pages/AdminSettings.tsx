import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Pencil, Trash2, BarChart3, Users, BookOpen, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, totalViews: 0, totalLoans: 0 });
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [catsRes, booksRes, viewsRes, loansRes, profilesRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("books").select("id", { count: "exact" }),
      supabase.from("book_views").select("book_id"),
      supabase.from("book_loans").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
    ]);

    setCategories(catsRes.data || []);
    setStats({
      totalBooks: booksRes.count || 0,
      totalUsers: profilesRes.count || 0,
      totalViews: viewsRes.data?.length || 0,
      totalLoans: loansRes.count || 0,
    });

    // Top viewed books
    if (viewsRes.data && viewsRes.data.length > 0) {
      const viewCounts: Record<string, number> = {};
      viewsRes.data.forEach((v: any) => {
        viewCounts[v.book_id] = (viewCounts[v.book_id] || 0) + 1;
      });
      const topIds = Object.entries(viewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => ({ id, count }));

      if (topIds.length > 0) {
        const { data: topBooksData } = await supabase
          .from("books")
          .select("id, title, author")
          .in("id", topIds.map(t => t.id));
        
        setTopBooks(topIds.map(t => ({
          ...topBooksData?.find(b => b.id === t.id),
          views: t.count,
        })));
      }
    }
    setLoading(false);
  }

  async function saveCategory() {
    if (!catName.trim()) return;
    if (editingCat) {
      await supabase.from("categories").update({ name: catName, description: catDesc }).eq("id", editingCat.id);
      toast({ title: "Categoria atualizada" });
    } else {
      await supabase.from("categories").insert({ name: catName, description: catDesc });
      toast({ title: "Categoria criada" });
    }
    setCatName(""); setCatDesc(""); setEditingCat(null); setDialogOpen(false);
    fetchData();
  }

  async function deleteCategory(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "Categoria removida" });
    fetchData();
  }

  function openEdit(cat: any) {
    setEditingCat(cat); setCatName(cat.name); setCatDesc(cat.description || ""); setDialogOpen(true);
  }

  function openNew() {
    setEditingCat(null); setCatName(""); setCatDesc(""); setDialogOpen(true);
  }

  const statCards = [
    { label: "Total Livros", value: stats.totalBooks, icon: BookOpen, color: "text-primary" },
    { label: "Utilizadores", value: stats.totalUsers, icon: Users, color: "text-secondary" },
    { label: "Visualizações", value: stats.totalViews, icon: Eye, color: "text-accent-foreground" },
    { label: "Empréstimos", value: stats.totalLoans, icon: BarChart3, color: "text-primary" },
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Definições</h1>
          <p className="text-muted-foreground mt-1">Gestão de categorias e estatísticas de uso</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Books */}
        {topBooks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Livros Mais Consultados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Livro</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead className="text-right">Visualizações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBooks.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.title}</TableCell>
                      <TableCell className="text-muted-foreground">{b.author}</TableCell>
                      <TableCell className="text-right">{b.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Categories Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Gestão de Categorias</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" onClick={openNew}>
                  <Plus className="h-4 w-4" /> Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCat ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Nome da categoria" />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Descrição" />
                  </div>
                  <Button className="w-full" onClick={saveCategory}>Guardar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{cat.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCategory(cat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminSettings;
