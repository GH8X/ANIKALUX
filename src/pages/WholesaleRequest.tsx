import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, MessageCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";
import { Card, Separator } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { WILAYAS, wilayaLabel } from "@/lib/wilayas";
import { whatsappLink } from "@/lib/utils";

interface FormState {
  fullName: string;
  businessName: string;
  phone: string;
  wilaya: string;
  products: string;
  quantity: string;
  message: string;
}

const EMPTY: FormState = {
  fullName: "",
  businessName: "",
  phone: "",
  wilaya: "",
  products: "",
  quantity: "",
  message: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

export function WholesaleRequest() {
  const { t, tx, locale } = useI18n();
  const { settings, createRequest, productById } = useStore();
  const [params] = useSearchParams();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  const productParam = params.get("product") ?? "";
  const productIdParam = params.get("id") ?? "";

  // Prefill from a product card / detail page deep link.
  useEffect(() => {
    const prefill = productParam || (productIdParam ? productById(productIdParam)?.code : "");
    if (!prefill) return;
    setForm((current) => ({
      ...current,
      products: current.products ? current.products : prefill,
    }));
  }, [productParam, productIdParam, productById]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.fullName.trim()) next.fullName = t.request.required;
    if (!form.businessName.trim()) next.businessName = t.request.required;
    if (!form.phone.trim()) next.phone = t.request.required;
    else if (form.phone.replace(/[^\d]/g, "").length < 9) next.phone = t.request.invalidPhone;
    if (!form.wilaya) next.wilaya = t.request.required;
    if (!form.products.trim()) next.products = t.request.required;
    if (!form.quantity.trim()) next.quantity = t.request.required;
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error(t.toast.formError);
      const firstKey = Object.keys(nextErrors)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }

    setSubmitting(true);
    // Simulated round-trip keeps the loading state honest and swappable for a real API.
    window.setTimeout(() => {
      const snapshot: FormState = { ...form };
      createRequest({
        fullName: snapshot.fullName,
        businessName: snapshot.businessName,
        phone: snapshot.phone,
        wilaya: snapshot.wilaya,
        products: snapshot.products,
        quantity: snapshot.quantity,
        message: snapshot.message,
      });
      setSubmitting(false);
      setSubmitted(snapshot);
      setForm(EMPTY);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(t.toast.requestSent, { description: t.toast.requestSentText });
    }, 700);
  };

  const wilayaOptions = useMemo(
    () => WILAYAS.map((w) => ({ value: `${w.code} - ${w.en}`, label: wilayaLabel(w, locale) })),
    [locale],
  );

  const whatsapp = settings.contact.whatsapp
    ? whatsappLink(settings.contact.whatsapp, t.request.whatsappPrefill)
    : null;

  if (submitted) {
    return (
      <>
        <Seo
          title={`${t.request.successTitle} | ${settings.brand.name}`}
          description={t.request.successText}
          noindex
        />
        <div className="container section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-2xl"
          >
            <Card className="overflow-hidden border-gold-500/30 shadow-card">
              <div className="relative bg-gradient-to-br from-wine-700 via-wine-800 to-wine-950 px-6 py-10 text-center text-cream-100">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(115deg, #F4E3C1 0 1px, transparent 1px 20px)",
                  }}
                />
                <span className="relative mx-auto grid size-16 place-items-center rounded-full border border-gold-500/40 bg-cream-100/5 text-gold-400">
                  <BadgeCheck className="size-8" aria-hidden="true" />
                </span>
                <h1 className="relative mt-5 font-display text-3xl font-semibold">
                  {t.request.successTitle}
                </h1>
                <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream-100/75">
                  {t.request.successText}
                </p>
              </div>

              <div className="p-6">
                <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {t.request.sectionOrder}
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    { label: t.request.fullName, value: submitted.fullName },
                    { label: t.request.businessName, value: submitted.businessName },
                    { label: t.request.phone, value: submitted.phone },
                    { label: t.request.wilaya, value: submitted.wilaya },
                    { label: t.request.products, value: submitted.products },
                    { label: t.request.quantity, value: submitted.quantity },
                    ...(submitted.message
                      ? [{ label: t.request.message, value: submitted.message }]
                      : []),
                  ].map((row) => (
                    <div key={row.label} className="flex flex-wrap justify-between gap-2 border-b border-border/60 pb-2.5 last:border-0">
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className="max-w-[60%] text-end font-medium">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <Separator className="my-6" />

                <div className="flex flex-col gap-3 sm:flex-row">
                  {whatsapp && (
                    <Button asChild variant="gold" size="lg" className="flex-1">
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                        <MessageCircle /> {t.request.whatsapp}
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setSubmitted(null)}>
                    {t.request.successAgain}
                  </Button>
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">{t.request.responseTime}</p>
              </div>
            </Card>

            <div className="mt-8 text-center">
              <Button asChild variant="link">
                <Link to="/products">{t.products.backToCatalogue}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${t.request.title} | ${settings.brand.name}`}
        description={t.request.subtitle}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: t.request.title,
          description: t.request.subtitle,
        }}
      />

      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container py-14 sm:py-16">
          <SectionHeading eyebrow={t.nav.wholesaleRequest} title={t.request.title} subtitle={t.request.subtitle} />
        </div>
      </section>

      <div className="container section grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-9">
            <fieldset className="space-y-5">
              <legend className="mb-2 font-display text-xl font-semibold">
                {t.request.sectionBusiness}
              </legend>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="field-fullName">{t.request.fullName}</Label>
                  <Input
                    id="field-fullName"
                    name="fullName"
                    className="mt-2"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) => set("fullName", event.target.value)}
                    placeholder={t.request.fullNamePlaceholder}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "error-fullName" : undefined}
                  />
                  <div id="error-fullName">
                    <FieldError>{errors.fullName}</FieldError>
                  </div>
                </div>

                <div>
                  <Label htmlFor="field-businessName">{t.request.businessName}</Label>
                  <Input
                    id="field-businessName"
                    name="businessName"
                    className="mt-2"
                    autoComplete="organization"
                    value={form.businessName}
                    onChange={(event) => set("businessName", event.target.value)}
                    placeholder={t.request.businessNamePlaceholder}
                    aria-invalid={Boolean(errors.businessName)}
                    aria-describedby={errors.businessName ? "error-businessName" : undefined}
                  />
                  <div id="error-businessName">
                    <FieldError>{errors.businessName}</FieldError>
                  </div>
                </div>

                <div>
                  <Label htmlFor="field-phone">{t.request.phone}</Label>
                  <Input
                    id="field-phone"
                    name="phone"
                    className="mt-2"
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => set("phone", event.target.value)}
                    placeholder={t.request.phonePlaceholder}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "error-phone" : undefined}
                  />
                  <div id="error-phone">
                    <FieldError>{errors.phone}</FieldError>
                  </div>
                </div>

                <div>
                  <Label htmlFor="field-wilaya">{t.request.wilaya}</Label>
                  <div className="mt-2">
                    <Select
                      id="field-wilaya"
                      name="wilaya"
                      value={form.wilaya}
                      onChange={(event) => set("wilaya", event.target.value)}
                      aria-invalid={Boolean(errors.wilaya)}
                    >
                      <option value="">{t.request.wilayaPlaceholder}</option>
                      {wilayaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <FieldError>{errors.wilaya}</FieldError>
                </div>
              </div>
            </fieldset>

            <Separator />

            <fieldset className="space-y-5">
              <legend className="mb-2 font-display text-xl font-semibold">
                {t.request.sectionOrder}
              </legend>

              <div>
                <Label htmlFor="field-products">
                  {t.request.products}
                  {productParam && (
                    <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] normal-case tracking-normal text-primary">
                      {productParam}
                    </span>
                  )}
                </Label>
                <Textarea
                  id="field-products"
                  name="products"
                  className="mt-2"
                  rows={3}
                  value={form.products}
                  onChange={(event) => set("products", event.target.value)}
                  placeholder={t.request.productsPlaceholder}
                  aria-invalid={Boolean(errors.products)}
                />
                <FieldError>{errors.products}</FieldError>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="field-quantity">{t.request.quantity}</Label>
                  <Input
                    id="field-quantity"
                    name="quantity"
                    className="mt-2"
                    value={form.quantity}
                    onChange={(event) => set("quantity", event.target.value)}
                    placeholder={t.request.quantityPlaceholder}
                    aria-invalid={Boolean(errors.quantity)}
                  />
                  <FieldError>{errors.quantity}</FieldError>
                </div>

                <div>
                  <Label htmlFor="field-message">
                    {t.request.message}
                    <span className="text-[0.65rem] normal-case tracking-normal text-muted-foreground">
                      ({t.request.optional})
                    </span>
                  </Label>
                  <Input
                    id="field-message"
                    name="message"
                    className="mt-2"
                    value={form.message}
                    onChange={(event) => set("message", event.target.value)}
                    placeholder={t.request.messagePlaceholder}
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" disabled={submitting} className="sm:min-w-[13rem]">
                {submitting ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    {t.request.submitting}
                  </>
                ) : (
                  <>
                    <Send /> {t.request.submit}
                  </>
                )}
              </Button>
              {whatsapp && (
                <Button asChild variant="outline" size="lg">
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> {t.request.whatsapp}
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{t.request.privacy}</p>
          </form>
        </Card>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
          <Card className="border-gold-500/25 bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200 p-6">
            <Sparkles className="size-5 text-gold-600" aria-hidden="true" />
            <h2 className="mt-4 font-display text-xl font-semibold text-wine-900">
              {t.home.whyEyebrow}
            </h2>
            <ul className="mt-4 space-y-3">
              {[t.why.wholesale, t.why.prices, t.why.communication, t.why.service].map((item) => (
                <li key={item.title} className="flex gap-2.5 text-sm text-wine-900/80">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                  <span>
                    <span className="font-medium text-wine-900">{item.title}</span> — {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold">{t.about.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(settings.brand.about, t.brand.description)}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">{t.request.responseTime}</p>
          </Card>
        </aside>
      </div>
    </>
  );
}
