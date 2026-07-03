import { cn } from "@/lib/utils";

export function Badge({
  children,
  className
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-strong)]",
        className
      )}
    >
      {children}
    </span>
  );
}
