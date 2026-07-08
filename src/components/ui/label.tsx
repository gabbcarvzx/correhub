"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as LabelPrimitive from "@radix-ui/react-label"
import { forwardRef, type ElementRef, type ComponentPropsWithoutRef } from "react"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      hasError: {
        true: "text-error",
        false: "text-fg",
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
)

interface LabelProps
  extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}

const Label = forwardRef<ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, hasError, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants({ hasError }), className)}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label, labelVariants }
