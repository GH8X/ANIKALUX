import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  align?: "start" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  align = "start",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <p className="eyebrow">
            <span aria-hidden="true" className="h-px w-6 bg-gold-500/70" />
            {eyebrow}
          </p>
        )}
        <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
