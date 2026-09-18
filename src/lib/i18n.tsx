import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries } from "./dictionary";
import { LOCALES, type I18nText, type Locale } from "./types";

const STORAGE_KEY = "anika-lux.locale";

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  /** The active dictionary — access copy as `t.hero.headline`. */
  t: (typeof dictionaries)["en"];
  /** Resolve admin-editable text for the active locale. */
  tx: (text: I18nText | undefined | null, fallback?: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.some((l) => l.code === stored)) return stored;
    const nav = window.navigator.language.toLowerCase();
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("fr")) return "fr";
  } catch {
    /* storage unavailable — fall through to default */
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [locale, dir]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const tx = useCallback(
    (text: I18nText | undefined | null, fallback = "") => {
      if (!text) return fallback;
      const localized = text[locale];
      if (localized && localized.trim().length > 0) return localized;
      if (text.primary && text.primary.trim().length > 0) return text.primary;
      return fallback;
    },
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir,
      isRTL: dir === "rtl",
      setLocale,
      t: dictionaries[locale],
      tx,
    }),
    [locale, dir, setLocale, tx],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Simple `{token}` interpolation for dictionary strings with placeholders. */
export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
