import { createClient } from "npm:@supabase/supabase-js@2";
import {
  streamText,
  stepCountIs,
  tool,
  type UIMessage,
} from "npm:ai";
import { z } from "npm:zod";
import { createLovableAiGatewayProvider } from "../_shared/ai-gateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(
      token,
    );
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const messages: UIMessage[] = body.messages ?? [];
    const threadId: string | undefined = body.threadId;
    const bookId: string | undefined = body.bookId;



    // ---- Build book context (when a book is open / linked to the thread) ----
    let bookContext = "";
    let activeBook: { id: string; title: string; author: string } | null = null;
    if (bookId) {
      const { data: book } = await supabase
        .from("books")
        .select("id, title, author, description, publisher, publication_year, content, categories(name)")
        .eq("id", bookId)
        .maybeSingle();
      if (book) {
        activeBook = { id: book.id, title: book.title, author: book.author };
        const content = (book.content ?? "").slice(0, 16000);
        bookContext = `\n\n=== LIVRO ATUALMENTE ABERTO ===\nTítulo: ${book.title}\nAutor: ${book.author}\nCategoria: ${(book as any).categories?.name ?? "—"}\nAno: ${book.publication_year ?? "—"}\nDescrição: ${book.description ?? "—"}\n${content ? `\nCONTEÚDO DO LIVRO (use como fonte principal para resumos, explicações, flashcards, mapas mentais, exercícios e questionários):\n"""\n${content}\n"""` : "\n(O texto integral deste livro ainda não está disponível na base de dados; responda com base na descrição e no seu conhecimento geral, avisando o utilizador.)"}\n=== FIM DO LIVRO ===`;
      }
    }

    const system = `És a Kate, assistente da Biblioteca Digital ISPK e tutora académica simpática e rigorosa. Respondes SEMPRE em português de Portugal, com formatação Markdown clara (títulos, listas, tabelas, negrito).

O que fazes:
- Respondes a perguntas gerais dos utilizadores sobre a biblioteca e sobre temas académicos.
- Quando há um livro aberto, usas o conteúdo desse livro como fonte principal.
- Geras resumos (por página, capítulo ou livro completo), explicas conceitos difíceis de forma simples.
- Crias materiais de estudo quando pedido: flashcards (Pergunta/Resposta), mapas mentais (em lista hierárquica ou Markdown), exercícios e questionários (com soluções no fim).
- Recomendas livros e ajudas a pesquisar no catálogo usando as ferramentas disponíveis.

Regras:
- Respeita os direitos de uso: não reproduzas o livro inteiro literalmente; resume e explica.
- Se não souberes ou faltar informação, diz claramente.
- Sê conciso mas completo.${bookContext}`;

    const gateway = createLovableAiGatewayProvider(apiKey);

    const tools = {
      search_books: tool({
        description:
          "Pesquisa livros no catálogo da biblioteca por título, autor, editora ou ISBN. Usa quando o utilizador quer encontrar ou consultar livros.",
        inputSchema: z.object({
          query: z.string().describe("Texto de pesquisa"),
          limit: z.number().optional().describe("Número máximo de resultados (por defeito 8)"),
        }),
        execute: async ({ query, limit }) => {
          const like = `%${query}%`;
          const { data, error } = await supabase
            .from("books")
            .select("id, title, author, publisher, publication_year, categories(name)")
            .or(`title.ilike.${like},author.ilike.${like},publisher.ilike.${like},isbn.ilike.${like}`)
            .limit(limit ?? 8);
          if (error) return { error: error.message };
          return { books: data ?? [] };
        },
      }),
      recommend_books: tool({
        description:
          "Recomenda livros para o utilizador com base no seu histórico de leitura e visualizações. Usa quando o utilizador pede recomendações ou sugestões.",
        inputSchema: z.object({
          limit: z.number().optional().describe("Número de recomendações (por defeito 5)"),
        }),
        execute: async ({ limit }) => {
          // Categories the user has read/viewed
          const { data: views } = await supabase
            .from("book_views")
            .select("books(category_id)")
            .eq("user_id", userId)
            .limit(50);
          const catIds = Array.from(
            new Set(
              (views ?? [])
                .map((v: any) => v.books?.category_id)
                .filter(Boolean),
            ),
          );
          let q = supabase
            .from("books")
            .select("id, title, author, categories(name)")
            .limit(limit ?? 5);
          if (catIds.length > 0) q = q.in("category_id", catIds);
          const { data, error } = await q;
          if (error) return { error: error.message };
          return {
            based_on_categories: catIds.length,
            books: data ?? [],
          };
        },
      }),
    };

    const modelMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: (m.parts ?? [])
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("\n"),
      }))
      .filter((m) => m.content.trim().length > 0);

    const result = streamText({
      model: gateway("openai/gpt-5.5"),
      system,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(10),
    });



    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      headers: corsHeaders,
      onFinish: async ({ responseMessage }) => {
        if (!threadId) return;
        try {
          // Persist the latest user message + the assistant reply
          const lastUser = [...messages].reverse().find((m) => m.role === "user");
          const textOf = (m: any) =>
            (m.parts ?? [])
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.text)
              .join("\n");
          const rows: any[] = [];
          if (lastUser) {
            rows.push({
              thread_id: threadId,
              user_id: userId,
              role: "user",
              content: textOf(lastUser),
            });
          }
          const assistantText = textOf(responseMessage);
          if (assistantText) {
            rows.push({
              thread_id: threadId,
              user_id: userId,
              role: "assistant",
              content: assistantText,
            });
          }
          if (rows.length) {
            await supabase.from("chat_messages").insert(rows);
          }
          // Bump thread updated_at and set a title from the first user message
          const { data: threadRow } = await supabase
            .from("chat_threads")
            .select("title")
            .eq("id", threadId)
            .maybeSingle();
          const patch: any = { updated_at: new Date().toISOString() };
          if (
            threadRow &&
            (!threadRow.title || threadRow.title === "Nova conversa") &&
            lastUser
          ) {
            patch.title = textOf(lastUser).slice(0, 60);
          }
          if (activeBook) patch.book_id = activeBook.id;
          await supabase.from("chat_threads").update(patch).eq("id", threadId);
        } catch (e) {
          console.error("persist error", e);
        }
      },
    });
  } catch (e) {
    console.error("assistant error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
