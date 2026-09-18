import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border/70 bg-card text-card-foreground shadow-soft", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-5 sm:p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-display text-xl font-semibold leading-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors",
  {
    variants: {
      variant: {
        primary: "border-primary/20 bg-primary text-primary-foreground",
        cream: "border-gold-500/35 bg-cream-100 text-wine-800",
        gold: "border-gold-500/45 bg-gold-500/15 text-gold-700",
        outline: "border-border bg-card/70 text-muted-foreground",
        wine: "border-wine-700/25 bg-wine-50 text-wine-700",
        success: "border-emerald-600/25 bg-emerald-600/10 text-emerald-800",
        info: "border-sky-600/25 bg-sky-600/10 text-sky-800",
        warning: "border-amber-600/30 bg-amber-500/15 text-amber-800",
        muted: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn("h-px w-full bg-border", className)} {...props} />;
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("skeleton rounded-md", className)} {...props} />;
}
