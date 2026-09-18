import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

/**
 * Slim brand bar above the header. Rendered only when the owner enables it and
 * writes copy, so an unconfigured site looks exactly as before.
 */
export function AnnouncementBar() {
  const { t, tx } = useI18n();
  const { settings } = useStore();
  const [dismissed, setDismissed] = useState(false);

  const announcement = settings.announcement;
  const text = tx(announcement.text);
  if (!announcement.enabled || !text || dismissed) return null;

  const external = announcement.href.startsWith("http");
  const inner = (
    <>
      <span className="truncate">{text}</span>
      {announcement.href && (
        <ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
      )}
    </>
  );

  return (
    <div className="relative bg-wine-950 text-cream-100">
      <div className="container flex items-center justify-center gap-3 py-2.5 pe-9 text-center text-[0.72rem] font-medium tracking-wide sm:text-[0.78rem]">
        {announcement.href ? (
          external ? (
            <a
              href={announcement.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-2 transition-colors hover:text-gold-300"
            >
              {inner}
            </a>
          ) : (
            <Link
              to={announcement.href}
              className="flex min-w-0 items-center gap-2 transition-colors hover:text-gold-300"
            >
              {inner}
            </Link>
          )
        ) : (
          <span className="flex min-w-0 items-center gap-2">{inner}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t.nav.closeMenu}
        className="absolute end-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-cream-100/70 transition-colors hover:bg-white/10 hover:text-cream-100"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
