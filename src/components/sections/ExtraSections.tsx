import { useMemo } from "react";
import {
  Clock,
  MapPin,
  MessageCircle,
  Quote,
  Sparkles,
  Star,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Badge, Card } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn, whatsappLink } from "@/lib/utils";

/* ----------------------------------------------------------- Promo banner */

export function PromotionSection() {
  const { t, tx } = useI18n();
  const { settings } = useStore();
  const promo = settings.promotion;

  if (!promo.enabled) return null;

  const ctaLabel = tx(promo.ctaLabel);
  const external = promo.ctaHref.startsWith("http");

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-gold-500/30 bg-gradient-to-br from-wine-800 via-wine-700 to-wine-950 shadow-luxe">
            {promo.mediaUrl && (
              <img
                src={promo.mediaUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, #F4E3C1 0 1px, transparent 1px 24px)",
              }}
            />
            <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                {tx(promo.badge) && (
                  <Badge variant="gold" className="mb-4">
                    <Sparkles className="size-3" aria-hidden="true" />
                    {tx(promo.badge)}
                  </Badge>
                )}
                <h2 className="font-display text-3xl font-semibold leading-[1.1] text-cream-100 sm:text-4xl">
                  {tx(promo.title)}
                </h2>
                <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-cream-100/75">
                  {tx(promo.text)}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                <Button asChild variant="gold" size="lg">
                  {external ? (
                    <a href={promo.ctaHref} target="_blank" rel="noopener noreferrer">
                      {ctaLabel}
                      <ExternalLink />
                    </a>
                  ) : (
                    <a href={promo.ctaHref}>{ctaLabel}</a>
                  )}
                </Button>
                {settings.contact.whatsapp && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-cream-100/30 text-cream-100 hover:border-gold-400 hover:bg-white/10"
                  >
                    <a
                      href={whatsappLink(settings.contact.whatsapp, t.request.whatsappPrefill)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle />
                      {t.request.whatsapp}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Testimonials */

export function TestimonialsSection() {
  const { t, tx } = useI18n();
  const { testimonials, status } = useStore();

  const active = useMemo(() => testimonials.filter((item) => item.active), [testimonials]);

  // Nothing invented: an empty list hides the section entirely.
  if (status !== "ready" || active.length === 0) return null;

  return (
    <section className="section bg-secondary/40">
      <div className="container">
        <SectionHeading
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          subtitle={t.testimonials.subtitle}
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {active.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.05} className="h-full">
              <Card className="flex h-full flex-col gap-5 p-6">
                <Quote className="size-6 text-gold-500" aria-hidden="true" />
                <p className="flex-1 font-display text-lg leading-snug">“{tx(item.quote)}”</p>
                <div className="flex items-center gap-1" aria-label={`${item.rating}/5`}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      aria-hidden="true"
                      className={cn(
                        "size-3.5",
                        starIndex < item.rating
                          ? "fill-gold-500 text-gold-500"
                          : "text-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>
                <div className="border-t border-border/60 pt-4">
                  <p className="text-sm font-medium">{item.author}</p>
                  <p className="text-[0.78rem] text-muted-foreground">
                    {[item.businessName, item.wilaya].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- FAQ */

export function FaqSection() {
  const { t, tx } = useI18n();
  const { faq, status } = useStore();

  const active = useMemo(() => faq.filter((item) => item.active), [faq]);

  const faqLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: active.map((item) => ({
        "@type": "Question",
        name: tx(item.question),
        acceptedAnswer: { "@type": "Answer", text: tx(item.answer) },
      })),
    }),
    [active, tx],
  );

  if (status !== "ready" || active.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow={t.faq.eyebrow}
          title={t.faq.title}
          subtitle={t.faq.subtitle}
        />

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-border/70 overflow-hidden rounded-lg border border-border/70 bg-card">
          {active.map((item) => (
            <details key={item.id} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-base font-semibold transition-colors hover:text-primary sm:px-6 sm:text-lg">
                {tx(item.question)}
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-gold-600 transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 text-[0.88rem] leading-relaxed text-muted-foreground sm:px-6">
                {tx(item.answer)}
              </p>
            </details>
          ))}
        </div>

        <script
          type="application/ld+json"
          // Structured data for rich results; derived from the owner's own answers.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Location */

export function LocationSection() {
  const { t, tx } = useI18n();
  const { settings } = useStore();

  const address = settings.contact.address;
  const mapsUrl = settings.location.mapsUrl;
  const lat = settings.location.lat.trim();
  const lng = settings.location.lng.trim();
  const hours = tx(settings.location.hours);

  const addressText = tx(address);
  const hasCoordinates = lat !== "" && lng !== "";
  const mapQuery = hasCoordinates ? `${lat},${lng}` : addressText;
  // Only rendered when the owner has published a location.
  const canShowMap = mapQuery.trim().length > 0;

  if (!canShowMap && !mapsUrl) return null;

  const directionsHref = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow={t.location.eyebrow}
          title={t.location.title}
          subtitle={t.location.subtitle}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="h-full">
            <Card className="flex h-full flex-col gap-6 p-6 sm:p-7">
              {addressText && (
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <MapPin className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.contact.address}
                    </p>
                    <p className="mt-1 text-[0.92rem] leading-relaxed">{addressText}</p>
                  </div>
                </div>
              )}

              {hours && (
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <Clock className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.location.hours}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[0.92rem] leading-relaxed">{hours}</p>
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild>
                  <a href={directionsHref} target="_blank" rel="noopener noreferrer">
                    <MapPin />
                    {t.location.openInMaps}
                  </a>
                </Button>
                {settings.contact.whatsapp && (
                  <Button asChild variant="outline">
                    <a
                      href={whatsappLink(settings.contact.whatsapp, t.request.whatsappPrefill)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle />
                      {t.request.whatsapp}
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          </Reveal>

          {canShowMap && (
            <Reveal delay={0.1} className="h-full">
              <div className="h-full overflow-hidden rounded-lg border border-border/70 bg-muted shadow-soft">
                <iframe
                  title={t.location.mapTitle}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[280px] w-full border-0 sm:min-h-[360px]"
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
