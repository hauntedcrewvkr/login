import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-neutral-900 text-neutral-300",
        success: "border-emerald-500/20 bg-emerald-950/60 text-emerald-300",
        warning: "border-amber-500/20 bg-amber-950/60 text-amber-300",
        danger: "border-red-500/20 bg-red-950/60 text-red-300",
        neutral: "border-white/5 bg-surface text-neutral-400",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export function Badge({ className, variant, size, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
