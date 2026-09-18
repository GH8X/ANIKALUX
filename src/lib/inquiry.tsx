import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { InquiryItem } from "./types";

const STORAGE_KEY = "anika-lux.inquiry.v1";

/**
 * Customer-side wholesale inquiry list.
 *
 * Deliberately separate from the admin database: it belongs to the visitor, not
 * to the shop, so it persists in its own storage slot and survives a reload
 * while the buyer browses the catalogue.
 */
interface InquiryValue {
  items: InquiryItem[];
  count: number;
  totalPieces: number;
  add: (item: Omit<InquiryItem, "quantity"> & { quantity?: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  /** Change colour or size; identical variants merge into one line. */
  updateVariant: (key: string, patch: Pick<InquiryItem, "color" | "size">) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
}

/** Stable identity of one line: same product, colour and size are one line. */
export function inquiryKey(item: Pick<InquiryItem, "productId" | "color" | "size">) {
  return `${item.productId}::${item.color}::${item.size}`;
}

const InquiryContext = createContext<InquiryValue | null>(null);

function readItems(): InquiryItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InquiryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — the list still works for this session */
    }
  }, [items, hydrated]);

  // Keep multiple tabs consistent.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(readItems());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback<InquiryValue["add"]>((item) => {
    const next: InquiryItem = { ...item, quantity: item.quantity ?? 1 };
    setItems((current) => {
      const key = inquiryKey(next);
      const existing = current.find((entry) => inquiryKey(entry) === key);
      if (!existing) return [...current, next];
      return current.map((entry) =>
        inquiryKey(entry) === key
          ? { ...entry, quantity: entry.quantity + next.quantity }
          : entry,
      );
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((entry) =>
        inquiryKey(entry) === key ? { ...entry, quantity: Math.max(1, quantity) } : entry,
      ),
    );
  }, []);

  const updateVariant = useCallback<InquiryValue["updateVariant"]>((key, patch) => {
    setItems((current) => {
      const source = current.find((entry) => inquiryKey(entry) === key);
      if (!source) return current;
      const merged: InquiryItem = { ...source, ...patch };
      const mergedKey = inquiryKey(merged);
      if (mergedKey === key) {
        return current.map((entry) => (inquiryKey(entry) === key ? merged : entry));
      }
      const collision = current.find((entry) => inquiryKey(entry) === mergedKey);
      const withoutSource = current.filter((entry) => inquiryKey(entry) !== key);
      if (!collision) {
        return withoutSource.map((entry) => (inquiryKey(entry) === key ? merged : entry));
      }
      return withoutSource.map((entry) =>
        inquiryKey(entry) === mergedKey
          ? { ...entry, quantity: entry.quantity + merged.quantity }
          : entry,
      );
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((entry) => inquiryKey(entry) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<InquiryValue>(
    () => ({
      items,
      count: items.length,
      totalPieces: items.reduce((sum, item) => sum + item.quantity, 0),
      add,
      setQuantity,
      updateVariant,
      remove,
      clear,
      has: (productId) => items.some((item) => item.productId === productId),
    }),
    [items, add, setQuantity, updateVariant, remove, clear],
  );

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside <InquiryProvider>");
  return ctx;
}

/**
 * Structured WhatsApp message for a wholesale inquiry.
 *
 * One line per article with SKU, colour, size and quantity, followed by the
 * buyer's own note, so the shop can quote without going back and forth.
 */
export function buildInquiryMessage(
  items: InquiryItem[],
  options: {
    heading: string;
    nameLabel: string;
    businessLabel: string;
    phoneLabel: string;
    noteLabel: string;
    totalLabel: string;
    piecesLabel: string;
    colorLabel: string;
    sizeLabel: string;
    quantityLabel: string;
    name?: string;
    business?: string;
    phone?: string;
    note?: string;
  },
) {
  const lines: string[] = [options.heading, ""];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} — ${item.code}`);
    lines.push(
      `   ${options.colorLabel}: ${item.color || "—"} | ${options.sizeLabel}: ${item.size || "—"}`,
    );
    lines.push(`   ${options.quantityLabel}: ${item.quantity}`);
  });

  lines.push("");
  if (options.name) lines.push(`${options.nameLabel}: ${options.name}`);
  if (options.business) lines.push(`${options.businessLabel}: ${options.business}`);
  if (options.phone) lines.push(`${options.phoneLabel}: ${options.phone}`);
  if (options.note) lines.push(`${options.noteLabel}: ${options.note}`);

  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  lines.push(`${options.totalLabel}: ${total} ${options.piecesLabel}`);

  return lines.join("\n");
}
