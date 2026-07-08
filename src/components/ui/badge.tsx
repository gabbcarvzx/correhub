import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { type HTMLAttributes } from "react"

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-brand-50 text-brand-700",
        secondary: "bg-surface-solid text-fg-secondary border border-border",
        outline: "border border-border-strong text-fg-secondary bg-transparent",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        error: "bg-error-soft text-error",
      },
      size: {
        sm: "px-2 py-0.5 text-xs gap-1",
        md: "px-2.5 py-0.5 text-sm gap-1.5",
        lg: "px-3 py-1 text-base gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
