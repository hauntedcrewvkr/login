import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const cardVariants = cva(
  "rounded-xl border transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-surface border-white/10 shadow-lg shadow-black/40",
        elevated: "bg-surface-elevated border-white/15 shadow-xl shadow-black/60",
        ghost: "bg-transparent border-transparent",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export function Card({
  className,
  variant,
  padding,
  children,
  ...props
}) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1.5 pb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn("text-xl font-semibold tracking-tight text-neutral-100", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm text-neutral-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("flex items-center justify-between pt-6 border-t border-white/5", className)}
      {...props}
    >
      {children}
    </div>
  );
}
