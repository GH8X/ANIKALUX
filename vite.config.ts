import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    // Freebuff injects the workspace port; fall back to Vite's default.
    port: Number(process.env.PORT) || 5173,
    // Freebuff requires HMR to remain disabled.
    hmr: false,
  },
  preview: {
    // `vite preview` reads `preview.*`, not `server.*`, and defaults to port
    // 4173 bound to localhost — so a host that previews the built output could
    // not reach it. Mirror the dev server: all interfaces, injected port.
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
