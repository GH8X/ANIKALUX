import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultDatabase, defaultHomeSections } from "./seed";
import { HOME_SECTIONS, type HomeSectionState } from "./types";
import type {
  Category,
  Database,
  FaqItem,
  HomeSectionKey,
  MediaAsset,
  Product,
  RequestStatus,
  SiteSettings,
  Testimonial,
  WholesaleRequest,
} from "./types";
import { slugify } from "./utils";

const STORAGE_KEY = "anika-lux.db.v1";
const ADMIN_KEY = "anika-lux.admin";

export type StoreStatus = "loading" | "ready" | "error";

/**
 * Single persistence seam for the whole app. Today it hydrates from local
 * storage; swapping this module for a REST/Convex client is the only change
 * needed to move the catalogue to a server.
 */
/**
 * Fills in anything a previously stored database is missing.
 *
 * The nested settings objects are merged key by key on purpose: a shallow
 * `{...defaults, ...stored}` would drop every field added after the stored copy
 * was written, which would crash the pages that read them.
 */
function mergeHomeSections(stored: HomeSectionState[] | undefined): HomeSectionState[] {
  if (!stored || stored.length === 0) return defaultHomeSections;
  const known = stored.filter((section) => HOME_SECTIONS.includes(section.key));
  // A stored order written before a section existed would silently hide it.
  const missing = defaultHomeSections.filter(
    (section) => !known.some((item) => item.key === section.key),
  );
  return [...known, ...missing];
}

function normalize(parsed: Partial<Database> | null): Database {
  const stored: Partial<SiteSettings> = parsed?.settings ?? {};
  const settings: SiteSettings = {
    ...defaultDatabase.settings,
    ...stored,
    brand: { ...defaultDatabase.settings.brand, ...(stored.brand ?? {}) },
    hero: { ...defaultDatabase.settings.hero, ...(stored.hero ?? {}) },
    contact: { ...defaultDatabase.settings.contact, ...(stored.contact ?? {}) },
    announcement: { ...defaultDatabase.settings.announcement, ...(stored.announcement ?? {}) },
    seo: { ...defaultDatabase.settings.seo, ...(stored.seo ?? {}) },
    location: { ...defaultDatabase.settings.location, ...(stored.location ?? {}) },
    social: { ...defaultDatabase.settings.social, ...(stored.social ?? {}) },
    promotion: { ...defaultDatabase.settings.promotion, ...(stored.promotion ?? {}) },
    homeSections: mergeHomeSections(stored.homeSections),
  };

  const products = (parsed?.products ?? defaultDatabase.products).map((product, index) => ({
    ...product,
    badge: product.badge ?? "",
    stock: product.stock ?? null,
    videoUrl: product.videoUrl ?? null,
    order: typeof product.order === "number" ? product.order : index + 1,
  }));

  const requests = (parsed?.requests ?? []).map((request) => ({
    ...request,
    notes: request.notes ?? "",
    archived: request.archived ?? false,
  }));

  return {
    settings,
    categories: parsed?.categories?.length ? parsed.categories : defaultDatabase.categories,
    products,
    requests,
    testimonials: parsed?.testimonials ?? [],
    faq: parsed?.faq ?? [],
    media: parsed?.media ?? [],
  };
}

function readDatabase(): Database {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDatabase;
    return normalize(JSON.parse(raw) as Partial<Database>);
  } catch {
    return defaultDatabase;
  }
}

/** Swap two neighbouring entries of an ordered list. */
function swap<T>(list: T[], index: number, direction: "up" | "down"): T[] {
  const next = [...list];
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function writeDatabase(db: Database) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full or unavailable — the in-memory state still works */
  }
}

export function newId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

interface StoreValue {
  status: StoreStatus;
  error: string | null;
  reload: () => void;

  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  requests: WholesaleRequest[];

  testimonials: Testimonial[];
  faq: FaqItem[];
  media: MediaAsset[];

  categoryById: (id: string) => Category | undefined;
  productById: (id: string) => Product | undefined;
  productBySlug: (slug: string) => Product | undefined;
  categoryBySlug: (slug: string) => Category | undefined;

  /** Catalogue in the owner's merchandising order. */
  orderedProducts: Product[];
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | undefined;
  moveProduct: (id: string, direction: "up" | "down") => void;

