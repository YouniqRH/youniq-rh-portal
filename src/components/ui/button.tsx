import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-purple text-white hover:bg-brand-purple-700",
        ghost:   "bg-surface-2 text-ink border border-[#ece5d4] hover:bg-brand-cream hover:text-brand-purple",
        danger:  "bg-white text-danger border border-[#f0c5c5] hover:bg-[#fbe7e7]",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
