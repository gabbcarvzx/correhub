"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type ElementRef, type InputHTMLAttributes } from "react"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border hover:border-border-strong",
        ghost: "border-transparent bg-surface hover:bg-surface-solid",
      },
      inputSize: {
        sm: "h-8 text-xs px-2",
        md: "h-10 text-sm px-3",
        lg: "h-12 text-base px-4",
      },
      hasError: {
        true: "border-error focus-visible:ring-error",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
      hasError: false,
    },
  }
)

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  hasError?: boolean
}

const Input = forwardRef<ElementRef<"input">, InputProps>(
  ({ className, variant, inputSize, hasError, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, hasError, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
