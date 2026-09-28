import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const inputContainerClasses = "w-full flex flex-col gap-1.5";
const labelClasses = "text-xs font-medium text-neutral-300 select-none";
const helperClasses = "text-xs text-neutral-500";
const errorClasses = "text-xs text-red-400";

const inputFieldVariants = cva(
  "w-full rounded-lg bg-surface px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 border transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      hasError: {
        true: "border-red-500/50 focus-visible:border-red-400 focus-visible:ring-red-500/30",
        false: "border-white/10 hover:border-white/20 focus-visible:border-neutral-400 focus-visible:ring-neutral-400/20",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

export function Input({
  id,
  label,
  error,
  helperText,
  className,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={inputContainerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(inputFieldVariants({ hasError: Boolean(error) }), className)}
        {...props}
      />
      {error && <p className={errorClasses}>{error}</p>}
      {!error && helperText && <p className={helperClasses}>{helperText}</p>}
    </div>
  );
}
