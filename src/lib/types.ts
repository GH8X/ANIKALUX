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
  /** Optional promotional label shown on the card, e.g. "Limited". */
  badge: string;
  /** null means "not tracked" so a catalogue can ship before stock is counted. */
  stock: number | null;
  videoUrl: string | null;
  /** Manual merchandising order — admin controls it with move up / move down. */
  order: number;
}

/** One line of a multi-product wholesale inquiry. */
export interface InquiryItem {
  productId: string;
  code: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
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
  /** Internal admin notes — never shown on the public site. */
  notes: string;
  /** Archived inquiries stay searchable but leave the active pipeline. */
  archived: boolean;
  /** Present when the inquiry came from the multi-product inquiry list. */
  items?: InquiryItem[];
}

/* --------------------------------------------------------------- CMS models */

export interface Testimonial {
  id: string;
  author: string;
  businessName: string;
  wilaya: string;
  quote: I18nText;
  rating: number;
  active: boolean;
  order: number;
}

export interface FaqItem {
  id: string;
  question: I18nText;
  answer: I18nText;
  active: boolean;
  order: number;
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  createdAt: string;
}

/* ------------------------------------------------------------- Site content */

export const SOCIAL_KEYS = [
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "telegram",
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];

/** Keys of the homepage sections the owner can reorder or hide. */
export const HOME_SECTIONS = [
  "hero",
  "categories",
  "promotion",
  "newArrivals",
  "bestSellers",
  "featured",
  "why",
  "testimonials",
  "faq",
  "about",
  "location",
  "cta",
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number];

export interface HomeSectionState {
  key: HomeSectionKey;
  visible: boolean;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: I18nText;
  href: string;
}

export interface SeoSettings {
  title: string;
  description: I18nText;
  keywords: string;
  ogImageUrl: string | null;
}

export interface LocationSettings {
  mapsUrl: string;
  lat: string;
  lng: string;
  hours: I18nText;
}

/** YouTube and Telegram plus the on/off state of every network. */
export interface SocialSettings {
  youtube: string;
  telegram: string;
  hidden: SocialKey[];
}

export interface PromotionSettings {
  enabled: boolean;
  badge: I18nText;
  title: I18nText;
  text: I18nText;
  ctaLabel: I18nText;
  ctaHref: string;
  mediaUrl: string | null;
}

export interface SiteSettings {
  brand: {
    /** The official Al-Aniqa Lux logo, stored verbatim. Never recoloured or redrawn. */
    logoUrl: string | null;
    /** Previously published logos, newest first, so a replacement is reversible. */
    logoHistory: string[];
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
  announcement: AnnouncementSettings;
  seo: SeoSettings;
  location: LocationSettings;
  social: SocialSettings;
  promotion: PromotionSettings;
  /** Homepage section order + visibility, driven by the Homepage editor. */
  homeSections: HomeSectionState[];
}

export interface Database {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  requests: WholesaleRequest[];
  testimonials: Testimonial[];
  faq: FaqItem[];
  /** Flat upload library reused by every image/video picker in the admin. */
  media: MediaAsset[];
}
