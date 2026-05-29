import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const fieldBase =
  "w-full px-4 py-3 rounded-[12px] border border-ink-200 bg-white text-ink-950 placeholder:text-ink-400 focus:outline-none focus:border-accent focus:shadow-ring transition-all duration-150 disabled:bg-ink-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="block text-sm font-semibold text-ink-700 mb-1.5 font-display">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(fieldBase, error && "border-signal-red", className)}
          {...rest}
        />
        {error && (
          <span className="block text-xs text-signal-red mt-1.5 font-medium">{error}</span>
        )}
        {!error && hint && (
          <span className="block text-xs text-ink-500 mt-1.5">{hint}</span>
        )}
      </label>
    );
  },
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="block text-sm font-semibold text-ink-700 mb-1.5 font-display">
            {label}
          </span>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            "w-full px-4 py-3 rounded-[12px] border border-ink-200 bg-white text-ink-950 placeholder:text-ink-400 focus:outline-none focus:border-accent focus:shadow-ring transition-all duration-150 resize-none",
            error && "border-signal-red",
            className,
          )}
          {...rest}
        />
        {error && (
          <span className="block text-xs text-signal-red mt-1.5 font-medium">{error}</span>
        )}
        {!error && hint && (
          <span className="block text-xs text-ink-500 mt-1.5">{hint}</span>
        )}
      </label>
    );
  },
);
Textarea.displayName = "Textarea";
