import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { BookMarked, Star, Trash2, Save, BookOpenCheck, StickyNote } from "lucide-react";

interface Props {
  bookId: string;
  totalPages?: number | null;
  pdfUrl?: string | null;
}

export function BookStudyPanel({ bookId, totalPages, pdfUrl }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [lastPage, setLastPage] = useState<number | "">("");
  const [total, setTotal] = useState<number | "">(totalPages ?? "");
  const [notePage, setNotePage] = useState<number | "">("");
  const [noteText, setNoteText] = useState("");

  const { data: progress } = useQuery({
    queryKey: ["reading-progress", user?.id, bookId],
    queryFn: async () => {
      const { data } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("book_id", bookId)
        .maybeSingle();
      if (data) {
        setLastPage(data.last_page ?? "");
        setTotal(data.total_pages ?? totalPages ?? "");
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: bookmarks } = useQuery({
    queryKey: ["book-bookmarks", user?.id, bookId],
    queryFn: async () => {
      const { data } = await supabase
        .from("book_bookmarks")
        .select("*")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const pct =
    progress?.last_page && progress?.total_pages
      ? Math.min(100, Math.round((progress.last_page / progress.total_pages) * 100))
      : 0;

  async function saveProgress() {
    if (!user) return;
    const { error } = await supabase.from("reading_progress").upsert(
      {
        user_id: user.id,
        book_id: bookId,
        last_page: Number(lastPage) || 1,
        total_pages: Number(total) || null,
      },
      { onConflict: "user_id,book_id" },
    );
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Progresso guardado" });
    qc.invalidateQueries({ queryKey: ["reading-progress"] });
  }

  async function addBookmark(favorite: boolean) {
    if (!user) return;
    if (!favorite && !noteText.trim()) {
      return toast({ title: "Escreva uma nota primeiro", variant: "destructive" });
    }
    const { error } = await supabase.from("book_bookmarks").insert({
      user_id: user.id,
      book_id: bookId,
      page: notePage === "" ? null : Number(notePage),
      note: noteText.trim() || null,
      is_favorite: favorite,
    });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setNoteText("");
    setNotePage("");
    toast({ title: favorite ? "Página favoritada" : "Nota guardada" });
    qc.invalidateQueries({ queryKey: ["book-bookmarks"] });
  }

  async function removeBookmark(id: string) {
    await supabase.from("book_bookmarks").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["book-bookmarks"] });
  }

  if (!user) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Reading progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4 text-primary" /> Progresso de Leitura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Concluído</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Última página lida</label>
              <Input
                type="number"
                min={1}
                value={lastPage}
                onChange={(e) => setLastPage(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Total de páginas</label>
              <Input
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveProgress} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Guardar
            </Button>
            {pdfUrl && (
              <Button size="sm" variant="outline" asChild className="gap-1.5">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <BookMarked className="h-3.5 w-3.5" /> Continuar leitura
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes & favorites */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-secondary" /> Notas & Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Pág."
              className="w-20"
              value={notePage}
              onChange={(e) => setNotePage(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Textarea
              placeholder="Escreva uma nota pessoal…"
              rows={1}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="resize-none min-h-[40px]"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => addBookmark(false)} className="gap-1.5">
              <StickyNote className="h-3.5 w-3.5" /> Guardar nota
            </Button>
            <Button size="sm" variant="outline" onClick={() => addBookmark(true)} className="gap-1.5">
              <Star className="h-3.5 w-3.5" /> Favoritar página
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pt-1">
            {(bookmarks ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">Sem notas ainda</p>
            )}
            {(bookmarks ?? []).map((b: any) => (
              <div key={b.id} className="flex items-start gap-2 rounded-lg border border-border p-2 text-sm">
                {b.is_favorite && <Star className="h-3.5 w-3.5 text-accent fill-accent shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  {b.page != null && <span className="text-xs text-muted-foreground">Pág. {b.page} · </span>}
                  {b.note && <span>{b.note}</span>}
                  {!b.note && b.is_favorite && <span className="text-muted-foreground">Página favorita</span>}
                </div>
                <button onClick={() => removeBookmark(b.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
