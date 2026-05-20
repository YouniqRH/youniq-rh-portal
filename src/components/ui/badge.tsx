import { cn } from "@/lib/utils";

export function Badge({ status, children, className }: { status?: string; children: React.ReactNode; className?: string }) {
  return <span className={cn("badge", status && `badge-${status}`, className)}>{children}</span>;
}

export function Tag({ variant = "default", children, className }: { variant?: "default" | "purple" | "gold" | "danger"; children: React.ReactNode; className?: string }) {
  return <span className={cn("tag", variant !== "default" && `tag-${variant}`, className)}>{children}</span>;
}
