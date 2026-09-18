import type {
  Category,
  Database,
  HomeSectionState,
  I18nText,
  Product,
  SiteSettings,
} from "./types";

const t = (primary: string, fr?: string, ar?: string): I18nText => ({
  primary,
  en: primary,
  fr: fr ?? primary,
  ar: ar ?? primary,
});

/**
 * Imagery: no third-party photography is bundled, so every product starts with
 * a clean, on-brand placeholder rendered from the wine/cream palette. Replace
 * any image from Admin → Products → Images.
 */

export const defaultSettings: SiteSettings = {
  brand: {
    // Set the official logo file from Admin → Brand & Homepage.
    logoUrl: null,
    name: "Al-Aniqa Lux",
    tagline: t(
      "Wholesale fashion & luxury pajamas",
      "Mode en gros & pyjamas de luxe",
      "أزياء بالجملة وبيجامات فاخرة",
    ),
    about: t(
      "Al-Aniqa Lux is a fashion wholesale brand specializing in elegant clothing and premium pajamas. We provide modern collections, quality products, and a professional wholesale experience for retailers and resellers.",
      "Al-Aniqa Lux est une marque de mode en gros spécialisée dans les vêtements élégants et les pyjamas haut de gamme. Nous proposons des collections modernes, des produits de qualité et une expérience de gros professionnelle aux détaillants et revendeurs.",
      "الأنيقة Lux علامة أزياء بالجملة متخصصة في الملابس الأنيقة والبيجامات الراقية. نوفر مجموعات عصرية ومنتجات عالية الجودة وتجربة بيع بالجملة احترافية لتجار التجزئة والموزعين.",
    ),
  },
  hero: {
    headline: t("Elegance Made for You", "L'élégance faite pour vous", "أناقة صُنعت من أجلك"),
    subtitle: t(
      "Premium clothing and luxury pajamas available at wholesale prices.",
      "Vêtements haut de gamme et pyjamas de luxe à prix de gros.",
      "ملابس فاخرة وبيجامات راقية بأسعار الجملة.",
    ),
    mediaUrl: null,
    mediaType: "image",
  },
  contact: {
    // Empty on purpose — Al-Aniqa Lux fills these from the dashboard.
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    address: t("", "", ""),
  },
  featuredProductIds: [],
  newArrivalIds: [],
  bestSellerIds: [],
  adminPassword: "anika-lux",
  announcement: {
    // Ships disabled: the owner decides what to announce, nothing is invented.
    enabled: false,
    text: t(
      "Wholesale only — new collections every season",
      "Vente en gros uniquement — nouvelles collections chaque saison",
      "بيع بالجملة فقط — مجموعات جديدة كل موسم",
    ),
    href: "/wholesale",
  },
  seo: {
    title: "Al-Aniqa Lux | Wholesale Clothing & Luxury Pajamas",
    description: t(
      "Premium clothing and luxury pajamas available at wholesale prices.",
      "Vêtements haut de gamme et pyjamas de luxe à prix de gros.",
      "ملابس فاخرة وبيجامات راقية بأسعار الجملة.",
    ),
    keywords:
      "wholesale clothing Algeria, luxury pajamas wholesale, vetements en gros algerie, pyjamas de luxe, بيع بالجملة",
    ogImageUrl: null,
  },
  location: {
    mapsUrl: "",
    lat: "",
    lng: "",
    hours: t("", "", ""),
  },
  social: { youtube: "", telegram: "", hidden: [] },
  promotion: {
    enabled: false,
    badge: t("Seasonal offer", "Offre saisonnière", "عرض الموسم"),
    title: t(
      "New season, wholesale ready",
      "Nouvelle saison, prête en gros",
      "موسم جديد، جاهز بالجملة",
    ),
    text: t(
      "Fresh lines landing now — ask for the volume price list.",
      "Nouvelles lignes disponibles — demandez le tarif de gros.",
      "خطوط جديدة متوفرة — اطلب قائمة أسعار الجملة.",
    ),
    ctaLabel: t("Request the price list", "Demander le tarif", "اطلب قائمة الأسعار"),
    ctaHref: "/wholesale",
    mediaUrl: null,
  },
  // Matches the order the homepage already rendered, so nothing moves on
  // upgrade. Sections with no content stay hidden until the owner fills them.
  homeSections: [
    { key: "hero", visible: true },
    { key: "categories", visible: true },
    { key: "promotion", visible: false },
    { key: "newArrivals", visible: true },
    { key: "bestSellers", visible: true },
    { key: "featured", visible: true },
    { key: "why", visible: true },
    { key: "testimonials", visible: true },
    { key: "faq", visible: true },
    { key: "about", visible: true },
    { key: "location", visible: true },
    { key: "cta", visible: true },
  ],
};

