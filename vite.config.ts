import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
<<<<<<< HEAD
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
=======
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
<<<<<<< HEAD
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),
=======
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
>>>>>>> d4bc625e72d3a0b3bf650380eb1fa65146def7de
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
}));
