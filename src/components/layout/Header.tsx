import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Logo, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn, whatsappLink } from "@/lib/utils";

export function Header() {
  const { t, isRTL } = useI18n();
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { to: "/", label: t.nav.home, end: true },
    { to: "/products", label: t.nav.products },
    { to: "/pajamas", label: t.nav.pajamas },
    { to: "/clothing", label: t.nav.clothing },
    { to: "/new-arrivals", label: t.nav.newArrivals },
    { to: "/about", label: t.nav.about },
    { to: "/contact", label: t.nav.contact },
  ];

  const whatsapp = settings.contact.whatsapp
    ? whatsappLink(settings.contact.whatsapp, t.request.whatsappPrefill)
    : "/wholesale";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        {t.nav.home}
      </a>

      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-all duration-500 ease-luxe",
          scrolled
            ? "border-border/80 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
            : "border-transparent bg-background/60 backdrop-blur-sm",
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={settings.brand.name}>
            <Logo size="md" className="shrink-0" />
            <Wordmark />
          </Link>

          <nav aria-label={t.nav.menu} className="hidden items-center gap-1 xl:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-full px-3.5 py-2 text-[0.82rem] font-medium tracking-wide transition-colors duration-300",
                    isActive
                      ? "text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-secondary/70",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent"
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:block" />
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link to="/wholesale">{t.nav.wholesaleRequest}</Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.openMenu}
              className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-primary/40 hover:bg-secondary xl:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={cn("hairline transition-opacity duration-500", scrolled ? "opacity-100" : "opacity-0")} />
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-wine-950/55 backdrop-blur-sm xl:hidden"
            />
            <motion.aside
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 90) setOpen(false);
              }}
              className="fixed inset-y-0 end-0 z-50 flex w-[86%] max-w-sm flex-col bg-background shadow-luxe xl:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.menu}
            >
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Logo size="sm" />
                  <Wordmark compact />
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t.nav.closeMenu}
                  className="grid size-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label={t.nav.menu} className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
                {links.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.045, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between rounded-md px-4 py-3.5 font-display text-lg transition-colors",
                          isActive
                            ? "bg-secondary text-primary"
                            : "text-foreground/85 hover:bg-secondary/60",
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-3 border-t border-border/70 px-5 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t.lang.label}
                  </span>
                  <LanguageSwitcher />
                </div>
                <Button asChild size="lg" className="w-full">
                  <Link to="/wholesale">{t.nav.wholesaleRequest}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> {t.request.whatsapp}
                  </a>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
