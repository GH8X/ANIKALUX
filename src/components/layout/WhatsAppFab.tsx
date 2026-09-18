import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppFab() {
  const { t } = useI18n();
  const { settings } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasNumber = Boolean(settings.contact.whatsapp);
  const href = hasNumber
    ? whatsappLink(settings.contact.whatsapp, t.request.whatsappPrefill)
    : "/wholesale";

  const inner = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-wine-900 text-cream-100 transition-colors group-hover:bg-wine-800 sm:size-12">
        <MessageCircle className="size-5" aria-hidden="true" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-primary-foreground transition-all duration-500 ease-luxe group-hover:max-w-[12rem] group-hover:pe-1">
        {t.request.whatsapp}
      </span>
    </>
  );

  const className =
    "group inline-flex items-center gap-0 rounded-full border border-gold-400/40 bg-primary p-1 shadow-luxe transition-all duration-500 ease-luxe hover:border-gold-400/80 hover:shadow-card";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 end-4 z-40 sm:bottom-7 sm:end-6"
        >
          {hasNumber ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.request.whatsapp}
              className={className}
            >
              {inner}
            </a>
          ) : (
            <Link to={href} aria-label={t.request.whatsapp} className={className}>
              {inner}
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
