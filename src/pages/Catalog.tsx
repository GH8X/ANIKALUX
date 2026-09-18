import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { ErrorState, NoResultsState, ProductGridSkeleton } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { Badge, Card } from "@/components/ui/surface";
import { interpolate, useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export type CatalogPreset = "all" | "pajamas" | "clothing" | "new";

const PAGE_SIZE = 12;

const SORTS = ["newest", "best", "price-asc", "price-desc", "name"] as const;
type SortKey = (typeof SORTS)[number];

export function Catalog({ preset }: { preset: CatalogPreset }) {
  const { t, tx, locale } = useI18n();
  const { status, reload, products, categories, settings } = useStore();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const q = params.get("q") ?? "";
  const categorySlug = params.get("category") ?? "";
  const size = params.get("size") ?? "";
  const color = params.get("color") ?? "";
  const sort = (params.get("sort") as SortKey) || (preset === "new" ? "newest" : "newest");

  const scopedCategories = useMemo(() => {
    if (preset === "pajamas") return categories.filter((c) => c.group === "pajamas");
    if (preset === "clothing") return categories.filter((c) => c.group === "clothing");
    return categories;
  }, [categories, preset]);

  const scopeCategoryIds = useMemo(
    () => new Set(scopedCategories.map((c) => c.id)),
    [scopedCategories],
  );

  const scopeProducts = useMemo(() => {
    const active = products.filter((p) => p.active);
    if (preset === "new") return active.filter((p) => p.isNew);
    if (preset === "pajamas" || preset === "clothing") {
      return active.filter((p) => scopeCategoryIds.has(p.categoryId));
    }
    return active;
  }, [products, preset, scopeCategoryIds]);

  const sizeOptions = useMemo(() => {
    const set = new Set<string>();
    scopeProducts.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [scopeProducts]);

  const colorOptions = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    scopeProducts.forEach((p) =>
      p.colors.forEach((c) => {
        if (!map.has(c.hex)) map.set(c.hex, { name: c.name, hex: c.hex });
      }),
    );
    return Array.from(map.values());
  }, [scopeProducts]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      setParams(next, { replace: true });
      setVisibleCount(PAGE_SIZE);
    },
    [params, setParams],
  );

  const clearAll = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true });
    setVisibleCount(PAGE_SIZE);
  }, [setParams]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = scopeProducts.filter((product) => {
      if (categorySlug) {
        const cat = categories.find((c) => c.slug === categorySlug);
        if (!cat || product.categoryId !== cat.id) return false;
      }
      if (size && !product.sizes.includes(size)) return false;
      if (color && !product.colors.some((c) => c.hex.toLowerCase() === color.toLowerCase()))
        return false;
      if (needle) {
        const haystack = [
          product.code,
          product.name.primary,
          product.name.en ?? "",
          product.name.fr ?? "",
          product.name.ar ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const priceOf = (value: number | null) => (value === null ? Number.POSITIVE_INFINITY : value);

    return list.sort((a, b) => {
      switch (sort) {
        case "best":
          return Number(b.isBestSeller) - Number(a.isBestSeller);
        case "price-asc":
          return priceOf(a.price) - priceOf(b.price);
        case "price-desc":
          return (
            (b.price === null ? -1 : b.price) - (a.price === null ? -1 : a.price)
          );
        case "name":
          return a.name.primary.localeCompare(b.name.primary, locale);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [scopeProducts, categories, categorySlug, size, color, q, sort, locale]);

  const visible = filtered.slice(0, visibleCount);
  const activeFilterCount = [categorySlug, size, color].filter(Boolean).length;

  const headings: Record<CatalogPreset, { title: string; subtitle: string }> = {
    all: { title: t.products.title, subtitle: t.products.subtitle },
    pajamas: { title: t.nav.pajamas, subtitle: t.home.categoriesSubtitle },
    clothing: { title: t.nav.clothing, subtitle: t.home.categoriesSubtitle },
    new: { title: t.home.newTitle, subtitle: t.home.newSubtitle },
  };

  const heading = headings[preset];

  const seoTitle =
    preset === "all"
      ? "Al-Aniqa Lux | Wholesale Clothing & Luxury Pajamas"
      : `${heading.title} — Wholesale | Al-Aniqa Lux`;

  const filterPanel = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="catalog-search">{t.products.filters}</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="catalog-search"
            value={q}
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder={t.products.searchPlaceholder}
            className="ps-9"
            type="search"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-category">{t.products.category}</Label>
        <Select
          id="catalog-category"
          value={categorySlug}
          onChange={(event) => updateParam("category", event.target.value)}
        >
          <option value="">{t.products.allCategories}</option>
          {scopedCategories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {tx(cat.name)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-size">{t.products.size}</Label>
        <Select id="catalog-size" value={size} onChange={(event) => updateParam("size", event.target.value)}>
          <option value="">{t.products.allSizes}</option>
          {sizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2.5">
        <Label>{t.products.color}</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParam("color", "")}
            className={cn(
              "h-8 rounded-full border px-3 text-[0.72rem] transition-colors",
              !color ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {t.products.allColors}
          </button>
          {colorOptions.map((option) => {
            const selected = color.toLowerCase() === option.hex.toLowerCase();
            return (
              <button
                key={option.hex}
                type="button"
                onClick={() => updateParam("color", selected ? "" : option.hex)}
                title={option.name}
                aria-label={option.name}
                aria-pressed={selected}
                className={cn(
                  "size-8 rounded-full ring-1 ring-inset ring-black/15 transition-all duration-300",
                  selected
                    ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:scale-105",
                )}
                style={{ backgroundColor: option.hex }}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-sort">{t.products.sort}</Label>
        <Select id="catalog-sort" value={sort} onChange={(event) => updateParam("sort", event.target.value)}>
          <option value="newest">{t.products.sortNewest}</option>
          <option value="best">{t.products.sortBestSellers}</option>
          <option value="price-asc">{t.products.sortPriceLow}</option>
          <option value="price-desc">{t.products.sortPriceHigh}</option>
          <option value="name">{t.products.sortName}</option>
        </Select>
      </div>

      {(activeFilterCount > 0 || q) && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full justify-start px-0">
          <X className="size-4" /> {t.products.clear}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Seo
        title={seoTitle}
        description={heading.subtitle}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: heading.title,
          numberOfItems: filtered.length,
          itemListElement: visible.slice(0, 10).map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.name.primary,
            url: `${window.location.origin}/product/${product.slug}`,
          })),
        }}
      />

      <section className="border-b border-border/60 bg-gradient-to-b from-secondary/60 to-background">
        <div className="container py-12 sm:py-16">
          <SectionHeading
            eyebrow={tx(settings.brand.tagline)}
            title={heading.title}
            subtitle={heading.subtitle}
          />
        </div>
      </section>

      <div className="container section pt-8 sm:pt-10">
        <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <Card className="p-5">{filterPanel}</Card>
              <Card className="bg-wine-900 p-5 text-cream-100">
                <Sparkles className="size-5 text-gold-400" aria-hidden="true" />
                <p className="mt-3 font-display text-lg font-semibold">{t.home.ctaTitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-cream-100/70">{t.request.responseTime}</p>
                <Button asChild variant="gold" size="sm" className="mt-4 w-full">
                  <Link to="/wholesale">{t.home.ctaButton}</Link>
                </Button>
              </Card>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                  aria-expanded={filtersOpen}
                >
                  <SlidersHorizontal className="size-4" />
                  {t.products.filters}
                  {activeFilterCount > 0 && (
                    <span className="ms-1 rounded-full bg-primary px-1.5 text-[0.65rem] text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {interpolate(t.products.countLabel, {
                    shown: visible.length,
                    total: filtered.length,
                  })}
                </p>
              </div>

              <div className="hidden items-center gap-2 sm:flex lg:hidden">
                <Label htmlFor="sort-inline" className="sr-only">
                  {t.products.sort}
                </Label>
                <Select
                  id="sort-inline"
                  value={sort}
                  onChange={(event) => updateParam("sort", event.target.value)}
                  className="h-9 w-auto min-w-[10rem] text-[0.8rem]"
                >
                  <option value="newest">{t.products.sortNewest}</option>
                  <option value="best">{t.products.sortBestSellers}</option>
                  <option value="price-asc">{t.products.sortPriceLow}</option>
                  <option value="price-desc">{t.products.sortPriceHigh}</option>
                  <option value="name">{t.products.sortName}</option>
                </Select>
              </div>
            </div>

            {q && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge variant="cream">
                  {t.products.filters}: “{q}”
                  <button type="button" onClick={() => updateParam("q", "")} aria-label={t.products.clear}>
                    <X className="size-3" />
                  </button>
                </Badge>
              </div>
            )}

            {status === "loading" && <ProductGridSkeleton />}

            {status === "error" && <ErrorState onRetry={reload} />}

            {status === "ready" && filtered.length === 0 && <NoResultsState onClear={clearAll} />}

            {status === "ready" && filtered.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                  {visible.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} eager={index < 4} />
                  ))}
                </div>

                {visible.length < filtered.length && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      {t.products.loadMore}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-wine-950/55 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={t.products.filters}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88svh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-5 shadow-luxe lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">{t.products.filters}</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label={t.nav.closeMenu}
                  className="grid size-9 place-items-center rounded-full border border-border"
                >
                  <X className="size-4" />
                </button>
              </div>
              {filterPanel}
              <Button className="mt-6 w-full" size="lg" onClick={() => setFiltersOpen(false)}>
                {t.products.showResults} ({filtered.length})
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
