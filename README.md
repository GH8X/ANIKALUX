# AL-ANIQA LUX — الأنـيـقـة Lux

Wholesale clothing & luxury pajamas — a production-ready wholesale fashion website for the Algerian market.

Built with **React 18 + TypeScript + Vite + Tailwind CSS**, fully trilingual (🇬🇧 English · 🇫🇷 Français · 🇩🇿 العربية with RTL).

---

## 1. The logo is the source of truth

The visual identity is derived **from the official Al-Aniqa Lux logo** and nothing else:

| Role | Colour | Logo source |
| --- | --- | --- |
| Primary | `#6E1529` deep wine | the logo's background |
| Accent surface | `#F4E3C1` ivory cream | the logo's glyph |
| Accent | `#C4A05A` warm gold | hairline / metallic accent |
| Background | `#FBF7EF` cream paper | complementary |
| Text | `#2A0610` ink | complementary |
| Border | `#E7DAC6` | neutralised cream |

The logo file itself is **never recoloured, redrawn, stretched, cropped or replaced with text**. It is rendered with `object-contain` inside a fixed box so its proportions are preserved exactly.

### Add the official logo

Either **drop the file into `public/brand/`** using one of these names:

```
public/brand/logo.png      ← preferred
public/brand/logo.svg
public/brand/logo.webp
public/brand/logo.jpg
```

…or upload it at runtime: **Admin → Brand → Official logo → Upload logo**.

Until a file is present the site shows a neutral placeholder frame — it never invents a substitute mark. See `public/brand/README.txt`.

---

## 2. Admin dashboard

Visit **`/admin`** (or the *Admin* link in the footer). Signed-out visitors are redirected to `/auth?returnTo=/admin` and land back on the dashboard after signing in.

Default dashboard password: **`anika-lux`** — change it in **Admin → Brand → Dashboard password**.

| Tab | What you can manage |
| --- | --- |
| **Overview** | Catalogue counts, new requests, recent activity |
| **Products** | Add / edit / delete, multi-image upload, set main image, name, code, category, description, price, minimum wholesale quantity, sizes, colours, mark as New / Best Seller / Featured / hidden |
| **Categories** | Add, edit, delete, reorder, assign to the Pajamas or Clothing house |
| **Requests** | Every wholesale request with name, business, phone, wilaya, products, quantity, date, and the **New → Contacted → Confirmed → Completed** workflow |
| **Brand** | Official logo, hero headline/subtitle/media, About text, phone, WhatsApp, email, Instagram, Facebook, TikTok, address, featured / new arrivals / best sellers, dashboard password, data reset |

All content — About text, contact details, homepage copy — is editable. **No company information or contact details were invented**: every contact field ships empty and renders a neutral "not published yet" state until you fill it in.

---

## 3. Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage — hero, collections, New Arrivals, Best Sellers, Featured, Why Choose Al-Aniqa Lux, About, CTA |
| `/products` | Full wholesale catalogue |
| `/pajamas` · `/clothing` | Catalogue scoped to each house |
| `/new-arrivals` | Newest lines |
| `/product/:slug` | Product detail with gallery, specifications and structured data |
| `/about` · `/contact` | Brand and contact pages |
| `/wholesale` | Wholesale order request form (+ WhatsApp) |
| `/auth` · `/admin` | Administrator sign-in and dashboard |

The catalogue supports search, category / size / colour filtering, five sort modes, a responsive grid, and filters that live in the URL so any view is shareable.

---

## 4. Design system

Defined once in `tailwind.config.ts` + `src/index.css` and reused by every page: colour ramp, typography (Cormorant Garamond display + Jost UI + Noto Kufi Arabic), buttons, cards, inputs, badges, borders, shadows, spacing, section rhythm, skeleton / empty / error states and toast notifications.

---

## 5. SEO & performance

- Per-route `<title>`, meta description, Open Graph and Twitter metadata
- `robots.txt`, `sitemap.xml`, canonical URLs, `noindex` on private routes
- Product / Organization / ItemList / AboutPage structured data (JSON-LD)
- Descriptive `alt` text and a strict heading hierarchy
- Route-level code splitting, lazy images, memoised filtering, `prefers-reduced-motion` support

---

## 6. Local development

