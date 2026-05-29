import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "default" | "accent" | "dark" | "success" | "danger" | "info" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

// Roofix-style: pill бейджи на tinted background, без жирных рамок
const tones: Record<Tone, string> = {
  default: "bg-ink-100 text-ink-800",
  accent: "bg-accent-soft text-accent-dark",
  dark: "bg-ink-950 text-white",
  success: "bg-accent-soft text-accent-dark",
  danger: "bg-signal-red/10 text-signal-red",
  info: "bg-signal-blue/10 text-signal-blue",
  warning: "bg-signal-yellow/15 text-signal-yellow",
};

export function Badge({ tone = "default", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-pill font-display whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
