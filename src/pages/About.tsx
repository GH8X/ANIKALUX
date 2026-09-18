import { Link } from "react-router-dom";
import { ArrowRight, Gem, HeartHandshake, LayoutGrid, Sparkles } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function About() {
  const { t, tx } = useI18n();
  const { settings } = useStore();
  const { values } = t.about;

  const valueList = [
    { icon: Gem, ...values.craft },
    { icon: HeartHandshake, ...values.trust },
    { icon: Sparkles, ...values.care },
    { icon: LayoutGrid, ...values.style },
  ];

  return (
    <>
      <Seo
        title={`${t.about.title} | ${settings.brand.name}`}
        description={tx(settings.brand.about, t.brand.description).slice(0, 158)}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: t.about.title,
          about: {
            "@type": "Organization",
            name: settings.brand.name,
            description: tx(settings.brand.about, t.brand.description),
          },
        }}
      />

      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_10%_0%,rgba(110,21,41,0.10),transparent_55%),radial-gradient(70%_60%_at_100%_0%,rgba(196,160,90,0.16),transparent_60%)]"
        />
        <div className="container grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow">
              <span aria-hidden="true" className="h-px w-8 bg-gold-500" />
              {t.about.subtitle}
            </p>
            <h1 className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
              {t.about.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {tx(settings.brand.about, t.brand.description)}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t.about.partnersText}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/wholesale">
                  {t.home.ctaButton}
                  <ArrowRight className="rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/products">{t.nav.products}</Link>
              </Button>
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-[1.5rem] border border-gold-500/25 bg-gradient-to-br from-wine-700 via-wine-800 to-wine-950 p-10 text-center shadow-luxe">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(115deg, #F4E3C1 0 1px, transparent 1px 20px)",
                }}
              />
              <div className="relative flex flex-col items-center gap-6">
                <Logo size="xl" className="rounded-2xl bg-cream-100/5 p-2" />
                <div className="hairline max-w-[8rem]" />
                <p className="font-display text-2xl font-semibold text-cream-100">
                  {settings.brand.name}
                </p>
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.34em] text-gold-400">
                  {tx(settings.brand.tagline, t.brand.tagline)}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow={t.home.aboutEyebrow}
            title={t.about.storyTitle}
            subtitle={t.brand.description}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                {tx(settings.brand.about, t.brand.description)}
              </p>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
                {t.about.partnersText}
              </p>
              <p className="mt-8 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-gold-600">
                {t.footer.wholesaleNote}
              </p>
            </Card>

            <Card className="flex flex-col justify-between gap-6 bg-wine-900 p-6 text-cream-100">
              <div>
                <h3 className="font-display text-xl font-semibold">{t.about.partnersTitle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-100/70">
                  {t.about.partnersText}
                </p>
              </div>
              <Button asChild variant="gold" className="w-full">
                <Link to="/contact">{t.nav.contact}</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="section bg-secondary/40">
        <div className="container">
          <SectionHeading
            eyebrow={t.about.valuesTitle}
            title={t.home.aboutTitle}
            subtitle={t.home.whySubtitle}
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {valueList.map((value, index) => (
              <Reveal key={value.title} delay={index * 0.06}>
                <Card className="luxe-card h-full p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-secondary text-primary">
                    <value.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
                    {value.text}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
