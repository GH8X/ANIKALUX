import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Gem,
  Layers,
  LayoutGrid,
  MessagesSquare,
  Quote,
  Sparkles,
  Truck,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/surface";
import { ProductGridSkeleton } from "@/components/States";
import {
  FaqSection,
  LocationSection,
  PromotionSection,
  TestimonialsSection,
} from "@/components/sections/ExtraSections";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Category, HomeSectionKey } from "@/lib/types";
import { cn, whatsappLink } from "@/lib/utils";

/* ------------------------------------------------------------------ Hero */

function HeroVisual() {
  const { settings } = useStore();
  const reduce = useReducedMotion();
  const media = settings.hero.mediaUrl;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-gold-400/25 via-transparent to-wine-700/20 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-gold-500/25 bg-gradient-to-br from-wine-700 via-wine-800 to-wine-950 shadow-luxe">
        <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] lg:aspect-[4/5]">
          {media ? (
            settings.hero.mediaType === "video" ? (
              <video
                src={media}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                aria-label={settings.brand.name}
              />
            ) : (
              <img
                src={media}
                alt={settings.brand.name}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            )
          ) : (
            <>
              {/* Default editorial composition — abstract, no third-party imagery. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, rgba(244,227,193,.35), transparent 45%), radial-gradient(circle at 75% 80%, rgba(196,160,90,.3), transparent 50%)",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(115deg, #F4E3C1 0 1px, transparent 1px 22px)",
                }}
              />
              <motion.div
                aria-hidden="true"
                animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-16 top-1/4 size-72 rounded-full bg-gold-400/20 blur-3xl"
              />
              <motion.div
                aria-hidden="true"
                animate={reduce ? undefined : { scale: [1.05, 1, 1.05], opacity: [0.55, 0.8, 0.55] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-20 bottom-0 size-80 rounded-full bg-cream-200/15 blur-3xl"
              />

              <div className="relative flex h-full flex-col items-center justify-center gap-8 px-6 py-10">
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, scale: 0.92 }}
                  animate={reduce ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-full border border-cream-200/25"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -inset-8 rounded-full border border-cream-200/10"
                  />
                  <Logo size="xl" className="rounded-2xl bg-cream-100/5 p-2 shadow-luxe" />
                </motion.div>

                <div className="text-center">
                  <p className="font-display text-3xl font-semibold tracking-[0.02em] text-cream-100 sm:text-4xl">
                    Al-Aniqa Lux
                  </p>
                  <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.42em] text-gold-400">
                    الأنـيـقـة
                  </p>
                </div>

                <div className="hairline max-w-[10rem]" />
              </div>
            </>
          )}

          {/* Floating specification chips — wholesale signal, always on brand */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2">
              {["ALX · Wholesale", "DZD · DZ", "58 Wilayas"].map((label, index) => (
                <motion.span
                  key={label}
                  initial={reduce ? undefined : { opacity: 0, y: 14 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.12 }}
                  className="rounded-md border border-cream-200/20 bg-wine-950/55 px-2 py-1.5 text-center text-[0.58rem] font-medium uppercase tracking-[0.14em] text-cream-100/85 backdrop-blur-md"
                >
                  {label}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, x: -20, y: 10 }}
        animate={reduce ? undefined : { opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-5 -start-3 hidden max-w-[13rem] rounded-lg border border-border bg-card p-3.5 shadow-card sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-secondary text-primary">
            <Layers className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
              Minimum order
            </p>
            <p className="text-sm font-medium">From 6 pieces</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const { t, tx } = useI18n();
  const { settings } = useStore();
  const reduce = useReducedMotion();

  const stats = [
    { label: t.hero.stats.minimum, value: t.hero.stats.minimumValue },
    { label: t.hero.stats.resupply, value: t.hero.stats.resupplyValue },
    { label: t.hero.stats.delivery, value: t.hero.stats.deliveryValue },
  ];

  const whatsapp = settings.contact.whatsapp
    ? whatsappLink(settings.contact.whatsapp, t.request.whatsappPrefill)
    : "/wholesale";

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_15%_-10%,rgba(110,21,41,0.10),transparent_55%),radial-gradient(80%_60%_at_100%_0%,rgba(196,160,90,0.14),transparent_60%)]"
      />
      <div className="container grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            <span aria-hidden="true" className="h-px w-8 bg-gold-500" />
            {t.hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]"
          >
            {tx(settings.hero.headline, t.hero.shopWholesale)}
          </motion.h1>

          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {tx(settings.hero.subtitle, t.brand.description)}
          </motion.p>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg">
              <Link to="/products">
                {t.hero.shopWholesale}
                <ArrowRight className="rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={whatsapp} target={whatsapp.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {t.hero.contactUs}
              </a>
            </Button>
          </motion.div>

          <motion.dl
            initial={reduce ? undefined : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-border/70 pt-7"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-display text-base font-semibold sm:text-lg">{stat.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 28 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroVisual />
        </motion.div>
      </div>

      <Marquee />
    </section>
  );
}

function Marquee() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const items = t.hero.marquee;

  return (
    <div className="border-y border-border/60 bg-wine-900 py-3.5">
      <div className="relative flex overflow-hidden" aria-hidden={reduce ? "true" : undefined}>
        <div className={cn("flex shrink-0 items-center gap-10 pe-10", !reduce && "animate-marquee")}>
          {[...items, ...items].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-10 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-cream-100/75"
            >
              {item}
              <span className="size-1 rounded-full bg-gold-500" />
            </span>
          ))}
        </div>
        {!reduce && (
          <div className="flex shrink-0 animate-marquee items-center gap-10 pe-10">
            {[...items, ...items].map((item, index) => (
              <span
                key={`dup-${item}-${index}`}
                className="flex shrink-0 items-center gap-10 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-cream-100/75"
              >
                {item}
                <span className="size-1 rounded-full bg-gold-500" />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Category sections */

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const { t, tx } = useI18n();
  const basePath = category.group === "pajamas" ? "/pajamas" : "/clothing";

  return (
    <Reveal delay={index * 0.05}>
      <Link
        to={`${basePath}?category=${category.slug}`}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border/70 bg-card shadow-soft transition-all duration-500 ease-luxe hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-card"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-wine-800 via-wine-700 to-wine-900">
          {category.image ? (
            <img
              src={category.image}
              alt={tx(category.name)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
            />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(70deg, rgba(244,227,193,.5) 0 1px, transparent 1px 16px)",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(196,160,90,.35),transparent_55%)]"
              />
              <span className="absolute bottom-3 end-4 font-display text-5xl font-semibold text-cream-100/15">
                {String(index + 1).padStart(2, "0")}
              </span>
            </>
          )}
          <span className="absolute start-3 top-3">
            <Badge variant="cream" className="bg-cream-100/90 backdrop-blur-sm">
              {category.group === "pajamas" ? t.nav.pajamas : t.nav.clothing}
            </Badge>
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="font-display text-lg font-semibold leading-snug">{tx(category.name)}</h3>
          {tx(category.description) && (
            <p className="line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground">
              {tx(category.description)}
            </p>
          )}
          <span className="mt-3 inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-primary">
            {t.home.explore}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

function CategoriesSection() {
  const { t } = useI18n();
  const { categories, status } = useStore();

  const pajamas = categories.filter((c) => c.group === "pajamas");
  const clothing = categories.filter((c) => c.group === "clothing");

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow={t.home.categoriesEyebrow}
          title={t.home.categoriesTitle}
          subtitle={t.home.categoriesSubtitle}
        />

        {status === "loading" ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <h3 className="font-display text-xl font-semibold">{t.nav.pajamas}</h3>
                <div className="hairline flex-1" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {pajamas.map((category, index) => (
                  <CategoryCard key={category.id} category={category} index={index} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-5 flex items-center gap-4">
                <h3 className="font-display text-xl font-semibold">{t.nav.clothing}</h3>
                <div className="hairline flex-1" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {clothing.map((category, index) => (
                  <CategoryCard key={category.id} category={category} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Product sections */

function ProductSection({
  eyebrow,
  title,
  subtitle,
  productIds,
  filter,
  viewAllTo,
  alt = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  productIds?: string[];
  filter?: (p: { isNew: boolean; isBestSeller: boolean; isFeatured: boolean }) => boolean;
  viewAllTo: string;
  alt?: boolean;
}) {
  const { t } = useI18n();
  const { products, status, productById } = useStore();

  const selected = filter
    ? products.filter((p) => p.active && filter(p))
    : (productIds ?? [])
        .map((id) => productById(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p) && p!.active);

  if (status === "ready" && selected.length === 0) return null;

  return (
    <section className={cn("section", alt && "bg-secondary/40")}>
      <div className="container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          action={
            <Button asChild variant="outline">
              <Link to={viewAllTo}>
                {t.home.viewAll}
                <ArrowRight className="rtl:rotate-180" />
              </Link>
            </Button>
          }
        />

        <div className="mt-10">
          {status === "loading" ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {selected.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Wholesale */

function WhySection() {
  const { t } = useI18n();

  const benefits = [
    { icon: Layers, ...t.why.wholesale },
    { icon: Sparkles, ...t.why.collections },
    { icon: Gem, ...t.why.quality },
    { icon: LayoutGrid, ...t.why.selection },
    { icon: BadgePercent, ...t.why.prices },
    { icon: MessagesSquare, ...t.why.communication },
    { icon: Truck, ...t.why.service },
  ];

  return (
    <section className="section relative overflow-hidden bg-wine-900 text-cream-100">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "repeating-linear-gradient(120deg, #F4E3C1 0 1px, transparent 1px 26px)",
        }}
      />
      <div className="container relative">
        <div className="max-w-3xl">
          <p className="eyebrow text-gold-400">
            <span aria-hidden="true" className="h-px w-6 bg-gold-500" />
            {t.home.whyEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
            {t.home.whyTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-cream-100/70 sm:text-base">
            {t.home.whySubtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-cream-100/12 bg-cream-100/10 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.04} className="h-full">
              <div className="group h-full bg-wine-900 p-6 transition-colors duration-500 hover:bg-wine-800/80">
                <span className="grid size-11 place-items-center rounded-full border border-gold-500/35 bg-cream-100/5 text-gold-400 transition-all duration-500 ease-luxe group-hover:border-gold-400 group-hover:bg-gold-500 group-hover:text-wine-900">
                  <benefit.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-cream-100">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-cream-100/65">
                  {benefit.text}
                </p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={benefits.length * 0.04} className="h-full">
            <div className="flex h-full flex-col justify-between gap-5 bg-gradient-to-br from-gold-500/20 to-wine-800 p-6">
              <Quote className="size-7 text-gold-400" aria-hidden="true" />
              <div>
                <p className="font-display text-lg leading-snug text-cream-100">
                  {t.footer.wholesaleNote}
                </p>
                <Button asChild variant="gold" size="sm" className="mt-5 w-full sm:w-auto">
                  <Link to="/wholesale">{t.home.ctaButton}</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { t, tx } = useI18n();
  const { settings } = useStore();
  const { values } = t.about;

  const valueList = [values.craft, values.trust, values.care, values.style];

  return (
    <section className="section">
      <div className="container grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow">
            <span aria-hidden="true" className="h-px w-6 bg-gold-500/70" />
            {t.home.aboutEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] sm:text-4xl">
            {t.home.aboutTitle}
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            {tx(settings.brand.about, t.brand.description)}
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            {t.about.partnersText}
          </p>
          <Button asChild variant="secondary" className="mt-8">
            <Link to="/about">
              {t.home.aboutMore}
              <ArrowRight className="rtl:rotate-180" />
            </Link>
          </Button>

          <dl className="mt-10 grid grid-cols-2 gap-4">
            {valueList.map((value) => (
              <div key={value.title} className="rounded-md border border-border/70 bg-card p-4">
                <dt className="font-display text-base font-semibold">{value.title}</dt>
                <dd className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">
                  {value.text}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-gold-500/20 bg-gradient-to-br from-wine-700 via-wine-800 to-wine-950 p-8 shadow-luxe sm:p-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, #F4E3C1 0 1px, transparent 1px 20px)",
              }}
            />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <Logo size="lg" className="rounded-md bg-cream-100/5 p-1.5" />
              <div>
                <p className="font-display text-2xl font-semibold leading-snug text-cream-100 sm:text-3xl">
                  {t.brand.tagline}
                </p>
                <div className="hairline my-6" />
                <p className="text-sm leading-relaxed text-cream-100/70">{t.about.subtitle}</p>
              </div>
              <Button asChild variant="cream">
                <Link to="/contact">{t.nav.contact}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CtaSection() {
  const { t } = useI18n();
  const { settings } = useStore();

  const whatsapp = settings.contact.whatsapp
    ? whatsappLink(settings.contact.whatsapp, t.request.whatsappPrefill)
    : "/wholesale";

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <Card className="relative overflow-hidden border-gold-500/25 bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 px-6 py-12 text-center shadow-card sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(60deg, #6E1529 0 1px, transparent 1px 24px)",
              }}
            />
            <div className="relative mx-auto max-w-2xl">
              <Logo size="lg" className="mx-auto" />
              <h2 className="mt-6 font-display text-3xl font-semibold leading-[1.1] text-wine-900 sm:text-4xl">
                {t.home.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-wine-900/70">
                {t.home.ctaSubtitle}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/wholesale">{t.home.ctaButton}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-wine-900/25 bg-white/60 hover:border-wine-900/50"
                >
                  <a
                    href={whatsapp}
                    target={whatsapp.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    {t.home.ctaSecondary}
                  </a>
                </Button>
              </div>
              <p className="mt-6 text-xs text-wine-900/55">{t.request.privacy}</p>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Section renderer */

/**
 * Renders one homepage section by key.
 *
 * The owner controls order and visibility from Admin → Homepage; this is the
 * only place that has to know how a key maps to a component.
 */
function SectionByKey({ sectionKey }: { sectionKey: HomeSectionKey }) {
  const { t } = useI18n();
  const { settings } = useStore();

  switch (sectionKey) {
    case "hero":
      return <Hero />;
    case "categories":
      return <CategoriesSection />;
    case "promotion":
      return <PromotionSection />;
    case "newArrivals":
      return (
        <ProductSection
          eyebrow={t.home.newEyebrow}
          title={t.home.newTitle}
          subtitle={t.home.newSubtitle}
          filter={(p) => p.isNew}
          viewAllTo="/new-arrivals"
        />
      );
    case "bestSellers":
      return (
        <ProductSection
          eyebrow={t.home.bestEyebrow}
          title={t.home.bestTitle}
          subtitle={t.home.bestSubtitle}
          filter={(p) => p.isBestSeller}
          viewAllTo="/products?sort=best"
          alt
        />
      );
    case "featured":
      return (
        <ProductSection
          eyebrow={t.home.featuredEyebrow}
          title={t.home.featuredTitle}
          subtitle={t.home.featuredSubtitle}
          productIds={settings.featuredProductIds}
          viewAllTo="/products"
        />
      );
    case "why":
      return <WhySection />;
    case "testimonials":
      return <TestimonialsSection />;
    case "faq":
      return <FaqSection />;
    case "about":
      return <AboutSection />;
    case "location":
      return <LocationSection />;
    case "cta":
      return <CtaSection />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ Page */

export function Home() {
  const { t, tx } = useI18n();
  const { settings, status, products } = useStore();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${settings.brand.name} — Wholesale catalogue`,
    itemListElement: products
      .filter((p) => p.active)
      .slice(0, 12)
      .map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name.primary,
        url: `${window.location.origin}/product/${product.slug}`,
      })),
  };

  return (
    <>
      <Seo
        title={settings.seo.title || "Al-Aniqa Lux | Wholesale Clothing & Luxury Pajamas"}
        description={tx(settings.seo.description, t.brand.description)}
        keywords={settings.seo.keywords || undefined}
        jsonLd={itemListLd}
      />

      {settings.homeSections.map((section) =>
        section.visible ? <SectionByKey key={section.key} sectionKey={section.key} /> : null,
      )}

      {status === "loading" && (
        <div className="container pb-16">
          <ProductGridSkeleton count={4} />
        </div>
      )}
    </>
  );
}
