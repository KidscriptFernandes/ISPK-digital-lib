import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppLayout } from "@/components/AppLayout";
import { Plus, Pencil, Trash2, Upload, FileText, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminBooks = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [catId, setCatId] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [pages, setPages] = useState("");
  const [accessType, setAccessType] = useState("online_public");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const [booksRes, catsRes] = await Promise.all([
      supabase.from("books").select("*, categories(name)").order("title"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setBooks(booksRes.data || []);
    setCategories(catsRes.data || []);
    setLoading(false);
  }

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      // Auto-extract cover from first page
      extractCoverFromPdf(file);
    }
  }

  async function extractCoverFromPdf(file: File) {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      canvas.toBlob((blob) => {
        if (blob) {
          const coverFromPdf = new File([blob], "cover.jpg", { type: "image/jpeg" });
          setCoverFile(coverFromPdf);
          setCoverPreview(canvas.toDataURL("image/jpeg"));
          toast({ title: "Capa extraída", description: "A capa foi extraída automaticamente da primeira página do PDF." });
        }
      }, "image/jpeg", 0.85);
    } catch {
      // If extraction fails, admin can upload manually
      console.warn("Could not extract cover from PDF");
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  async function saveBook() {
    if (!title || !author) return;
    setSaving(true);

    let pdfUrl: string | null = editingBook?.pdf_url || null;
    let coverUrl: string | null = editingBook?.cover_image_url || null;
    const timestamp = Date.now();

    try {
      // Upload PDF if it was changed
      if (pdfFile) {
        const pdfPath = `pdfs/${timestamp}-${pdfFile.name}`;
        const { error: pdfError } = await supabase.storage.from("books").upload(pdfPath, pdfFile, { contentType: "application/pdf" });
        if (pdfError) throw pdfError;
        const { data: pdfPublic } = supabase.storage.from("books").getPublicUrl(pdfPath);
        pdfUrl = pdfPublic.publicUrl;
      }

      // Upload cover if it was changed
      if (coverFile) {
        const coverPath = `covers/${timestamp}-cover.jpg`;
        const { error: coverError } = await supabase.storage.from("books").upload(coverPath, coverFile, { contentType: coverFile.type });
        if (coverError) throw coverError;
        const { data: coverPublic } = supabase.storage.from("books").getPublicUrl(coverPath);
        coverUrl = coverPublic.publicUrl;
      }

      const bookPayload = {
        title,
        author,
        publication_year: year ? parseInt(year) : null,
        category_id: catId || null,
        description: description || null,
        isbn: isbn || null,
        pages: pages ? parseInt(pages) : null,
        pdf_url: pdfUrl,
        cover_image_url: coverUrl,
        digital: !!pdfUrl,
        access_type: accessType as any,
      };

      const result = editingBook
        ? await supabase.from("books").update(bookPayload).eq("id", editingBook.id)
        : await supabase.from("books").insert(bookPayload);

      if (result.error) {
        toast({ title: "Erro", description: result.error.message, variant: "destructive" });
      } else {
        toast({ title: editingBook ? "Livro atualizado" : "Livro adicionado com sucesso" });
        resetForm();
        setDialogOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  }

  function resetForm() {
    setEditingBook(null);
    setTitle(""); setAuthor(""); setYear(""); setCatId(""); setDescription(""); setIsbn(""); setPages("");
    setAccessType("online_public"); setPdfFile(null); setCoverFile(null); setCoverPreview(null);
  }

  async function deleteBook(id: string) {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao eliminar livro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Livro removido" });
      fetchData();
    }
  }

  function editBook(book: any) {
    setEditingBook(book);
    setTitle(book.title || "");
    setAuthor(book.author || "");
    setYear(book.publication_year ? String(book.publication_year) : "");
    setCatId(book.category_id || "");
    setDescription(book.description || "");
    setIsbn(book.isbn || "");
    setPages(book.pages ? String(book.pages) : "");
    setAccessType(book.access_type || "online_public");
    setCoverFile(null);
    setPdfFile(null);
    setCoverPreview(book.cover_image_url || null);
    setDialogOpen(true);
  }

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Livros</h1>
            <p className="text-muted-foreground mt-1">Adicionar, editar e remover livros do acervo</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Novo Livro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingBook ? "Editar Livro" : "Adicionar Livro"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Título *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do livro" /></div>
                <div className="space-y-2"><Label>Autor *</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nome do autor" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Ano</Label><Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" /></div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={catId} onValueChange={setCatId}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>ISBN</Label><Input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="ISBN" /></div>
                  <div className="space-y-2"><Label>Páginas</Label><Input type="number" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Nº páginas" /></div>
                </div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do livro" /></div>

                {/* Access Type */}
                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <Select value={accessType} onValueChange={setAccessType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online_public">📖 Leitura Online (Visitantes)</SelectItem>
                      <SelectItem value="online_registered">📚 Apenas Usuários Cadastrados</SelectItem>
                      <SelectItem value="physical_only">🏫 Livro Físico na Biblioteca</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {accessType === "online_public" && "Qualquer pessoa pode ler online, sem cadastro."}
                    {accessType === "online_registered" && "Somente usuários logados podem ler e baixar."}
                    {accessType === "physical_only" && "Livro disponível apenas fisicamente na biblioteca."}
                  </p>
                </div>

                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label>Arquivo PDF</Label>
                  <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfChange} className="hidden" />
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={() => pdfInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {pdfFile ? pdfFile.name : "Selecionar PDF"}
                  </Button>
                  {pdfFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  )}
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label>Imagem de Capa</Label>
                  {coverPreview && (
                    <div className="flex justify-center">
                      <img src={coverPreview} alt="Capa" className="h-40 rounded-lg shadow-md object-cover" />
                    </div>
                  )}
                  {coverPreview && pdfFile && (
                    <p className="text-xs text-muted-foreground text-center">Capa extraída automaticamente do PDF</p>
                  )}
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={() => coverInputRef.current?.click()}>
                    <Image className="h-4 w-4" />
                    {coverPreview ? "Alterar Capa" : "Enviar Capa Manualmente"}
                  </Button>
                </div>

                <Button className="w-full" onClick={saveBook} disabled={saving || !title || !author}>
                  {saving ? "A guardar..." : "Guardar Livro"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{books.length}</p><p className="text-xs text-muted-foreground">Total de Livros</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{categories.length}</p><p className="text-xs text-muted-foreground">Categorias</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{books.filter(b => b.available).length}</p><p className="text-xs text-muted-foreground">Disponíveis</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-secondary">{books.filter(b => !b.available).length}</p><p className="text-xs text-muted-foreground">Emprestados</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livro</TableHead>
                  <TableHead className="hidden sm:table-cell">Autor</TableHead>
                  <TableHead className="hidden md:table-cell">Acesso</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {book.cover_image_url && <img src={book.cover_image_url} alt={book.title} className="h-10 w-7 object-cover rounded" />}
                        <div>
                          <span className="font-medium text-sm">{book.title}</span>
                          {book.pdf_url && <FileText className="inline ml-1.5 h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{book.author}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {book.access_type === "online_public" && <span className="text-green-600">📖 Visitantes</span>}
                      {book.access_type === "online_registered" && <span className="text-blue-600">📚 Cadastrados</span>}
                      {book.access_type === "physical_only" && <span className="text-orange-600">🏫 Físico</span>}
                      {!book.access_type && <span className="text-muted-foreground">📖 Visitantes</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{book.categories?.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => editBook(book)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteBook(book.id)}><Trash2 className="h-4 w-4" /></Button>
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

export default AdminBooks;
