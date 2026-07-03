import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return <div className={cn("glass-panel rounded-[var(--radius-md)] p-5", className)}>{children}</div>;
}
