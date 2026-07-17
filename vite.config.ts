import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Allow Vercel preview + Lovable/Supabase preview hosts without opening
    // the dev server to arbitrary hosts. Leading-dot entries match the host
    // and all of its subdomains.
    allowedHosts: [
      "sb-21kksmtw8ecs.vercel.run",
      ".vercel.run",
      ".vercel.app",
      ".lovableproject.com",
      ".lovable.app",
      ".lovable.dev",
      "localhost",
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