/** Section order/visibility as a plain list — used when stored data predates it. */
export const defaultHomeSections: HomeSectionState[] = defaultSettings.homeSections;

const cat = (
  id: string,
  slug: string,
  group: Category["group"],
  primary: string,
  fr: string,
  ar: string,
  order: number,
  description: I18nText,
): Category => ({
  id,
  slug,
  group,
  name: t(primary, fr, ar),
  description,
  image: null,
  order,
});

export const defaultCategories: Category[] = [
  cat("cat-luxury-pajamas", "luxury-pajamas", "pajamas", "Luxury Pajamas", "Pyjamas de luxe", "بيجامات فاخرة", 1,
    t("Satin, silk-touch and embroidered sets crafted for a refined night.", "Ensembles satinés et brodés pour des nuits raffinées.", "أطقم ساتان ومطرزة لليالي راقية.")),
  cat("cat-womens-pajamas", "womens-pajamas", "pajamas", "Women's Pajamas", "Pyjamas femme", "بيجامات نسائية", 2,
    t("Everyday comfort in soft cotton and modal blends.", "Le confort de tous les jours en coton doux et modal.", "راحة يومية بأقمشة قطنية ناعمة.")),
  cat("cat-homewear", "homewear", "pajamas", "Homewear", "Vêtements d'intérieur", "ملابس منزلية", 3,
    t("Relaxed robes, kimonos and lounge essentials.", "Robes, kimonos et essentiels de détente.", "روب وكيمونو وملابس استرخاء.")),
  cat("cat-seasonal-pajamas", "seasonal-pajamas", "pajamas", "Seasonal Collections", "Collections saisonnières", "مجموعات موسمية", 4,
    t("Winter fleece and summer light-weight seasonal drops.", "Collections hiver polaire et été légères.", "مجموعات شتوية وصيفية.")),

  cat("cat-womens-clothing", "womens-clothing", "clothing", "Women's Clothing", "Vêtements femme", "ملابس نسائية", 5,
    t("Dresses, abayas, blouses and tailored essentials.", "Robes, abayas, blouses et essentiels.", "فساتين وعبايات وبلوزات.")),
  cat("cat-homewear-clothing", "homewear-clothing", "clothing", "Homewear", "Homewear", "ملابس منزلية", 6,
    t("Refined at-home dressing that still feels dressed.", "Tenues maison raffinées.", "ملابس منزلية أنيقة.")),
  cat("cat-fashion-sets", "fashion-sets", "clothing", "Fashion Sets", "Ensembles mode", "أطقم عصرية", 7,
    t("Coordinated two- and three-piece sets, ready to retail.", "Ensembles coordonnés deux et trois pièces.", "أطقم منسقة جاهزة للبيع.")),
  cat("cat-new-collections", "new-collections", "clothing", "New Collections", "Nouvelles collections", "مجموعات جديدة", 8,
    t("The latest arrivals, restocked weekly.", "Les dernières arrivées, réapprovisionnées chaque semaine.", "أحدث الوصولات أسبوعياً.")),
];

const SIZES_APPAREL = ["S", "M", "L", "XL", "XXL"];
const SIZES_ONE = ["Standard"];

interface SeedProductInput {
  code: string;
  name: string;
  fr: string;
  ar: string;
  categoryId: string;
  description: string;
  price: number | null;
  moq: number;
  sizes: string[];
  colors: [string, string][];
  isNew?: boolean;
  isBest?: boolean;
  isFeatured?: boolean;
  ageDays: number;
  /** Optional demo starting stock; defaults to 60 pieces. */
  stock?: number;
}

