import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Layers, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/ProductArt";
import { Badge } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useInquiry } from "@/lib/inquiry";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  eager?: boolean;
}

export function ProductCard({ product, index = 0, eager = false }: ProductCardProps) {
  const { t, tx } = useI18n();
  const { categoryById, settings } = useStore();
  const { add } = useInquiry();
  const reduce = useReducedMotion();

  const category = categoryById(product.categoryId);
  const visibleColors = product.colors.slice(0, 4);
  const extraColors = product.colors.length - visibleColors.length;
  const visibleSizes = product.sizes.slice(0, 4);
  const extraSizes = product.sizes.length - visibleSizes.length;

  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-soft transition-all duration-500 ease-luxe hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-card"
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
        aria-label={product.name.primary}
      >
        <motion.div
          className="h-full w-full"
          whileHover={reduce ? undefined : { scale: 1.045 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductArt product={product} eager={eager} />
        </motion.div>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-1.5">
            {product.isNew && (
              <Badge variant="gold" className="shadow-soft">
                {t.home.newBadge}
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="primary" className="shadow-soft">
                {t.home.bestBadge}
              </Badge>
            )}
            {product.badge && (
              <Badge variant="cream" className="shadow-soft">
                {product.badge}
              </Badge>
            )}
          </div>
          <span className="rounded-full bg-wine-950/70 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cream-200 backdrop-blur-sm">
            {product.code}
          </span>
        </div>

        <span className="absolute bottom-3 end-3 grid size-9 translate-y-2 place-items-center rounded-full bg-cream-100 text-wine-800 opacity-0 shadow-soft transition-all duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          {category && (
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-gold-600">
              {tx(category.name)}
            </p>
          )}
          <h3 className="font-display text-[1.05rem] font-semibold leading-snug">
            <Link to={`/product/${product.slug}`} className="transition-colors hover:text-primary">
              {tx(product.name)}
            </Link>
          </h3>
        </div>

        {(visibleColors.length > 0 || visibleSizes.length > 0) && (
          <div className="space-y-2 text-[0.72rem] text-muted-foreground">
            {visibleColors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="shrink-0 uppercase tracking-[0.12em]">{t.card.colors}</span>
                <span className="flex items-center gap-1">
                  {visibleColors.map((color) => (
                    <span
                      key={color.id}
                      title={color.name}
                      className="size-3.5 rounded-full ring-1 ring-inset ring-black/15"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                  {extraColors > 0 && <span className="ms-1">+{extraColors}</span>}
                </span>
              </div>
            )}
            {visibleSizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="shrink-0 uppercase tracking-[0.12em]">{t.card.sizes}</span>
                <span className="truncate text-foreground/75">
                  {visibleSizes.join(" · ")}
                  {extraSizes > 0 && ` +${extraSizes}`}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto space-y-3 border-t border-border/60 pt-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t.card.minOrder}
              </p>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Layers className="size-3.5 text-gold-600" aria-hidden="true" />
                {product.minOrderQty} {t.card.pieces}
              </p>
              {product.stock !== null && (
                <p
                  className={cn(
                    "mt-0.5 text-[0.66rem] font-medium",
                    product.stock === 0
                      ? "text-destructive"
                      : product.stock <= 12
                        ? "text-gold-700"
                        : "text-muted-foreground",
                  )}
                >
                  {product.stock === 0
                    ? t.stock.out
                    : product.stock <= 12
                      ? `${t.stock.low} · ${product.stock}`
                      : `${t.stock.inStock} · ${product.stock}`}
                </p>
              )}
            </div>
            <p className={cn("text-end font-display text-lg font-semibold", product.price === null && "text-muted-foreground")}>
              {product.price === null
                ? t.card.contactForPrice
                : formatPrice(product.price, "DZD", t.card.contactForPrice)}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/wholesale?product=${encodeURIComponent(product.code)}`}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-[0.78rem] font-medium text-primary-foreground transition-colors duration-300 hover:bg-wine-800"
            >
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              {t.card.request}
            </Link>
            <button
              type="button"
              aria-label={`${t.inquiry.add} — ${tx(product.name)}`}
              title={t.inquiry.add}
              onClick={() => {
                add({
                  productId: product.id,
                  code: product.code,
                  name: tx(product.name),
                  // Default to the wholesale minimum so a quote starts realistic.
                  color: product.colors[0]?.name ?? "",
                  size: product.sizes[0] ?? "",
                  quantity: product.minOrderQty,
                });
                toast.success(t.inquiry.added);
              }}
              className="grid size-9 place-items-center rounded-md border border-border text-foreground/70 transition-colors duration-300 hover:border-gold-400/70 hover:text-primary"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
            <Link
              to={`/product/${product.slug}`}
              aria-label={`${t.card.quickView} — ${product.name.primary}`}
              className="grid size-9 place-items-center rounded-md border border-border text-foreground/70 transition-colors duration-300 hover:border-primary/40 hover:text-primary"
            >
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <span className="sr-only">{settings.brand.name}</span>
        </div>
      </div>
    </motion.article>
  );
}
