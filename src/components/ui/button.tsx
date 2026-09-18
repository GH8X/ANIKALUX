import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-medium tracking-wide transition-all duration-300 ease-luxe disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:bg-wine-800 hover:shadow-card active:translate-y-px",
        gold: "bg-gradient-to-r from-gold-500 to-gold-400 text-wine-900 shadow-soft hover:from-gold-400 hover:to-gold-300 hover:shadow-card active:translate-y-px",
        secondary:
          "border border-primary/25 bg-secondary text-secondary-foreground hover:border-primary/50 hover:bg-wine-50",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/45 hover:bg-secondary",
        cream: "bg-cream-100 text-wine-900 shadow-soft hover:bg-cream-200",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4 text-[0.8rem] [&_svg]:size-4",
        md: "h-11 px-6 text-sm [&_svg]:size-4",
        lg: "h-12 px-7 text-[0.9rem] [&_svg]:size-5 sm:h-[3.25rem] sm:px-9",
        icon: "h-10 w-10 [&_svg]:size-5",
        "icon-sm": "h-8 w-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
