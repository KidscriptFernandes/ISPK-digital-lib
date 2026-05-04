import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppLayout } from "@/components/AppLayout";
import { ArrowLeft, ArrowRight, BookOpen, Download, Calendar, Hash, Layers, Lock, Send, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save reading position to localStorage and Supabase
  async function saveReadingPosition(pageNum: number) {
    if (!book || !user) return;

    // Save to localStorage for instant access
    localStorage.setItem(`book_reading_pos_${book.id}`, JSON.stringify({
      page: pageNum,
      timestamp: Date.now(),
    }));

    // Try to save to Supabase for cross-device sync
    try {
      const { error } = await supabase
        .from("reading_positions")
        .upsert(
          {
            book_id: book.id,
            user_id: user.id,
            page_number: pageNum,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: "book_id,user_id" }
        );

      if (error) {
        console.warn("Failed to save reading position to Supabase:", error);
      }
    } catch (error) {
      console.warn("Error saving reading position:", error);
    }
  }

  // Load reading position from localStorage or Supabase
  async function loadReadingPosition(): Promise<number> {
    if (!book) return 1;

    // Try localStorage first
    try {
      const cached = localStorage.getItem(`book_reading_pos_${book.id}`);
      if (cached) {
        const { page } = JSON.parse(cached);
        return page;
      }
    } catch (error) {
      console.warn("Error reading from localStorage:", error);
    }

    // Try to load from Supabase if user is logged in
    if (user) {
      try {
        const { data, error } = await supabase
          .from("reading_positions")
          .select("page_number")
          .eq("book_id", book.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Error loading reading position from Supabase:", error);
          return 1;
        }

        if (data?.page_number) {
          // Save to localStorage for instant access next time
          localStorage.setItem(`book_reading_pos_${book.id}`, JSON.stringify({
            page: data.page_number,
            timestamp: Date.now(),
          }));
          return data.page_number;
        }
      } catch (error) {
        console.warn("Error querying Supabase:", error);
      }
    }

    return 1;
  }

  // Handle when reader is opened
  async function handleReaderOpen() {
    const savedPage = await loadReadingPosition();
    setCurrentPage(savedPage);
    setIsReaderOpen(true);
  }

  // Handle when reader is closed
  function handleReaderClose() {
    // Save position one last time
    if (currentPage > 1) {
      saveReadingPosition(currentPage);
    }

    // Cancel auto-save interval
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }

    setIsReaderOpen(false);
  }

  // Setup auto-save interval when reader is open
  useEffect(() => {
    if (isReaderOpen && user) {
      // Save reading position every 10 seconds while reading
      saveIntervalRef.current = setInterval(() => {
        if (currentPage > 0) {
          saveReadingPosition(currentPage);
        }
      }, 10000);

      return () => {
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
        }
      };
    }
  }, [isReaderOpen, currentPage, user, book]);

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
                <Button className="gap-2" onClick={handleReaderOpen}>
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

        <Dialog open={isReaderOpen} onOpenChange={handleReaderClose}>
          <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden bg-transparent shadow-none">
            <div className="relative flex h-full w-full flex-col rounded-3xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <DialogHeader className="flex-1">
                  <DialogTitle className="text-base font-semibold">
                    Ler dentro da plataforma {currentPage > 1 && `- Página ${currentPage}`}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      const newPage = Math.max(1, currentPage - 1);
                      setCurrentPage(newPage);
                    }}
                    className="h-10 w-10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-20 text-center">
                    Pág {currentPage}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="h-10 w-10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={`${book.pdf_url}#page=${currentPage}`}
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
