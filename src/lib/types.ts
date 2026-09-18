export type Locale = "en" | "fr" | "ar";

export const LOCALES: { code: Locale; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇩🇿" },
];

/**
 * Editable text. The admin types one primary value; per-locale overrides are
 * optional so a shop owner is never forced to translate every product.
 */
export interface I18nText {
  primary: string;
  en?: string;
  fr?: string;
  ar?: string;
}

export type CategoryGroup = "pajamas" | "clothing";

export interface Category {
  id: string;
  slug: string;
  name: I18nText;
  group: CategoryGroup;
  description?: I18nText;
  image: string | null;
  order: number;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  code: string;
  name: I18nText;
  categoryId: string;
  description: I18nText;
  /** null renders as "Contact for price" — standard for wholesale catalogs. */
  price: number | null;
  minOrderQty: number;
  sizes: string[];
  colors: ProductColor[];
  images: ProductImage[];
  mainImageId: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  active: boolean;
  createdAt: string;
}

export const REQUEST_STATUSES = [
  "new",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface WholesaleRequest {
  id: string;
  fullName: string;
  businessName: string;
  phone: string;
  wilaya: string;
  products: string;
  quantity: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  brand: {
    /** The official Al-Aniqa Lux logo, stored verbatim. Never recoloured or redrawn. */
    logoUrl: string | null;
    name: string;
    tagline: I18nText;
    about: I18nText;
  };
  hero: {
    headline: I18nText;
    subtitle: I18nText;
    mediaUrl: string | null;
    mediaType: "image" | "video";
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    address: I18nText;
  };
  featuredProductIds: string[];
  newArrivalIds: string[];
  bestSellerIds: string[];
  adminPassword: string;
}

export interface Database {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  requests: WholesaleRequest[];
}
