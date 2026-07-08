import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type ElementRef, type HTMLAttributes } from "react"

const cardVariants = cva(
  "rounded-xl transition-all duration-200",
  {
    variants: {
      variant: {
        default: "glass-panel",
        elevated: "bg-surface-solid border border-border shadow-md hover:shadow-lg",
        bordered: "bg-transparent border border-border-strong",
        ghost: "bg-transparent border-none shadow-none",
        interactive:
          "glass-panel cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:border-border-strong",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<ElementRef<"div">, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
)
Card.displayName = "Card"

const CardHeader = forwardRef<ElementRef<"div">, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<ElementRef<"h3">, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<ElementRef<"p">, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<ElementRef<"div">, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<ElementRef<"div">, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
