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
import { defaultDatabase } from "./seed";
import type {
  Category,
  Database,
  Product,
  RequestStatus,
  SiteSettings,
  WholesaleRequest,
} from "./types";

const STORAGE_KEY = "anika-lux.db.v1";
const ADMIN_KEY = "anika-lux.admin";

export type StoreStatus = "loading" | "ready" | "error";

/**
 * Single persistence seam for the whole app. Today it hydrates from local
 * storage; swapping this module for a REST/Convex client is the only change
 * needed to move the catalogue to a server.
 */
function readDatabase(): Database {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDatabase;
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      settings: { ...defaultDatabase.settings, ...(parsed.settings ?? {}) },
      categories: parsed.categories?.length ? parsed.categories : defaultDatabase.categories,
      products: parsed.products ?? defaultDatabase.products,
      requests: parsed.requests ?? [],
    };
  } catch {
    return defaultDatabase;
  }
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

  categoryById: (id: string) => Category | undefined;
  productById: (id: string) => Product | undefined;
  productBySlug: (slug: string) => Product | undefined;
  categoryBySlug: (slug: string) => Category | undefined;

  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, direction: "up" | "down") => void;
  saveSettings: (patch: Partial<SiteSettings>) => void;
  createRequest: (
    input: Omit<WholesaleRequest, "id" | "status" | "createdAt" | "updatedAt">,
  ) => WholesaleRequest;
  setRequestStatus: (id: string, status: RequestStatus) => void;
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
      requests: [...db.requests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),

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
