import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-[#e1d8c2] bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/15 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("block text-xs font-semibold text-ink-muted mb-1", className)}>
      {children}
    </label>
  );
}

export function Field(props: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input id={props.name} {...props} />
    </div>
  );
}