```bash
bun install
bun run dev        # dev server on 0.0.0.0:$PORT (falls back to 5173)
bun run typecheck  # tsc -b --noEmit
bun run build      # vite build → dist/
```

## 6b. Deploy notes — two non-obvious safeguards

⚠️ **Please read before “tidying up”.** Both of the following exist to fix a real production build failure. Removing either one re-breaks the deploy.

### 1. Build tooling lives in `dependencies`, not `devDependencies`

The hosting build runs on a **production-only install**, which skips `devDependencies`. While `vite` sat there, the build died with `sh: 1: vite: not found`. Keeping `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript` and `@types/*` as regular dependencies guarantees they exist in the clean deploy environment.

### 2. `tools/build-runner` — a `build` executable

The other half of the failure was:

```
error: could not determine executable to run for package build
```

That is Bun's *exact* error for `bunx build`, i.e. the build step invoking a bare `build` word, which Bun reads as an npm package named “build” rather than the `package.json` script. `bunx` prefers a binary in `node_modules/.bin`, so `@anika-lux/build-runner` is declared as a local `file:` dependency and exposes a `build` binary that runs the real Vite build (resolved through node_modules, not the PATH).

**Recommended permanent fix:** set the hosting build command to `bun run build` and the install command to `bun install`. Once that is done, `tools/build-runner` is unused and can be deleted along with its `dependencies` entry.

### Build script

`build` is intentionally just `vite build`: it emits static output into `dist/` and exits. Type checking is a separate `typecheck` script so a type error can never leave a deploy without a build artifact.

### Measured evidence for the root cause

Reproduced by installing into a clean checkout (tracked files only):

| Install mode | Packages | `node_modules/vite` |
| --- | --- | --- |
| `bun install` | 195 | present |
| `bun install --production` **with `vite` in `devDependencies`** | **68** | **absent** → `sh: 1: vite: not found` |
| `bun install --production` / `npm install --omit=dev` (current `package.json`) | 195 | present |

`sh: 1: vite: not found` is what a POSIX shell prints when the `vite` binary does not exist, so a production-only install with Vite classified as a dev dependency produces that error verbatim — and *only* that error, with no mention of the missing dependency.

The second error, `error: could not determine executable to run for package build`, is Bun's exact text for `bunx build` — a bare `build` word read as an npm package named “build”. It occurs when no `build` executable exists (for example before `package.json` was committed).

### 3. `dev` / `preview` never shell out to a bare `vite`

The hosting pipeline runs a command **after** the build. It shells that command through a POSIX shell that does **not** have `node_modules/.bin` on `PATH`, so a bare `vite` there fails:

```
✓ built in 7.67s            ← build already succeeded, dist/ written
sh: 1: vite: not found      ← the post-build server command
```

That is why the error appeared *after* a successful build. `dev` and `preview` therefore invoke Vite through Node rather than relying on `PATH`:

```json
"dev":     "node ./node_modules/vite/bin/vite.js --host 0.0.0.0",
"preview": "node ./node_modules/vite/bin/vite.js preview --host 0.0.0.0"
```

`node` is a global binary (verified as `/usr/bin/node`), so these resolve in any shell, with or without `node_modules/.bin` on `PATH`. `build` stays as the plain `vite build` the platform expects for Vite framework detection — it is the step that already succeeds.

---

### Preview port

`vite preview` reads `preview.*` from `vite.config.ts` and defaults to `localhost:4173`; it ignores both `server.*` and the injected `PORT`. The config therefore sets `preview.host` / `preview.port` too, so previewing the built output is reachable on the assigned port.

---

## 7. Architecture & scaling

`src/lib/store.tsx` is the single persistence seam. It currently hydrates from `localStorage` and exposes typed CRUD (`saveProduct`, `saveCategory`, `createRequest`, `setRequestStatus`, `saveSettings`, …) behind React context, with real `loading` / `ready` / `error` states that drive the skeletons and error UI.

Swapping that one module for a REST or Convex client is the only change required to move the catalogue server-side — components never touch storage directly.

The data model (`src/lib/types.ts`) is already shaped for the next steps: wholesale customer accounts and tiers, discounts and promotions, order and stock management, analytics, and multiple administrators.
