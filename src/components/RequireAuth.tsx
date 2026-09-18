import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/surface";

/**
 * Protects the dashboard. Signed-out visitors are sent to /auth with the
 * requested path preserved so they land back where they intended.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAdmin, status } = useStore();
  const { t } = useI18n();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="container section space-y-4" aria-busy="true" aria-label={t.states.loading}>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <>{children}</>;
}
