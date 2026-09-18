import { useEffect } from "react";

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
  image = "/brand/logo.png",
  keywords,
  type = "website",
  jsonLd,
  noindex,
}: SeoProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta('meta[name="description"]', "name", "description", description);
    if (keywords) upsertMeta('meta[name="keywords"]', "name", "keywords", keywords);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:image"]', "property", "og:image", image);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex ? "noindex, follow" : "index, follow, max-image-preview:large",
    );
    upsertLink("canonical", `${window.location.origin}${window.location.pathname}`);
  }, [title, description, image, keywords, type, noindex]);

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
