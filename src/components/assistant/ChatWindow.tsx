import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Wrench, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import ispkLogo from "@/assets/ispk-logo.jpg";

interface ChatWindowProps {
  threadId: string;
  bookId?: string | null;
  bookTitle?: string | null;
  /** Ensures the thread row exists in the DB before the first message is sent. */
  ensureThread: () => Promise<string>;
  variant?: "full" | "compact";
  onFirstMessage?: () => void;
}

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/library-assistant`;

function partsToText(msg: UIMessage) {
  return (msg.parts ?? [])
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text)
    .join("\n");
}

export function ChatWindow({
  threadId,
  bookId,
  bookTitle,
  ensureThread,
  variant = "full",
  onFirstMessage,
}: ChatWindowProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const ctxRef = useRef({ threadId, bookId: bookId ?? null });
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ctxRef.current = { threadId, bookId: bookId ?? null };
  }, [threadId, bookId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: ENDPOINT,
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            threadId: ctxRef.current.threadId,
            bookId: ctxRef.current.bookId,
          },
        }),
      }),
    [session?.access_token],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: threadId,
    transport,
    onError: (err) =>
      toast({ title: "Erro do assistente", description: err.message, variant: "destructive" }),
  });

  // Load history for this thread
  useEffect(() => {
    let active = true;
    setLoadingHistory(true);
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (!active) return;
      const loaded: UIMessage[] = (data ?? []).map((m: any) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.content }],
      }));
      setMessages(loaded);
      setLoadingHistory(false);
    })();
    return () => {
      active = false;
    };
  }, [threadId, setMessages]);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!loadingHistory && !isLoading) taRef.current?.focus();
  }, [loadingHistory, isLoading, threadId]);

  async function submit(text: string) {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    const isFirst = messages.length === 0;
    try {
      const id = await ensureThread();
      ctxRef.current.threadId = id;
      await sendMessage({ text: value });
      if (isFirst) onFirstMessage?.();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  }

  const quickPrompts = bookId
    ? [
        "Resume este livro nos pontos principais",
        "Explica os conceitos-chave de forma simples",
        "Cria 5 flashcards (pergunta/resposta)",
        "Gera um questionário de 5 perguntas com soluções",
        "Faz um mapa mental do conteúdo",
      ]
    : [
        "Recomenda-me livros para ler",
        "Ajuda-me a encontrar um livro sobre...",
        "O que posso fazer nesta biblioteca?",
      ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 py-4 space-y-5">
        {bookTitle && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">A conversar sobre: <strong className="text-foreground">{bookTitle}</strong></span>
          </div>
        )}

        {loadingHistory ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <img src={ispkLogo} alt="Kate" className="mx-auto h-14 w-14 rounded-2xl object-cover" />
            <div>
              <p className="font-semibold text-foreground">Olá, sou a Kate</p>
              <p className="text-sm text-muted-foreground mt-1">
                Posso ajudar com resumos, explicações e materiais de estudo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => submit(q)}
                  className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const text = partsToText(m);
            const toolParts = (m.parts ?? []).filter((p: any) =>
              p.type?.startsWith("tool-") || p.type === "dynamic-tool",
            );
            return (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                {m.role === "assistant" && (
                  <img src={ispkLogo} alt="Kate" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {toolParts.length > 0 && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs opacity-70">
                      <Wrench className="h-3 w-3" /> a consultar o catálogo…
                    </div>
                  )}
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5 prose-pre:bg-background/50">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || " "}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{text}</p>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <img src={ispkLogo} alt="Kate" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Escreve a tua pergunta…"
            rows={variant === "compact" ? 1 : 2}
            className="resize-none min-h-[44px] max-h-40"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-11 w-11 shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