  saveTestimonial: (item: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
  moveTestimonial: (id: string, direction: "up" | "down") => void;

  saveFaq: (item: FaqItem) => void;
  deleteFaq: (id: string) => void;
  moveFaq: (id: string, direction: "up" | "down") => void;

  addMedia: (asset: Omit<MediaAsset, "id" | "createdAt">) => MediaAsset;
  deleteMedia: (id: string) => void;

  toggleHomeSection: (key: HomeSectionKey) => void;
  moveHomeSection: (key: HomeSectionKey, direction: "up" | "down") => void;
  resetHomeSections: () => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, direction: "up" | "down") => void;
  saveSettings: (patch: Partial<SiteSettings>) => void;
  createRequest: (
    input: Omit<
      WholesaleRequest,
      "id" | "status" | "createdAt" | "updatedAt" | "notes" | "archived"
    >,
  ) => WholesaleRequest;
  setRequestStatus: (id: string, status: RequestStatus) => void;
  updateRequest: (
    id: string,
    patch: Partial<Pick<WholesaleRequest, "notes" | "archived" | "status">>,
  ) => void;
  deleteRequest: (id: string) => void;
  resetDatabase: () => void;

  isAdmin: boolean;
  signIn: (password: string) => boolean;
  signOut: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(defaultDatabase);
  const [status, setStatus] = useState<StoreStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const hydrated = useRef(false);

