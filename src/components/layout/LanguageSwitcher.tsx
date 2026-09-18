import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
  className?: string;
}

export function LanguageSwitcher({ variant = "light", className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.lang.label}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors",
          variant === "dark"
            ? "border-cream-200/30 text-cream-100 hover:border-cream-200/60 hover:bg-white/5"
            : "border-border text-foreground/80 hover:border-primary/40 hover:bg-secondary",
        )}
      >
        <Globe className="size-3.5" aria-hidden="true" />
        <span>{active.code.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t.lang.label}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-card"
          >
            {LOCALES.map((option) => {
              const selected = option.code === locale;
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setLocale(option.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-start text-sm transition-colors",
                      selected
                        ? "bg-secondary font-medium text-primary"
                        : "text-foreground/85 hover:bg-secondary/70",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span aria-hidden="true">{option.flag}</span>
                      <span>{option.native}</span>
                    </span>
                    {selected && <Check className="size-3.5 text-primary" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
