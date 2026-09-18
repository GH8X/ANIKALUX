import type { ReactNode } from "react";
import { Card, Separator } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      <Separator className="my-5" />
      {children}
    </Card>
  );
}

/** A labelled control with an optional hint line underneath. */
export function FieldRow({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-[0.72rem] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Small square toggle used for visibility/enabled flags. */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
        checked ? "border-primary/40 bg-primary" : "border-border bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute size-4 rounded-full bg-card shadow-soft transition-all",
          checked ? "start-[1.6rem]" : "start-1",
        )}
      />
    </button>
  );
}

/** Reorder control shared by every ordered collection. */
export function MoveButtons({
  onMove,
  upLabel,
  downLabel,
  canUp = true,
  canDown = true,
}: {
  onMove: (direction: "up" | "down") => void;
  upLabel: string;
  downLabel: string;
  canUp?: boolean;
  canDown?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={upLabel}
        title={upLabel}
        disabled={!canUp}
        onClick={() => onMove("up")}
        className="grid size-7 place-items-center rounded-sm border border-border/70 bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
      >
        ↑
      </button>
      <button
        type="button"
        aria-label={downLabel}
        title={downLabel}
        disabled={!canDown}
        onClick={() => onMove("down")}
        className="grid size-7 place-items-center rounded-sm border border-border/70 bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
      >
        ↓
      </button>
    </div>
  );
}
