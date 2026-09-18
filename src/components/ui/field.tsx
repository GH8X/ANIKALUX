import * as LabelPrimitive from "@radix-ui/react-label";
import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-md border border-input bg-card px-3.5 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(64,10,23,.04)] transition-colors duration-200 placeholder:text-muted-foreground/70 focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(baseField, "h-11", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(baseField, "py-3 leading-relaxed", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          baseField,
          "h-11 cursor-pointer appearance-none bg-card pe-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  ),
);
Select.displayName = "Select";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "flex items-center gap-2 text-[0.78rem] font-medium uppercase tracking-[0.09em] text-foreground/75",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-destructive">{children}</p>;
}
