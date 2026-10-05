import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminSubcategories = () => {
  const { toast } = useToast();
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [catId, setCatId] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const [subsRes, catsRes] = await Promise.all([
      supabase.from("subcategories").select("*, categories(name)").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setSubcategories(subsRes.data || []);
    setCategories(catsRes.data || []);
    setLoading(false);
  }

  function resetForm() {
    setName(""); setDescription(""); setCatId(""); setEditingId(null);
  }

  function openEdit(sub: any) {
    setEditingId(sub.id);
    setName(sub.name);
    setDescription(sub.description || "");
    setCatId(sub.category_id);
    setDialogOpen(true);
  }

  async function saveSubcategory() {
    if (!name || !catId) return;
    setSaving(true);

    const payload = { name, description: description || null, category_id: catId };
    const { error } = editingId
      ? await supabase.from("subcategories").update(payload).eq("id", editingId)
      : await supabase.from("subcategories").insert(payload);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Subcategoria atualizada" : "Subcategoria criada com sucesso" });
      resetForm();
      setDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  }

  async function deleteSubcategory(id: string) {
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subcategoria removida" });
      fetchData();
    }
  }

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Subcategorias</h1>
            <p className="text-muted-foreground mt-1">Organize as subcategorias dentro de cada categoria</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Subcategoria</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editingId ? "Editar Subcategoria" : "Nova Subcategoria"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={catId} onValueChange={setCatId}>
                    <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da subcategoria" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" />
                </div>
                <Button className="w-full" onClick={saveSubcategory} disabled={saving || !name || !catId}>
                  {saving ? "A guardar..." : editingId ? "Guardar Alterações" : "Criar Subcategoria"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{subcategories.length}</p><p className="text-xs text-muted-foreground">Subcategorias</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{categories.length}</p><p className="text-xs text-muted-foreground">Categorias</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{new Set(subcategories.map(s => s.category_id)).size}</p><p className="text-xs text-muted-foreground">Categorias com Subcategorias</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subcategoria</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      Nenhuma subcategoria criada ainda.
                    </TableCell>
                  </TableRow>
                )}
                {subcategories.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell><span className="font-medium text-sm">{sub.name}</span></TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{sub.categories?.name}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">{sub.description || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSubcategory(sub.id)}><Trash2 className="h-4 w-4" /></Button>
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

export default AdminSubcategories;
