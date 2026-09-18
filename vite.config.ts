import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Sitemaps, the `robots.txt` Sitemap directive, `canonical` and Open Graph
 * images all require ABSOLUTE urls, but the origin is only known at deploy
 * time. `public/sitemap.xml`, `public/robots.txt` and `index.html` therefore
 * carry `__SITE_URL__` tokens, replaced here.
 *
 * Set `SITE_URL` (or `VITE_SITE_URL`) in the hosting environment — for example
 * `https://anika-lux.freebuff.app`. With no value configured the token is
 * removed, which leaves the previous root-relative urls in place rather than
 * shipping a literal placeholder to crawlers.
 */
function stampSiteUrl(): Plugin {
  return {
    name: "stamp-site-url",
    apply: "build",
    closeBundle() {
      const configured = (process.env.SITE_URL || process.env.VITE_SITE_URL || "").trim();
      const origin = configured.replace(/\/+$/, "");
      if (configured && !/^https?:\/\//.test(origin)) {
        this.warn(`SITE_URL must start with http(s):// — got "${configured}". Ignoring it.`);
        return;
      }
      if (!configured) {
        this.warn(
          "SITE_URL is not set: sitemap.xml and robots.txt keep root-relative urls. " +
            "Set SITE_URL in the hosting environment to emit absolute urls.",
        );
      }
      const files = ["index.html", "sitemap.xml", "robots.txt"];
      for (const file of files) {
        const target = resolve(projectRoot, "dist", file);
        if (!existsSync(target)) continue;
        const stamped = readFileSync(target, "utf8").split("__SITE_URL__").join(origin);
        writeFileSync(target, stamped);
      }

      // SPA deep-link insurance: hosts that fall back to a static 404 page
      // serve this copy of the shell, so /products and /admin reload correctly
      // instead of 404ing.
      const shell = resolve(projectRoot, "dist", "index.html");
      if (existsSync(shell)) {
        writeFileSync(resolve(projectRoot, "dist", "404.html"), readFileSync(shell));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), stampSiteUrl()],
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
