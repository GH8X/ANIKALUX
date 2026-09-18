import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LogOut, Store } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/surface";
import { OverviewPanel } from "@/pages/admin/OverviewPanel";
import { ProductsPanel } from "@/pages/admin/ProductsPanel";
import { CategoriesPanel } from "@/pages/admin/CategoriesPanel";
import { RequestsPanel } from "@/pages/admin/RequestsPanel";
import { BrandPanel } from "@/pages/admin/BrandPanel";
import { HomepagePanel } from "@/pages/admin/HomepagePanel";
import { FaqPanel, MediaPanel, TestimonialsPanel } from "@/pages/admin/ContentPanels";
import { LocationPanel, SeoPanel, SocialPanel } from "@/pages/admin/SitePanels";
import { SettingsPanel } from "@/pages/admin/SettingsPanel";
import { PreviewPanel } from "@/pages/admin/PreviewPanel";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type TabKey =
  | "overview"
  | "products"
  | "categories"
  | "homepage"
  | "media"
  | "requests"
  | "testimonials"
  | "faq"
  | "social"
  | "location"
  | "seo"
  | "settings"
  | "preview"
  | "brand";

const TAB_KEYS: TabKey[] = [
  "overview",
  "products",
  "categories",
  "homepage",
  "media",
  "requests",
  "testimonials",
  "faq",
  "social",
  "location",
  "seo",
  "settings",
  "preview",
  "brand",
];

export function AdminDashboard() {
  const { t } = useI18n();
  const { settings, signOut, requests } = useStore();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") as TabKey | null;
  const tabFromUrl: TabKey = requested && TAB_KEYS.includes(requested) ? requested : "overview";
  const [tab, setTab] = useState<TabKey>(tabFromUrl);

  useEffect(() => {
    setTab(tabFromUrl);
  }, [tabFromUrl]);

  const goTo = (next: string) => {
    const key = next as TabKey;
    setTab(key);
    const params2 = new URLSearchParams(params);
    params2.set("tab", key);
    setParams(params2, { replace: true });
  };

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "overview", label: t.admin.tabOverview },
    { key: "products", label: t.admin.tabProducts },
    { key: "categories", label: t.admin.tabCategories },
    { key: "homepage", label: t.admin.tabHomepage },
    { key: "media", label: t.admin.tabMedia },
    {
      key: "requests",
      label: t.admin.tabRequests,
      badge: requests.filter((r) => r.status === "new" && !r.archived).length || undefined,
    },
    { key: "testimonials", label: t.admin.tabTestimonials },
    { key: "faq", label: t.admin.tabFaq },
    { key: "social", label: t.admin.tabSocial },
    { key: "location", label: t.admin.tabLocation },
    { key: "seo", label: t.admin.tabSeo },
    { key: "settings", label: t.admin.tabSettings },
    { key: "preview", label: t.admin.tabPreview },
    { key: "brand", label: t.admin.tabBrand },
  ];

  return (
    <>
      <Seo title={`${t.admin.title} | ${settings.brand.name}`} description={t.admin.subtitle} noindex />

      <div className="border-b border-border/70 bg-wine-900 text-cream-100">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3.5">
            <Logo size="md" className="rounded-md bg-cream-100/5 p-1" />
            <div>
              <h1 className="font-display text-xl font-semibold">{t.admin.title}</h1>
              <p className="text-xs text-cream-100/65">{t.admin.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="cream" size="sm">
              <Link to="/">
                <Store /> {t.admin.backToSite}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-cream-100/80 hover:bg-white/10 hover:text-cream-100"
            >
              <LogOut /> {t.admin.signOut}
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:top-20">
        <div className="container">
          <nav className="no-scrollbar -mb-px flex gap-1 overflow-x-auto" aria-label={t.admin.title}>
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.key)}
                aria-current={tab === item.key}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-4 text-sm font-medium transition-colors",
                  tab === item.key
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {item.badge ? (
                  <Badge variant="primary" className="px-1.5 py-0 text-[0.6rem]">
                    {item.badge}
                  </Badge>
                ) : null}
                {tab === item.key && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-gold-400 to-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container py-8 sm:py-10">
        {tab === "overview" && <OverviewPanel onNavigate={goTo} />}
        {tab === "products" && <ProductsPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "homepage" && <HomepagePanel />}
        {tab === "media" && <MediaPanel />}
        {tab === "requests" && <RequestsPanel />}
        {tab === "testimonials" && <TestimonialsPanel />}
        {tab === "faq" && <FaqPanel />}
        {tab === "social" && <SocialPanel />}
        {tab === "location" && <LocationPanel />}
        {tab === "seo" && <SeoPanel />}
        {tab === "settings" && <SettingsPanel />}
        {tab === "preview" && <PreviewPanel />}
        {tab === "brand" && <BrandPanel />}
      </div>
    </>
  );
}
