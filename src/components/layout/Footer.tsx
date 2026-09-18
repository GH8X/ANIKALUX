import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { SocialLinks } from "@/components/brand/SocialLinks";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function Footer() {
  const { t, tx } = useI18n();
  const { settings, categories } = useStore();
  const year = new Date().getFullYear();
  const c = settings.contact;

  const navLinks = [
    { to: "/products", label: t.nav.products },
    { to: "/new-arrivals", label: t.nav.newArrivals },
    { to: "/about", label: t.nav.about },
    { to: "/contact", label: t.nav.contact },
    { to: "/wholesale", label: t.nav.wholesaleRequest },
  ];

  const pajamas = categories.filter((cat) => cat.group === "pajamas");
  const clothing = categories.filter((cat) => cat.group === "clothing");

  const allRows: ({ label: string; value: string; href: string } | null)[] = [
    c.phone
      ? { label: t.contact.phone, value: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, "")}` }
      : null,
    c.whatsapp
      ? {
          label: t.contact.whatsapp,
          value: c.whatsapp,
          href: `https://wa.me/${c.whatsapp.replace(/[^\d]/g, "")}`,
        }
      : null,
    c.email ? { label: t.contact.email, value: c.email, href: `mailto:${c.email}` } : null,
    tx(c.address) ? { label: t.contact.address, value: tx(c.address), href: "" } : null,
  ];

  const contactRows = allRows.filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <footer className="mt-auto bg-wine-900 text-cream-100">
      <div className="container py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3" aria-label={settings.brand.name}>
              <Logo size="lg" className="rounded-md bg-cream-100/5 p-1" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-100/70">
              {tx(settings.brand.about, t.brand.description)}
            </p>
            <p className="mt-4 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-gold-400">
              {t.footer.wholesaleNote}
            </p>
            <SocialLinks variant="dark" className="mt-6" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
            <nav aria-label={t.footer.quickLinks}>
              <h2 className="font-display text-base font-semibold text-cream-100">
                {t.footer.quickLinks}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-cream-100/70 transition-colors hover:text-gold-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label={t.footer.categories}>
              <h2 className="font-display text-base font-semibold text-cream-100">
                {t.footer.categories}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {pajamas.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/pajamas?category=${cat.slug}`}
                      className="text-sm text-cream-100/70 transition-colors hover:text-gold-400"
                    >
                      {tx(cat.name)}
                    </Link>
                  </li>
                ))}
                {clothing.slice(0, 3).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/clothing?category=${cat.slug}`}
                      className="text-sm text-cream-100/70 transition-colors hover:text-gold-400"
                    >
                      {tx(cat.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="col-span-2 sm:col-span-1">
              <h2 className="font-display text-base font-semibold text-cream-100">
                {t.footer.contact}
              </h2>
              {contactRows.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {contactRows.map((row) => (
                    <li key={row.label} className="text-sm">
                      <span className="block text-[0.66rem] uppercase tracking-[0.16em] text-cream-100/45">
                        {row.label}
                      </span>
                      {row.href ? (
                        <a
                          href={row.href}
                          target={row.href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="text-cream-100/80 transition-colors hover:text-gold-400"
                          dir="ltr"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <span className="text-cream-100/80">{row.value}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-cream-100/50">{t.contact.notSet}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-center text-xs text-cream-100/55 sm:text-start">
            © {year} {settings.brand.name}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/auth"
              className="text-xs text-cream-100/45 transition-colors hover:text-gold-400"
            >
              {t.nav.admin}
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 text-xs text-cream-100/55 transition-colors hover:text-gold-400"
            >
              <ArrowUp className="size-3.5" aria-hidden="true" />
              {t.footer.backToTop}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
