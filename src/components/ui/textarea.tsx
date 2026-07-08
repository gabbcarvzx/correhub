"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type ElementRef, type TextareaHTMLAttributes } from "react"

const textareaVariants = cva(
  "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border hover:border-border-strong",
        ghost: "border-transparent bg-surface hover:bg-surface-solid",
      },
      textareaSize: {
        sm: "text-xs px-2 py-1.5",
        md: "text-sm px-3 py-2",
        lg: "text-base px-4 py-3",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        both: "resize",
      },
      hasError: {
        true: "border-error focus-visible:ring-error",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "md",
      resize: "vertical",
      hasError: false,
    },
  }
)

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  hasError?: boolean
}

const Textarea = forwardRef<ElementRef<"textarea">, TextareaProps>(
  ({ className, variant, textareaSize, resize, hasError, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, textareaSize, resize, hasError, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
