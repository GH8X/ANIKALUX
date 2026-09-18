import { AlertTriangle, Inbox, PackageSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, hint, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("flex flex-col items-center gap-4 px-6 py-16 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        {hint && <p className="mx-auto max-w-md text-sm text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </Card>
  );
}

export function ErrorState({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={AlertTriangle}
      title={t.products.errorTitle}
      hint={t.products.errorHint}
      className={className}
      action={
        onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            {t.states.retry}
          </Button>
        ) : null
      }
    />
  );
}

export function NoResultsState({ onClear, className }: { onClear?: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={PackageSearch}
      title={t.products.emptyTitle}
      hint={t.products.emptyHint}
      className={className}
      action={
        onClear ? (
          <Button variant="secondary" onClick={onClear}>
            {t.products.clear}
          </Button>
        ) : null
      }
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