const seedInputs: SeedProductInput[] = [
  {
    code: "ALX-PJ-101", name: "Rose Satin Pyjama Set", fr: "Ensemble pyjama satin rose", ar: "طقم بيجامة ساتان وردي",
    categoryId: "cat-luxury-pajamas", price: 4200, moq: 12, sizes: SIZES_APPAREL,
    colors: [["Bordeaux", "#6E1529"], ["Ivory", "#F4E3C1"], ["Blush", "#D9A7AE"]],
    description: "Satin-touch two-piece with piped collar and mother-of-pearl buttons. Packed in retail-ready polybags, six sizes per carton.",
    isNew: true, isBest: true, isFeatured: true, ageDays: 6,
  },
  {
    code: "ALX-PJ-102", name: "Silk-Touch Long Robe", fr: "Robe longue effet soie", ar: "روب طويل بملمس الحرير",
    categoryId: "cat-luxury-pajamas", price: 5300, moq: 8, sizes: SIZES_APPAREL,
    colors: [["Wine", "#7A1B2E"], ["Champagne", "#E0C68F"], ["Noir", "#2A0610"]],
    description: "Floor-length robe with belt and side seam pockets. Available with matching nightdress on request.",
    isBest: true, isFeatured: true, ageDays: 21,
  },
  {
    code: "ALX-PJ-103", name: "Embroidered Cotton Pyjama", fr: "Pyjama coton brodé", ar: "بيجامة قطنية مطرزة",
    categoryId: "cat-womens-pajamas", price: 3100, moq: 18, sizes: SIZES_APPAREL,
    colors: [["Ivory", "#F4E3C1"], ["Powder", "#E4B3BE"], ["Sage", "#A8AFA0"]],
    description: "Breathable combed cotton with tonal chest embroidery. Our most requested everyday line.",
    isBest: true, ageDays: 40,
  },
  {
    code: "ALX-PJ-104", name: "Modal Soft Lounge Set", fr: "Ensemble détente modal", ar: "طقم لاونج مودال",
    categoryId: "cat-womens-pajamas", price: 3600, moq: 12, sizes: SIZES_APPAREL,
    colors: [["Stone", "#CFC5B8"], ["Wine", "#6E1529"]],
    description: "Stretch modal blend with relaxed leg and elasticated waist. Restocked every three weeks.",
    isBest: true, ageDays: 55,
  },
  {
    code: "ALX-HM-201", name: "Kimono Homewear Robe", fr: "Robe kimono homewear", ar: "روب كيمونو منزلي",
    categoryId: "cat-homewear", price: 4800, moq: 10, sizes: SIZES_APPAREL,
    colors: [["Bordeaux", "#7A1B2E"], ["Gold", "#C4A05A"]],
    description: "Wide-sleeve kimono cut with a jacquard border. A strong boutique display piece.",
    isFeatured: true, ageDays: 33,
  },
  {
    code: "ALX-HM-202", name: "Ribbed Knit Home Set", fr: "Ensemble maison maille côtelée", ar: "طقم منزلي تريكو مضلع",
    categoryId: "cat-homewear", price: 3900, moq: 12, sizes: SIZES_APPAREL,
    colors: [["Cream", "#F4E3C1"], ["Mocha", "#8A6A5B"]],
    description: "Two-piece rib knit with soft-touch finish. Ships flat-packed, five per bundle.",
    isNew: true, ageDays: 9,
  },
  {
    code: "ALX-SN-301", name: "Winter Fleece Pyjama", fr: "Pyjama polaire hiver", ar: "بيجامة شتوية صوف",
    categoryId: "cat-seasonal-pajamas", price: 4400, moq: 15, sizes: SIZES_APPAREL,
    colors: [["Rust", "#9E4A3A"], ["Deep Wine", "#5A0F20"], ["Charcoal", "#3B3336"]],
    description: "Brushed fleece interior with cuffed ankle. Pre-order line, delivered in seasonal waves.",
    isBest: true, ageDays: 70,
  },
  {
    code: "ALX-SN-302", name: "Summer Cotton Nightdress", fr: "Nuisette coton été", ar: "قميص نوم صيفي",
    categoryId: "cat-seasonal-pajamas", price: 2400, moq: 24, sizes: SIZES_ONE,
    colors: [["White", "#FFFFFF"], ["Powder", "#E4B3BE"], ["Sand", "#DFC28A"]],
    description: "Lightweight voile nightdress with adjustable straps. High-volume summer line.",
    isNew: true, ageDays: 4,
  },
  {
    code: "ALX-CL-401", name: "Tailored Wide-Leg Set", fr: "Ensemble large jambe", ar: "طقم بنطال واسع",
    categoryId: "cat-womens-clothing", price: 6200, moq: 8, sizes: SIZES_APPAREL,
    colors: [["Camel", "#B98F5F"], ["Bordeaux", "#6E1529"], ["Ivory", "#F4E3C1"]],
    description: "Structured blazer-shirt with wide-leg trouser. Fully finished, ready to hang.",
    isFeatured: true, isBest: true, ageDays: 26,
  },
  {
    code: "ALX-CL-402", name: "Draped Satin Blouse", fr: "Blouse satin drapée", ar: "بلوزة ساتان",
    categoryId: "cat-womens-clothing", price: 2800, moq: 20, sizes: SIZES_APPAREL,
    colors: [["Ivory", "#F4E3C1"], ["Wine", "#7A1B2E"], ["Gold", "#C4A05A"]],
    description: "Fluid satin blouse with concealed placket. Packed six per size, five sizes per carton.",
    ageDays: 48,
  },
  {
    code: "ALX-CL-403", name: "Embroidered Abaya", fr: "Abaya brodée", ar: "عباية مطرزة",
    categoryId: "cat-womens-clothing", price: null, moq: 10, sizes: SIZES_APPAREL,
    colors: [["Noir", "#2A0610"], ["Bordeaux", "#5A0F20"], ["Stone", "#CFC5B8"]],
    description: "Open-front abaya with hand-finished embroidery at the cuff. Price quoted per collection by volume.",
    isNew: true, isFeatured: true, ageDays: 12,
  },
  {
    code: "ALX-HC-501", name: "Loungewear Knit Co-ord", fr: "Ensemble homewear maille", ar: "طقم منزلي تريكو",
    categoryId: "cat-homewear-clothing", price: 4100, moq: 12, sizes: SIZES_APPAREL,
    colors: [["Oat", "#E0C68F"], ["Wine", "#6E1529"]],
    description: "Soft knit co-ord with dropped shoulder. Designed for at-home styling that still photographs well.",
    isNew: true, ageDays: 7,
  },
  {
    code: "ALX-FS-601", name: "Three-Piece Fashion Set", fr: "Ensemble mode 3 pièces", ar: "طقم ثلاثي",
    categoryId: "cat-fashion-sets", price: 7400, moq: 6, sizes: SIZES_APPAREL,
    colors: [["Bordeaux", "#6E1529"], ["Camel", "#B98F5F"]],
    description: "Vest, blouse and trouser in matching fabric. Our highest-margin boutique set.",
    isBest: true, isFeatured: true, ageDays: 30,
  },
  {
    code: "ALX-FS-602", name: "Two-Piece Satin Set", fr: "Ensemble satin 2 pièces", ar: "طقم ساتان ثنائي",
    categoryId: "cat-fashion-sets", price: 5200, moq: 10, sizes: SIZES_APPAREL,
    colors: [["Champagne", "#E0C68F"], ["Blush", "#D9A7AE"], ["Noir", "#2A0610"]],
    description: "Camisole and palazzo trouser set with a satin drape. Consistent best-seller for spring.",
    isNew: true, isBest: true, ageDays: 11,
  },
  {
    code: "ALX-NC-701", name: "Oversized Shirt Dress", fr: "Robe chemise oversize", ar: "فستان قميص واسع",
    categoryId: "cat-new-collections", price: 4600, moq: 12, sizes: SIZES_APPAREL,
    colors: [["Ivory", "#F4E3C1"], ["Stone", "#CFC5B8"], ["Wine", "#6E1529"]],
    description: "Relaxed poplin shirt dress with removable belt. New for this season.",
    isNew: true, ageDays: 3,
  },
  {
    code: "ALX-NC-702", name: "Pleated Midi Skirt Set", fr: "Ensemble jupe plissée", ar: "طقم تنورة مطوية",
    categoryId: "cat-new-collections", price: 5900, moq: 8, sizes: SIZES_APPAREL,
    colors: [["Gold", "#C4A05A"], ["Bordeaux", "#6A1226"]],
    description: "Fine-pleat midi skirt with a knit companion top. Limited first run.",
    isNew: true, ageDays: 2,
  },
];

