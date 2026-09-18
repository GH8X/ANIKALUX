import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/States";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function NotFound() {
  const { t } = useI18n();
  const { settings } = useStore();

  return (
    <>
      <Seo title={`404 | ${settings.brand.name}`} description={t.products.notFoundHint} noindex />
      <div className="container section">
        <EmptyState
          icon={Compass}
          title="404 — Not found"
          hint={t.products.notFoundHint}
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/products">{t.products.backToCatalogue}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">{t.nav.home}</Link>
              </Button>
            </div>
          }
        />
      </div>
    </>
  );
}
