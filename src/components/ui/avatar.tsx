"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { forwardRef, type ElementRef, type ComponentPropsWithoutRef } from "react"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-base",
        xl: "h-20 w-20 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface AvatarProps
  extends ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  ring?: boolean
}

const Avatar = forwardRef<ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size, ring, ...props }, ref) => (
    <span
      className={cn(
        "relative inline-flex shrink-0",
        ring && "rounded-full ring-2 ring-brand-500 ring-offset-2 ring-offset-bg"
      )}
    >
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      />
    </span>
  )
)
Avatar.displayName = "Avatar"

const AvatarImage = forwardRef<
  ElementRef<typeof AvatarPrimitive.Image>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = forwardRef<
  ElementRef<typeof AvatarPrimitive.Fallback>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-brand-50 text-brand-700 font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }
