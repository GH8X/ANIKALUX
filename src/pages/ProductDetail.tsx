import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Film,
  Layers,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { ProductArt } from "@/components/brand/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Badge, Separator } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { cn, formatPrice, whatsappLink } from "@/lib/utils";

function Gallery({ product }: { product: Product }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const gesture = useRef<{ x: number; y: number; at: number } | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    setIndex(0);
    setZoomed(false);
    setShowVideo(false);
  }, [product.id]);

  const hasImages = product.images.length > 1;

  const show = (next: number) => {
    setZoomed(false);
    setShowVideo(false);
    setIndex(((next % product.images.length) + product.images.length) % product.images.length);
  };

  /** Touch-only gestures: horizontal swipe moves photos, double tap zooms. */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    gesture.current = { x: event.clientX, y: event.clientY, at: Date.now() };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    gesture.current = null;
    if (event.pointerType !== "touch" || !start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && Date.now() - start.at < 300) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setZoomed((value) => !value);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
      return;
    }

    if (!hasImages || zoomed) return;
    if (Math.abs(dx) > 44 && Math.abs(dy) < 70) show(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="space-y-4">
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className={cn(
          "group relative overflow-hidden rounded-lg border border-border/70 bg-muted shadow-soft",
          zoomed && "cursor-zoom-out",
        )}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className={cn(
            "aspect-[4/5] w-full transition-transform duration-300 ease-luxe",
            zoomed && "scale-[1.7]",
          )}
        >
          {showVideo && product.videoUrl ? (
            <video
              src={product.videoUrl}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full bg-wine-950 object-cover"
            />
          ) : (
            <ProductArt product={product} eager />
          )}
        </div>

        {hasImages && (
          <>
            <button
              type="button"
              aria-label={t.product.prevImage}
              onClick={() => show(index - 1)}
              className="absolute start-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition-opacity hover:bg-background"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t.product.nextImage}
              onClick={() => show(index + 1)}
              className="absolute end-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition-opacity hover:bg-background"
            >
              <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-1.5">
            {product.isNew && <Badge variant="gold">{t.home.newBadge}</Badge>}
            {product.isBestSeller && <Badge variant="primary">{t.home.bestBadge}</Badge>}
          </div>
        </div>
      </div>

      {product.videoUrl && (
        <button
          type="button"
          onClick={() => {
            setShowVideo(true);
            setZoomed(false);
          }}
          aria-pressed={showVideo}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-[0.78rem] font-medium transition-colors",
            showVideo
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
          )}
        >
          <Film className="size-3.5" aria-hidden="true" />
          {t.product.video}
        </button>
      )}

      {product.images.length > 0 && (
        <ul className="grid grid-cols-5 gap-2.5" aria-label={t.product.gallery}>
          {product.images.map((image, imageIndex) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => show(imageIndex)}
                aria-current={imageIndex === index}
                className={cn(
                  "block aspect-square w-full overflow-hidden rounded-md border bg-muted transition-all duration-300",
                  imageIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40",
                )}
              >
                <img
                  src={image.url}
                  alt={`${product.name.primary} ${imageIndex + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SpecRow({ icon: Icon, label, value }: { icon: typeof Truck; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-foreground/85">{value}</p>
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, tx } = useI18n();
  const { status, productBySlug, categoryById, products, settings } = useStore();

  const product = slug ? productBySlug(slug) : undefined;
  const category = product ? categoryById(product.categoryId) : undefined;

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.active && p.id !== product.id && p.categoryId === product.categoryId)
      .slice(0, 4);
  }, [products, product]);

  const whatsapp = settings.contact.whatsapp
    ? whatsappLink(
        settings.contact.whatsapp,
        `${t.request.whatsappPrefill}\n${product ? `${product.code} — ${product.name.primary}` : ""}`,
      )
    : `/wholesale?product=${encodeURIComponent(product?.code ?? "")}`;

  if (status === "loading") {
    return (
      <div className="container section">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="skeleton aspect-[4/5] rounded-lg" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-10 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-24 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section">
        <Seo
          title={`${t.products.notFound} | ${settings.brand.name}`}
          description={t.products.notFoundHint}
          noindex
        />
        <EmptyState
          icon={Package}
          title={t.products.notFound}
          hint={t.products.notFoundHint}
          action={
            <Button asChild>
              <Link to="/products">{t.products.backToCatalogue}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name.primary,
    description: tx(product.description),
    sku: product.code,
    mpn: product.code,
    category: category ? tx(category.name) : undefined,
    brand: { "@type": "Brand", name: settings.brand.name },
    ...(product.images.length > 0
      ? { image: product.images.map((img) => (img.url.startsWith("data:") ? undefined : img.url)).filter(Boolean) }
      : {}),
    ...(product.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "DZD",
            availability: "https://schema.org/InStock",
            eligibleQuantity: {
              "@type": "QuantitativeValue",
              minValue: product.minOrderQty,
              unitCode: "C62",
            },
          },
        }
      : {}),
  };

  return (
    <>
      <Seo
        title={`${product.name.primary} (${product.code}) | ${settings.brand.name}`}
        description={
          tx(product.description).slice(0, 155) ||
          `${product.name.primary} — wholesale from ${settings.brand.name}.`
        }
        type="product"
        jsonLd={productLd}
      />

      <div className="border-b border-border/60 bg-secondary/40">
        <div className="container flex flex-wrap items-center gap-2 py-4 text-[0.75rem] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            {t.nav.home}
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/products" className="transition-colors hover:text-primary">
            {t.nav.products}
          </Link>
          {category && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                to={`/${category.group === "pajamas" ? "pajamas" : "clothing"}?category=${category.slug}`}
                className="transition-colors hover:text-primary"
              >
                {tx(category.name)}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-foreground/75">{product.name.primary}</span>
        </div>
      </div>

      <article className="container section pt-10 sm:pt-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ms-2 px-2">
          <Link to="/products">
            <ArrowLeft className="rtl:rotate-180" /> {t.products.backToCatalogue}
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Gallery product={product} />

          <div>
            {category && (
              <p className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-gold-600">
                {tx(category.name)}
              </p>
            )}
            <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.1] sm:text-4xl">
              {product.name.primary}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t.product.code}: {product.code}
              </span>
              {product.isNew && <Badge variant="gold">{t.home.newBadge}</Badge>}
              {product.isBestSeller && <Badge variant="primary">{t.home.bestBadge}</Badge>}
            </div>

            <div className="mt-6 rounded-lg border border-gold-500/25 bg-cream-50 p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-wine-900/60">
                    {t.product.price}
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold text-wine-900">
                    {product.price === null
                      ? t.card.contactForPrice
                      : formatPrice(product.price, "DZD", t.card.contactForPrice)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-wine-900/60">
                    {t.product.minOrder}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-display text-2xl font-semibold text-wine-900">
                    <Layers className="size-4" aria-hidden="true" />
                    {product.minOrderQty} {t.card.pieces}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <Button asChild size="lg" className="flex-1">
                  <Link to={`/wholesale?product=${encodeURIComponent(product.code)}`}>
                    <ShoppingBag /> {t.product.requestTitle}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-wine-900/25 bg-white/70 hover:border-wine-900/45"
                >
                  <a
                    href={whatsapp}
                    target={whatsapp.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    <MessageCircle /> {t.request.whatsapp}
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-wine-900/55 sm:text-start">
                {t.request.responseTime}
              </p>
            </div>

            <section className="mt-8" aria-labelledby="product-description">
              <h2 id="product-description" className="font-display text-xl font-semibold">
                {t.product.description}
              </h2>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
                {tx(product.description)}
              </p>
            </section>

            <Separator className="my-8" />

            <section aria-labelledby="product-specs">
              <h2 id="product-specs" className="font-display text-xl font-semibold">
                {t.product.specifications}
              </h2>

              <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {t.product.colors}
                  </dt>
                  <dd className="mt-2.5 flex flex-wrap gap-2">
                    {product.colors.length > 0 ? (
                      product.colors.map((color) => (
                        <span
                          key={color.id}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-[0.75rem]"
                        >
                          <span
                            className="size-3.5 rounded-full ring-1 ring-inset ring-black/15"
                            style={{ backgroundColor: color.hex }}
                            aria-hidden="true"
                          />
                          {color.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {t.product.sizes}
                  </dt>
                  <dd className="mt-2.5 flex flex-wrap gap-2">
                    {product.sizes.length > 0 ? (
                      product.sizes.map((size) => (
                        <span
                          key={size}
                          className="inline-flex min-w-9 items-center justify-center rounded-md border border-border bg-card px-2.5 py-1 text-[0.75rem] font-medium"
                        >
                          {size}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 divide-y divide-border/70">
                <SpecRow icon={Package} label={t.product.availability} value={t.product.availabilityValue} />
                <SpecRow icon={Truck} label={t.product.leadTime} value={t.product.leadTimeValue} />
                <SpecRow icon={ShieldCheck} label={t.product.packing} value={t.product.packingValue} />
              </div>
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related-products">
            <div className="flex items-center gap-4">
              <h2 id="related-products" className="font-display text-2xl font-semibold">
                {t.products.related}
              </h2>
              <div className="hairline flex-1" />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {related.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
