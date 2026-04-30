import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppLayout } from "@/components/AppLayout";
import { ArrowLeft, BookOpen, Download, Calendar, Hash, Layers, Lock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [book, setBook] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("books").select("*, categories(name)").eq("id", id!).single();
      setBook(data);
      if (data?.category_id) {
        const { data: rel } = await supabase.from("books").select("*, categories(name)").eq("category_id", data.category_id).neq("id", id!).limit(3);
        setRelated(rel || []);
      }
      // Check active loan
      if (user && data) {
        const { data: loan } = await supabase.from("book_loans").select("id").eq("book_id", data.id).eq("user_id", user.id).is("return_date", null).maybeSingle();
        setHasActiveLoan(!!loan);
      }
      // Track view only for authenticated users
      if (user && data) {
        supabase.from("book_views").insert({ book_id: data.id, user_id: user.id });
      }
      setLoading(false);
    }
    load();
  }, [id, user]);

  async function requestLoan() {
    if (!user || !book) return;
    setRequesting(true);
    const { error } = await supabase.from("book_loans").insert({ book_id: book.id, user_id: user.id });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Empréstimo solicitado", description: "Dirija-se à biblioteca para levantar o livro." });
      setHasActiveLoan(true);
    }
    setRequesting(false);
  }

  async function handleDownload() {
    if (!book?.pdf_url) return;
    setDownloading(true);

    try {
      const response = await fetch(book.pdf_url);
      if (!response.ok) throw new Error("Não foi possível baixar o arquivo.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.title?.replace(/\s+/g, "_") || "livro"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Download iniciado", description: "O PDF está sendo baixado." });
    } catch (error: any) {
      toast({ title: "Erro no download", description: error?.message || "Não foi possível iniciar o download." , variant: "destructive" });
      window.open(book.pdf_url, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div></AppLayout>;
  }

  if (!book) {
    return <AppLayout><div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Livro não encontrado</p></div></AppLayout>;
  }

  const hasPdf = !!book.pdf_url;
  const accessType = book.access_type || "online_public";

  // Access rules:
  // online_public: anyone reads online, logged-in downloads
  // online_registered: only logged-in reads/downloads
  // physical_only: no digital access, only physical loan

  const canReadOnline = hasPdf && (
    accessType === "online_public" ||
    (accessType === "online_registered" && !!user)
  );
  const canDownload = hasPdf && !!user && accessType !== "physical_only";
  const isPhysicalOnly = accessType === "physical_only";

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8">
          {book.cover_image_url && (
            <div className="w-full md:w-72 flex-shrink-0">
              <img src={book.cover_image_url} alt={book.title} className="w-full rounded-xl shadow-lg aspect-[3/4] object-cover" />
            </div>
          )}

          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{book.categories?.name}</Badge>
                <Badge variant="outline" className="text-xs">
                  {accessType === "online_public" && "📖 Leitura Livre"}
                  {accessType === "online_registered" && "📚 Só Cadastrados"}
                  {accessType === "physical_only" && "🏫 Livro Físico"}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{book.title}</h1>
              <p className="text-lg text-muted-foreground mt-1">{book.author}</p>
            </div>

            <p className="text-foreground/80 leading-relaxed">{book.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {book.publication_year && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> {book.publication_year}</div>}
              {book.pages && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Layers className="h-4 w-4" /> {book.pages} páginas</div>}
              {book.isbn && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Hash className="h-4 w-4" /> {book.isbn}</div>}
            </div>

            {/* Availability badge */}
            <div>
              <Badge variant={book.available ? "default" : "destructive"}>
                {book.available ? "Disponível" : "Emprestado"}
              </Badge>
              {book.digital && <Badge variant="outline" className="ml-2">Digital</Badge>}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {/* Read online */}
              {canReadOnline && (
                <Button className="gap-2" onClick={() => setIsReaderOpen(true)}>
                  <BookOpen className="h-4 w-4" /> Ler Online
                </Button>
              )}

              {/* Show login prompt for online_registered books when not logged in */}
              {hasPdf && accessType === "online_registered" && !user && (
                <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Acesso restrito a usuários cadastrados</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <Link to="/login" className="text-primary font-medium hover:underline">Faça login ou registe-se</Link>{" "}
                      para ler e baixar este livro.
                    </p>
                  </div>
                </div>
              )}

              {/* Download */}
              {canDownload && (
                <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={downloading}>
                  <Download className="h-4 w-4" /> {downloading ? "Baixando..." : "Download"}
                </Button>
              )}

              {/* Login prompt for download on public books */}
              {hasPdf && accessType === "online_public" && !user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>
                    <Link to="/login" className="text-primary font-medium hover:underline">Faça login</Link> para baixar o PDF
                  </span>
                </div>
              )}

              {/* Physical loan request - only for logged-in users */}
              {user && book.available && (accessType === "physical_only" || !book.digital) && (
                <div>
                  {hasActiveLoan ? (
                    <Badge variant="outline" className="text-sm py-1.5 px-3">✓ Empréstimo já solicitado</Badge>
                  ) : (
                    <Button variant="secondary" className="gap-2" onClick={requestLoan} disabled={requesting}>
                      <Send className="h-4 w-4" /> Solicitar Empréstimo Físico
                    </Button>
                  )}
                </div>
              )}

              {/* Visitor notice for physical loans */}
              {!user && (accessType === "physical_only" || !book.digital) && (
                <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Empréstimo exclusivo para alunos</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <Link to="/login" className="text-primary font-medium hover:underline">Faça login ou registe-se</Link>{" "}
                      para solicitar o empréstimo deste livro.
                    </p>
                  </div>
                </div>
              )}

              {/* Physical only notice */}
              {isPhysicalOnly && <p className="text-sm text-muted-foreground">📚 Este livro está disponível apenas fisicamente na biblioteca.</p>}
            </div>
          </div>
        </motion.div>

        <Dialog open={isReaderOpen} onOpenChange={setIsReaderOpen}>
          <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden bg-transparent shadow-none">
            <div className="relative flex h-full w-full flex-col rounded-3xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <DialogHeader className="flex-1">
                  <DialogTitle className="text-base font-semibold">Ler dentro da plataforma</DialogTitle>
                </DialogHeader>
                <DialogClose asChild>
                  <Button variant="ghost" className="h-10 w-10 p-0 rounded-full text-muted-foreground hover:bg-muted/50" aria-label="Fechar leitura">
                    <span className="text-xl">×</span>
                  </Button>
                </DialogClose>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={book.pdf_url}
                  title={book.title}
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Livros Relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {related.map((rb) => (
                <Link key={rb.id} to={`/livro/${rb.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                    {rb.cover_image_url && (
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={rb.cover_image_url} alt={rb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <p className="font-medium text-foreground text-sm line-clamp-1">{rb.title}</p>
                      <p className="text-xs text-muted-foreground">{rb.author}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BookDetail;
