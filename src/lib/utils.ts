import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a WhatsApp deep link from a stored (possibly formatted) number. */
export function whatsappLink(raw: string, message?: string) {
  const digits = (raw || "").replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink(raw: string) {
  return `tel:${(raw || "").replace(/[^\d+]/g, "")}`;
}

export function mailLink(raw: string) {
  return `mailto:${raw || ""}`;
}

/** SEO-friendly slug from any product/category name. */
export function slugify(value: string) {
  return (value || "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatPrice(price: number | null, currency: string, fallback: string) {
  if (price === null || Number.isNaN(price)) return fallback;
  return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(price)} ${currency}`;
}

/**
 * Deterministic placeholder tone used until a real product photo is uploaded.
 * Every variant stays inside the logo's wine/cream family and pairs with a
 * legible text colour.
 */
export function placeholderTone(seed: string): { gradient: string; text: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  const tones = [
    { gradient: "from-wine-800 via-wine-700 to-wine-900", text: "text-cream-200" },
    { gradient: "from-cream-200 via-cream-300 to-cream-200", text: "text-wine-800" },
    { gradient: "from-wine-700 via-wine-600 to-wine-800", text: "text-cream-200" },
    { gradient: "from-cream-300 via-cream-200 to-cream-400", text: "text-wine-900" },
    { gradient: "from-wine-900 via-wine-800 to-wine-950", text: "text-cream-200" },
  ];
  return tones[hash % tones.length];
}
