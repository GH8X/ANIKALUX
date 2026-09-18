import { useEffect } from "react";
import { useStore } from "@/lib/store";

interface SeoProps {
  title: string;
  description: string;
  /** Absolute or root-relative image path used for the Open Graph preview. */
  image?: string;
  /** Optional keyword list managed from Admin → SEO. */
  keywords?: string;
  type?: "website" | "product" | "article";
  /** JSON-LD structured data injected for the current route. */
  jsonLd?: Record<string, unknown> | null;
  noindex?: boolean;
}

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Crawlers reject relative Open Graph images, so every image URL is resolved
 * against the origin the site is actually served from — no configuration and
 * correct on any domain.
 */
function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path;
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return path;
  }
}

/** The official logo drop-in path, used when the owner has published no OG image. */
const DEFAULT_OG_IMAGE = "/brand/logo.png";

function upsertLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/** Lightweight head manager — keeps meta tags in sync with the active route. */
export function Seo({
  title,
  description,
  image,
  keywords,
  type = "website",
  jsonLd,
  noindex,
}: SeoProps) {
  const { settings } = useStore();

  // Resolution order: explicit prop → Admin → SEO → OG image → published logo
  // → the official logo file. Uploaded data URLs are skipped because no crawler
  // can fetch them.
  const rawImage =
    image ?? settings.seo.ogImageUrl ?? settings.brand.logoUrl ?? DEFAULT_OG_IMAGE;
  const previewImage = rawImage.startsWith("data:") ? DEFAULT_OG_IMAGE : rawImage;

  useEffect(() => {
    const absoluteImage = toAbsoluteUrl(previewImage);
    document.title = title;
    upsertMeta('meta[name="description"]', "name", "description", description);
    if (keywords) upsertMeta('meta[name="keywords"]', "name", "keywords", keywords);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:image"]', "property", "og:image", absoluteImage);
    upsertMeta('meta[property="og:image:alt"]', "property", "og:image:alt", title);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", absoluteImage);
    upsertMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex ? "noindex, follow" : "index, follow, max-image-preview:large",
    );
    upsertLink("canonical", `${window.location.origin}${window.location.pathname}`);
  }, [title, description, previewImage, keywords, type, noindex]);

  useEffect(() => {
    const id = "route-json-ld";
    document.getElementById(id)?.remove();
    if (!jsonLd) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [jsonLd]);

  return null;
}
