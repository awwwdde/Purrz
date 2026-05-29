import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "default" | "brutal" | "ghost" | "dark";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  interactive?: boolean;
}

// Roofix-style: тонкая 1px рамка, мягкие тени, без жирных offset shadows
const variants: Record<Variant, string> = {
  default: "bg-white border border-ink-200 shadow-brutal-sm",
  brutal: "bg-white border border-ink-200 shadow-brutal",
  ghost: "bg-ink-50 border border-ink-200",
  dark: "bg-ink-950 text-white border border-ink-950",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", interactive, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-card p-6 transition-all duration-300",
        variants[variant],
        interactive &&
          "hover:-translate-y-1 hover:shadow-lift cursor-pointer",
        className,
      )}
      {...rest}
    />
  ),
);
Card.displayName = "Card";
