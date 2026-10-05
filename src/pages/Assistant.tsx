import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ChatWindow } from "@/components/assistant/ChatWindow";
import { useThreads } from "@/hooks/useThreads";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import ispkLogo from "@/assets/ispk-logo.jpg";

export default function Assistant() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { threads, isLoading, createThread, deleteThread, refetch } = useThreads();

  // If no thread selected, pick the newest or create one
  useEffect(() => {
    if (threadId || isLoading) return;
    if (threads.length > 0) {
      navigate(`/assistente/${threads[0].id}`, { replace: true });
    }
  }, [threadId, threads, isLoading, navigate]);

  async function handleNew() {
    const t = await createThread(null);
    navigate(`/assistente/${t.id}`);
  }

  async function handleDelete(id: string) {
    await deleteThread(id);
    if (id === threadId) navigate("/assistente", { replace: true });
  }

  const activeThread = threads.find((t) => t.id === threadId);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
        {/* Thread sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border border-border rounded-xl overflow-hidden bg-card">
          <div className="p-3 border-b border-border">
            <Button onClick={handleNew} className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" /> Nova conversa
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.length === 0 && !isLoading && (
              <p className="text-xs text-muted-foreground text-center py-6">Sem conversas ainda</p>
            )}
            {threads.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer text-sm",
                  t.id === threadId ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                )}
                onClick={() => navigate(`/assistente/${t.id}`)}
              >
                {t.book_id ? (
                  <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-70" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(t.updated_at), { locale: pt, addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  aria-label="Eliminar conversa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 min-w-0 border border-border rounded-xl overflow-hidden bg-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 h-12 shrink-0">
            <div className="flex items-center gap-2">
              <img src={ispkLogo} alt="Kate" className="h-7 w-7 rounded-md object-cover" />
              <span className="font-semibold text-sm">Kate</span>
            </div>
            <Button onClick={handleNew} variant="ghost" size="sm" className="gap-1.5 md:hidden">
              <Plus className="h-4 w-4" /> Nova
            </Button>
          </div>
          {threadId ? (
            <div className="flex-1 min-h-0">
              <ChatWindow
                key={threadId}
                threadId={threadId}
                bookId={activeThread?.book_id ?? null}
                ensureThread={async () => threadId}
                onFirstMessage={() => refetch()}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6">
              <img src={ispkLogo} alt="Kate" className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <p className="font-semibold">Converse com a Kate</p>
                <p className="text-sm text-muted-foreground mt-1">Comece uma nova conversa para estudar melhor.</p>
              </div>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" /> Nova conversa
              </Button>
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
