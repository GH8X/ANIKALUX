import { useEffect } from "react";
import { useOfficialLogoSrc } from "@/components/brand/Logo";

/**
 * Points the document's icon links at the official logo whenever one exists.
 *
 * The logo is square and high-contrast, so the full mark reads well cropped to
 * a favicon — nothing is redrawn, recoloured or substituted. When no logo is
 * published the static `/favicon.svg` fallback is left untouched.
 */
export function LogoFavicon() {
  const src = useOfficialLogoSrc();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const head = document.head;
    const iconLink = head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!iconLink) return;

    const originalHref = iconLink.getAttribute("href");
    const originalType = iconLink.getAttribute("type");

    // Created lazily: an apple-touch-icon pointing at a file that may not exist
    // would only produce a 404 on every page load.
    let touchLink = head.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    const createdTouch = !touchLink;
    if (!touchLink) {
      touchLink = document.createElement("link");
      touchLink.rel = "apple-touch-icon";
      head.appendChild(touchLink);
    }
    const originalTouchHref = createdTouch ? null : touchLink.getAttribute("href");

    if (src) {
      [iconLink, touchLink].forEach((link) => {
        link.setAttribute("href", src);
        // Drop any declared type: the CMS may hold a PNG data URL while the
        // markup still says image/svg+xml, and a wrong type is ignored.
        link.removeAttribute("type");
      });
    }

    return () => {
      if (originalHref) iconLink.setAttribute("href", originalHref);
      if (originalType) iconLink.setAttribute("type", originalType);
      if (createdTouch) {
        touchLink.remove();
      } else if (originalTouchHref) {
        touchLink.setAttribute("href", originalTouchHref);
      }
    };
  }, [src]);

  return null;
}
