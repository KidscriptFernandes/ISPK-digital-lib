import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function userClient(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "search_books",
  title: "Search books",
  description:
    "Search the ISPK virtual library catalog by title, author, publisher or ISBN. Returns matching books.",
  inputSchema: {
    query: z.string().min(1).describe("Search text matched against title, author, publisher and ISBN."),
    limit: z.number().int().min(1).max(50).optional().describe("Max number of results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = userClient(ctx);
    const like = `%${query}%`;
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, publisher, isbn, publication_year, available, digital, access_type")
      .or(`title.ilike.${like},author.ilike.${like},publisher.ilike.${like},isbn.ilike.${like}`)
      .limit(limit ?? 10);

    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { books: data ?? [] },
    };
  },
});
