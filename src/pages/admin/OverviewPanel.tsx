import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, LayoutGrid, Sparkles, Star } from "lucide-react";
import { Badge, Card, Separator } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export function OverviewPanel({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { t, tx, locale } = useI18n();
  const { products, categories, requests } = useStore();

  const stats = useMemo(
    () => [
      {
        key: "products",
        icon: Layers,
        label: t.admin.statProducts,
        value: products.filter((p) => p.active).length,
      },
      { key: "categories", icon: LayoutGrid, label: t.admin.statCategories, value: categories.length },
      {
        key: "requests",
        icon: Sparkles,
        label: t.admin.statRequests,
        value: requests.filter((r) => r.status === "new").length,
      },
      {
        key: "best",
        icon: Star,
        label: t.admin.statBest,
        value: products.filter((p) => p.isBestSeller).length,
      },
    ],
    [products, categories, requests, t],
  );

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.key} className="p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
                <stat.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="font-display text-3xl font-semibold">{stat.value}</p>
            </div>
            <p className="mt-4 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold">{t.admin.requests}</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("requests")}>
              {t.home.viewAll}
              <ArrowRight className="rtl:rotate-180" />
            </Button>
          </div>
          <Separator className="my-4" />

          {recentRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t.admin.noRequestsHint}</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentRequests.map((request) => (
                <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{request.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {request.businessName} · {request.wilaya}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={request.status === "new" ? "info" : "muted"}>
                      {request.status === "new" ? t.admin.statusNew : request.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(request.createdAt, locale)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">{t.admin.categories}</h2>
          <Separator className="my-4" />
          <ul className="space-y-2.5">
            {categories.slice(0, 8).map((category) => (
              <li key={category.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{tx(category.name)}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {products.filter((p) => p.categoryId === category.id).length}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => onNavigate("categories")}>
            {t.admin.tabCategories}
          </Button>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">{t.products.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.products.subtitle}</p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/products" target="_blank" rel="noopener noreferrer">
            {t.card.quickView}
            <ArrowRight className="rtl:rotate-180" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
