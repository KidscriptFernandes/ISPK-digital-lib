import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchBooksTool from "./tools/search-books";
import getBookTool from "./tools/get-book";
import listCategoriesTool from "./tools/list-categories";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ispk-library-mcp",
  title: "ISPK Virtual Library MCP",
  version: "0.1.0",
  instructions:
    "Tools for the ISPK Virtual Library. Use `search_books` to find books by title, author, publisher or ISBN, `get_book` to fetch full details of one book, and `list_categories` to see available categories.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchBooksTool, getBookTool, listCategoriesTool],
});
