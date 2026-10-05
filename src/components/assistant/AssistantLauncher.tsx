import { useState, useCallback, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, Plus, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveBook } from "@/contexts/BookContext";
import { useThreads } from "@/hooks/useThreads";
import ispkLogo from "@/assets/ispk-logo.jpg";
import { ChatWindow } from "./ChatWindow";

export function AssistantLauncher() {
  const { user } = useAuth();
  const { activeBook } = useActiveBook();
  const { createThread, refetch } = useThreads();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string>(() => crypto.randomUUID());
  const insertedRef = useRef(false);

  const ensureThread = useCallback(async () => {
    if (!insertedRef.current) {
      await createThread(activeBook?.id ?? null, threadId);
      insertedRef.current = true;
    }
    return threadId;
  }, [createThread, activeBook?.id, threadId]);

  const startNew = useCallback(() => {
    const id = crypto.randomUUID();
    insertedRef.current = false;
    setThreadId(id);
  }, []);

  if (!user) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Conversar com Kate"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 overflow-hidden rounded-full bg-white shadow-xl shadow-primary/30 ring-2 ring-primary/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <img src={ispkLogo} alt="Kate" className="h-full w-full object-cover" />
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
          <div className="flex items-center justify-between border-b border-border px-4 h-14 shrink-0">
            <div className="flex items-center gap-2">
              <img src={ispkLogo} alt="Kate" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-semibold text-sm">Kate</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Nova conversa" onClick={startNew}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Abrir em ecrã inteiro"
                onClick={async () => {
                  const id = await ensureThread();
                  await refetch();
                  setOpen(false);
                  navigate(`/assistente/${id}`);
                }}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ChatWindow
              key={threadId}
              threadId={threadId}
              bookId={activeBook?.id ?? null}
              bookTitle={activeBook?.title ?? null}
              ensureThread={ensureThread}
              variant="compact"
              onFirstMessage={() => refetch()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
