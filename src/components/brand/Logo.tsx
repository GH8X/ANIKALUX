import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Standard drop-in locations for the official logo file. Nothing here is ever
 * generated, recoloured, redrawn, stretched or cropped — when a file is found
 * it is rendered with `object-contain` inside a fixed box so its proportions
 * are preserved exactly as supplied.
 */
export const CANDIDATE_PATHS = [
  "/brand/logo.png",
  "/brand/logo.svg",
  "/brand/logo.webp",
  "/brand/logo.jpg",
  "/brand/logo.jpeg",
];

/**
 * Resolves the official logo: the URL saved in the CMS first, otherwise the
 * first official file found in `public/brand/`. Exported so the favicon and the
 * admin preview render exactly the same asset as the header and footer.
 */
export function useOfficialLogoSrc() {
  const { settings } = useStore();
  const [discovered, setDiscovered] = useState<string | null>(null);

  useEffect(() => {
    if (settings.brand.logoUrl) return;
    let cancelled = false;
    let index = 0;

    const probe = () => {
      if (cancelled || index >= CANDIDATE_PATHS.length) return;
      const src = CANDIDATE_PATHS[index];
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setDiscovered(src);
      };
      img.onerror = () => {
        index += 1;
        probe();
      };
      img.src = src;
    };

    probe();
    return () => {
      cancelled = true;
    };
  }, [settings.brand.logoUrl]);

  return settings.brand.logoUrl ?? discovered;
}

interface LogoProps {
  className?: string;
  /** Tailwind height class for the logo box. Width follows the natural ratio. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show the upload hint inside the placeholder frame. */
  showHint?: boolean;
}

/** Fixed square boxes. `object-contain` letterboxes inside them, so a wide or
 * tall logo is never stretched — only the box around it changes shape. */
/** Exported so the admin preview renders the logo at exactly these sizes. */
export const LOGO_SIZES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24 sm:h-28 sm:w-28",
};

export function Logo({ className, size = "md", showHint = false }: LogoProps) {
  const src = useOfficialLogoSrc();
  const { settings } = useStore();
  const box = LOGO_SIZES[size];

  if (src) {
    return (
      <img
        src={src}
        alt={settings.brand.name}
        className={cn("object-contain", box, className)}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${settings.brand.name} logo placeholder`}
      className={cn(
        "grid shrink-0 place-items-center rounded-md border border-dashed border-cream-200/60 bg-gradient-to-br from-wine-700 via-wine-800 to-wine-900 text-cream-200",
        box,
        className,
      )}
    >
      {showHint ? (
        <span className="flex flex-col items-center gap-1 px-2 text-center">
          <ImagePlus className="size-5" aria-hidden="true" />
          <span className="text-[0.55rem] font-medium uppercase leading-tight tracking-[0.14em]">
            Official logo
          </span>
        </span>
      ) : (
        <ImagePlus className="size-4" aria-hidden="true" />
      )}
    </div>
  );
}

/** Wordmark shown beside the logo — never a replacement for it. */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { settings } = useStore();
  return (
    <span className={cn("flex min-w-0 flex-col leading-none", className)}>
      <span className="truncate font-display text-[1.05rem] font-semibold tracking-[0.02em] text-foreground sm:text-[1.2rem]">
        {settings.brand.name}
      </span>
      {!compact && (
        <span className="mt-0.5 truncate text-[0.6rem] font-medium uppercase tracking-[0.28em] text-gold-600">
          Wholesale · Algeria
        </span>
      )}
    </span>
  );
}