export const defaultProducts: Product[] = seedInputs.map((input, index) => {
  const id = `prd-${input.code.toLowerCase()}`;
  return {
    id,
    slug: `${input.code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    code: input.code,
    name: t(input.name, input.fr, input.ar),
    categoryId: input.categoryId,
    description: {
      primary: input.description,
      en: input.description,
      fr: input.description,
      ar: input.description,
    },
    price: input.price,
    minOrderQty: input.moq,
    sizes: input.sizes,
    colors: input.colors.map(([name, hex], i) => ({ id: `${id}-c${i}`, name, hex })),
    images: [],
    mainImageId: null,
    isNew: Boolean(input.isNew),
    isBestSeller: Boolean(input.isBest),
    isFeatured: Boolean(input.isFeatured),
    active: true,
    createdAt: new Date(Date.now() - input.ageDays * 86400000 - index * 3600000).toISOString(),
    badge: "",
    // Demo stock so the dashboard shows a real inventory workflow from day one.
    stock: input.stock ?? 60,
    videoUrl: null,
    order: index + 1,
  };
});

export const defaultDatabase: Database = {
  settings: {
    ...defaultSettings,
    featuredProductIds: defaultProducts.filter((p) => p.isFeatured).map((p) => p.id),
    newArrivalIds: defaultProducts.filter((p) => p.isNew).map((p) => p.id),
    bestSellerIds: defaultProducts.filter((p) => p.isBestSeller).map((p) => p.id),
  },
  categories: defaultCategories,
  products: defaultProducts,
  requests: [],
  // Testimonials and FAQ ship empty on purpose: they are the owner's own words
  // about their own customers, so inventing them would be misleading.
  testimonials: [],
  faq: [],
  media: [],
};
