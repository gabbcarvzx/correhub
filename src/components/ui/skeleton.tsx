import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "avatar" | "button"
}

function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  const shape =
    variant === "text"
      ? "h-4 w-full rounded-md"
      : variant === "card"
        ? "h-40 w-full rounded-xl"
        : variant === "avatar"
          ? "h-10 w-10 rounded-full"
          : "h-10 w-24 rounded-lg"

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-muted/10 via-muted/20 to-muted/10 bg-[length:200%_100%]",
        shape,
        className
      )}
      style={{ animation: "shimmer 2s linear infinite" }}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
