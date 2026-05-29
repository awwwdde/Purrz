import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

// Roofix-style: closed rounded, мягкий lift при hover, без offset-shadow
const variants: Record<Variant, string> = {
  primary:
    "bg-ink-950 text-white border border-ink-950 hover:bg-ink-900 hover:shadow-soft",
  secondary:
    "bg-accent text-white border border-accent hover:bg-accent-dark hover:shadow-soft",
  outline:
    "bg-white text-ink-950 border border-ink-200 hover:border-ink-950 hover:shadow-brutal-sm",
  ghost:
    "bg-transparent text-ink-700 border border-transparent hover:bg-ink-100 hover:text-ink-950",
  danger:
    "bg-signal-red text-white border border-signal-red hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm rounded-[10px]",
  md: "px-5 py-2.5 text-base rounded-[12px]",
  lg: "px-7 py-3.5 text-base rounded-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth,
      className,
      children,
      iconLeft,
      iconRight,
      ...rest
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-display font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {iconLeft}
        {children}
        {iconRight}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
