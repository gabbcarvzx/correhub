"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { forwardRef, type ElementRef, type ComponentPropsWithoutRef } from "react"

const separatorVariants = cva(
  "shrink-0 bg-border",
  {
    variants: {
      orientation: {
        horizontal: "h-px w-full",
        vertical: "h-full w-px",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

interface SeparatorProps
  extends Omit<ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, "orientation">,
    VariantProps<typeof separatorVariants> {}

const Separator = forwardRef<ElementRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
  ({ className, orientation, decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={(orientation ?? "horizontal") as "horizontal" | "vertical"}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator, separatorVariants }