  const hydrate = useCallback(() => {
    setStatus("loading");
    setError(null);
    try {
      setDb(readDatabase());
      setStatus("ready");
    } catch {
      setError("storage");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Microtask defer so the first paint can show real skeleton states.
    const frame = requestAnimationFrame(() => {
      hydrate();
      hydrated.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [hydrate]);

  useEffect(() => {
    try {
      setIsAdmin(window.sessionStorage.getItem(ADMIN_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Persist after hydration so we never overwrite stored data with defaults.
  useEffect(() => {
    if (!hydrated.current || status !== "ready") return;
    writeDatabase(db);
  }, [db, status]);

  // Keep multiple tabs of the dashboard in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setDb(readDatabase());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((mutate: (draft: Database) => Database) => {
    setDb((current) => mutate(current));
  }, []);

  const value = useMemo<StoreValue>(() => {
    const sortedCategories = [...db.categories].sort((a, b) => a.order - b.order);

    return {
      status,
      error,
      reload: hydrate,

      settings: db.settings,
      categories: sortedCategories,
      products: db.products,
      testimonials: [...db.testimonials].sort((a, b) => a.order - b.order),
      faq: [...db.faq].sort((a, b) => a.order - b.order),
      media: [...db.media].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      requests: [...db.requests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),

      orderedProducts: [...db.products].sort((a, b) => a.order - b.order),

      categoryById: (id) => db.categories.find((c) => c.id === id),
      productById: (id) => db.products.find((p) => p.id === id),
      productBySlug: (slug) => db.products.find((p) => p.slug === slug),
      categoryBySlug: (slug) => db.categories.find((c) => c.slug === slug),

      saveProduct: (product) =>
        update((draft) => {
          const exists = draft.products.some((p) => p.id === product.id);
          return {
            ...draft,
            products: exists
              ? draft.products.map((p) => (p.id === product.id ? product : p))
              : [product, ...draft.products],
          };
        }),

      deleteProduct: (id) =>
        update((draft) => ({
          ...draft,
          products: draft.products.filter((p) => p.id !== id),
          settings: {
            ...draft.settings,
            featuredProductIds: draft.settings.featuredProductIds.filter((x) => x !== id),
            newArrivalIds: draft.settings.newArrivalIds.filter((x) => x !== id),
            bestSellerIds: draft.settings.bestSellerIds.filter((x) => x !== id),
          },
        })),

      duplicateProduct: (id) => {
        const source = db.products.find((p) => p.id === id);
        if (!source) return undefined;
        const code = `${source.code}-2`;
        const copy: Product = {
          ...source,
          id: newId("prd"),
          code,
          slug: `${slugify(code)}-${slugify(source.name.primary)}`,
          name: { ...source.name, primary: `${source.name.primary} (copy)` },
          colors: source.colors.map((c, i) => ({ ...c, id: `${id}-copy-c${i}` })),
          images: source.images.map((img) => ({ ...img, id: newId("img") })),
          mainImageId: null,
          order: Math.max(0, ...db.products.map((p) => p.order)) + 1,
          createdAt: new Date().toISOString(),
        };
        copy.mainImageId = copy.images[0]?.id ?? null;
        update((draft) => ({ ...draft, products: [...draft.products, copy] }));
        return copy;
      },

      moveProduct: (id, direction) =>
        update((draft) => {
          const ordered = [...draft.products].sort((a, b) => a.order - b.order);
          const index = ordered.findIndex((p) => p.id === id);
          return {
            ...draft,
            products: swap(ordered, index, direction).map((p, i) => ({ ...p, order: i + 1 })),
          };
        }),

      saveTestimonial: (item) =>
        update((draft) => {
          const exists = draft.testimonials.some((x) => x.id === item.id);
          return {
            ...draft,
            testimonials: exists
              ? draft.testimonials.map((x) => (x.id === item.id ? item : x))
              : [...draft.testimonials, item],
          };
        }),

      deleteTestimonial: (id) =>
        update((draft) => ({
          ...draft,
          testimonials: draft.testimonials.filter((x) => x.id !== id),
        })),

      moveTestimonial: (id, direction) =>
        update((draft) => {
          const ordered = [...draft.testimonials].sort((a, b) => a.order - b.order);
          const index = ordered.findIndex((x) => x.id === id);
          return {
            ...draft,
            testimonials: swap(ordered, index, direction).map((x, i) => ({ ...x, order: i + 1 })),
          };
        }),

      saveFaq: (item) =>
        update((draft) => {
          const exists = draft.faq.some((x) => x.id === item.id);
          return {
            ...draft,
            faq: exists ? draft.faq.map((x) => (x.id === item.id ? item : x)) : [...draft.faq, item],
          };
        }),

      deleteFaq: (id) =>
        update((draft) => ({ ...draft, faq: draft.faq.filter((x) => x.id !== id) })),

      moveFaq: (id, direction) =>
        update((draft) => {
          const ordered = [...draft.faq].sort((a, b) => a.order - b.order);
          const index = ordered.findIndex((x) => x.id === id);
          return {
            ...draft,
            faq: swap(ordered, index, direction).map((x, i) => ({ ...x, order: i + 1 })),
          };
        }),

      addMedia: (asset) => {
        const created: MediaAsset = { ...asset, id: newId("med"), createdAt: new Date().toISOString() };
        update((draft) => ({ ...draft, media: [created, ...draft.media] }));
        return created;
      },

      deleteMedia: (id) =>
        update((draft) => ({ ...draft, media: draft.media.filter((m) => m.id !== id) })),

      toggleHomeSection: (key) =>
        update((draft) => ({
          ...draft,
          settings: {
            ...draft.settings,
            homeSections: draft.settings.homeSections.map((section) =>
              section.key === key ? { ...section, visible: !section.visible } : section,
            ),
          },
        })),

      moveHomeSection: (key, direction) =>
        update((draft) => {
          const list = draft.settings.homeSections;
          const index = list.findIndex((s) => s.key === key);
          return {
            ...draft,
            settings: { ...draft.settings, homeSections: swap(list, index, direction) },
          };
        }),

      resetHomeSections: () =>
        update((draft) => ({
          ...draft,
          settings: { ...draft.settings, homeSections: defaultHomeSections },
        })),

      saveCategory: (category) =>
        update((draft) => {
          const exists = draft.categories.some((c) => c.id === category.id);
          return {
            ...draft,
            categories: exists
              ? draft.categories.map((c) => (c.id === category.id ? category : c))
              : [...draft.categories, category],
          };
        }),

      deleteCategory: (id) =>
        update((draft) => ({
          ...draft,
          categories: draft.categories.filter((c) => c.id !== id),
        })),

      moveCategory: (id, direction) =>
        update((draft) => {
          const ordered = [...draft.categories].sort((a, b) => a.order - b.order);
          const index = ordered.findIndex((c) => c.id === id);
          const target = direction === "up" ? index - 1 : index + 1;
          if (index < 0 || target < 0 || target >= ordered.length) return draft;
          [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
          return {
            ...draft,
            categories: ordered.map((c, i) => ({ ...c, order: i + 1 })),
          };
        }),

      saveSettings: (patch) =>
        update((draft) => ({ ...draft, settings: { ...draft.settings, ...patch } })),

      createRequest: (input) => {
        const now = new Date().toISOString();
        const request: WholesaleRequest = {
          ...input,
          id: newId("req"),
          status: "new",
          createdAt: now,
          updatedAt: now,
          notes: "",
          archived: false,
        };
        update((draft) => ({ ...draft, requests: [request, ...draft.requests] }));
        return request;
      },

      setRequestStatus: (id, next) =>
        update((draft) => ({
          ...draft,
          requests: draft.requests.map((r) =>
            r.id === id ? { ...r, status: next, updatedAt: new Date().toISOString() } : r,
          ),
        })),

      updateRequest: (id, patch) =>
        update((draft) => ({
          ...draft,
          requests: draft.requests.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r,
          ),
        })),

      deleteRequest: (id) =>
        update((draft) => ({ ...draft, requests: draft.requests.filter((r) => r.id !== id) })),

      resetDatabase: () => {
        setDb(defaultDatabase);
        writeDatabase(defaultDatabase);
      },

      isAdmin,
      signIn: (password) => {
        const ok = password === db.settings.adminPassword;
        if (ok) {
          setIsAdmin(true);
          try {
            window.sessionStorage.setItem(ADMIN_KEY, "1");
          } catch {
            /* ignore */
          }
        }
        return ok;
      },
      signOut: () => {
        setIsAdmin(false);
        try {
          window.sessionStorage.removeItem(ADMIN_KEY);
        } catch {
          /* ignore */
        }
      },
    };
  }, [db, status, error, hydrate, update, isAdmin]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
