import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Product } from "@/lib/types";
import { cn, placeholderTone } from "@/lib/utils";

interface ProductArtProps {
  product: Product;
  className?: string;
  /** Renders the monogram + code overlay on placeholders and as a fallback. */
  showLabel?: boolean;
  eager?: boolean;
}

/**
 * Product imagery. When no photo has been uploaded the component renders an
 * on-brand abstract placeholder derived from the product code — never a
 * third-party image or another brand's photography.
 */
export function ProductArt({ product, className, showLabel = true, eager = false }: ProductArtProps) {
  const [failed, setFailed] = useState(false);
  const mainImage =
    product.images.find((img) => img.id === product.mainImageId) ?? product.images[0] ?? null;

  if (mainImage && !failed) {
    return (
      <img
        src={mainImage.url}
        alt={product.name.primary}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  const tone = placeholderTone(product.code || product.id);

  return (
    <div
      role="img"
      aria-label={`${product.name.primary} — image placeholder`}
      className={cn(
        "relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br",
        tone.gradient,
        tone.text,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 0), radial-gradient(currentColor 1px, transparent 0)",
          backgroundSize: "22px 22px",
          backgroundPosition: "0 0, 11px 11px",
        }}
      />
      <div aria-hidden="true" className="absolute -right-8 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden="true" className="absolute -bottom-12 -left-10 size-44 rounded-full bg-black/10 blur-2xl" />

      {showLabel && (
        <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
          <ImageOff className="size-5 opacity-70" aria-hidden="true" />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.28em] opacity-80">
            {product.code}
          </span>
        </div>
      )}
    </div>
  );
}
