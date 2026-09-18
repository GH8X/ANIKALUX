import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Facebook, Instagram, MapPin, Mail, MessageCircle, Music2, Phone, ShoppingBag } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { mailLink, telLink, whatsappLink } from "@/lib/utils";

interface Channel {
  key: string;
  label: string;
  value: string;
  href?: string;
  icon: LucideIcon;
  external?: boolean;
}

export function Contact() {
  const { t, tx } = useI18n();
  const { settings } = useStore();
  const c = settings.contact;

  const allChannels: (Channel | null)[] = [
    c.whatsapp
      ? {
          key: "whatsapp",
          label: t.contact.whatsapp,
          value: c.whatsapp,
          href: whatsappLink(c.whatsapp, t.request.whatsappPrefill),
          icon: MessageCircle,
          external: true,
        }
      : null,
    c.phone
      ? { key: "phone", label: t.contact.phone, value: c.phone, href: telLink(c.phone), icon: Phone }
      : null,
    c.email
      ? { key: "email", label: t.contact.email, value: c.email, href: mailLink(c.email), icon: Mail }
      : null,
    c.instagram
      ? {
          key: "instagram",
          label: t.contact.instagram,
          value: c.instagram,
          href: c.instagram,
          icon: Instagram,
          external: true,
        }
      : null,
    c.facebook
      ? {
          key: "facebook",
          label: t.contact.facebook,
          value: c.facebook,
          href: c.facebook,
          icon: Facebook,
          external: true,
        }
      : null,
    c.tiktok
      ? {
          key: "tiktok",
          label: t.contact.tiktok,
          value: c.tiktok,
          href: c.tiktok,
          icon: Music2,
          external: true,
        }
      : null,
  ];

  const channels = allChannels.filter((channel): channel is Channel => channel !== null);

  const address = tx(c.address);

  const contactLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brand.name,
    description: tx(settings.brand.about, t.brand.description),
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(address ? { address: { "@type": "PostalAddress", addressCountry: "DZ", streetAddress: address } } : {}),
    sameAs: [c.instagram, c.facebook, c.tiktok].filter(Boolean),
  };

  return (
    <>
      <Seo
        title={`${t.contact.title} | ${settings.brand.name}`}
        description={t.contact.subtitle}
        jsonLd={contactLd}
      />

      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container py-14 sm:py-16">
          <SectionHeading eyebrow={t.contact.channels} title={t.contact.title} subtitle={t.contact.subtitle} />
        </div>
      </section>

      <div className="container section grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold">{t.contact.reachUs}</h2>

          {channels.length > 0 ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {channels.map((channel, index) => {
                const content = (
                  <Card className="luxe-card flex h-full items-start gap-4 p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                      <channel.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.66rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {channel.label}
                      </span>
                      <span
                        className="mt-1 block truncate text-[0.9rem] font-medium"
                        dir={channel.key === "email" || channel.key.startsWith("phone") ? "ltr" : undefined}
                      >
                        {channel.value}
                      </span>
                    </span>
                  </Card>
                );

                return (
                  <li key={channel.key}>
                    <Reveal delay={index * 0.05} className="h-full">
                      {channel.href ? (
                        <a
                          href={channel.href}
                          target={channel.external ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="block h-full"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Card className="mt-6 p-8 text-center">
              <p className="text-sm text-muted-foreground">{t.contact.notSet}</p>
              <p className="mt-2 text-xs text-muted-foreground/80">{t.contact.adminHint}</p>
            </Card>
          )}

          {address && (
            <Card className="mt-6 flex items-start gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <MapPin className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {t.contact.headquarters}
                </p>
                <p className="mt-1 text-[0.9rem]">{address}</p>
              </div>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal delay={0.1}>
            <Card className="overflow-hidden border-gold-500/25 bg-gradient-to-br from-wine-700 via-wine-800 to-wine-950 p-7 text-cream-100 shadow-luxe">
              <span className="grid size-12 place-items-center rounded-full border border-gold-500/35 bg-cream-100/5 text-gold-400">
                <ShoppingBag className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold leading-snug">
                {t.home.ctaTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cream-100/70">{t.home.ctaSubtitle}</p>
              <Button asChild variant="gold" size="lg" className="mt-6 w-full">
                <Link to="/wholesale">{t.home.ctaButton}</Link>
              </Button>
              <p className="mt-4 text-xs text-cream-100/55">{t.request.responseTime}</p>
            </Card>
          </Reveal>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{t.contact.adminHint}</p>
        </aside>
      </div>
    </>
  );
}
