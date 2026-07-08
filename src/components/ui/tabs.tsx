"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { forwardRef, type ElementRef, type ComponentPropsWithoutRef } from "react"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center",
  {
    variants: {
      variant: {
        underline: "border-b border-border gap-0",
        pills: "gap-1 rounded-lg bg-surface p-1",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
)

interface TabsListProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
)
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        underline:
          "px-4 py-2.5 -mb-px border-b-2 border-transparent text-muted hover:text-fg data-[state=active]:border-brand-500 data-[state=active]:text-brand-500",
        pills:
          "px-3 py-1.5 rounded-md text-muted hover:text-fg data-[state=active]:bg-surface-solid data-[state=active]:text-fg data-[state=active]:shadow-sm",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
)

interface TabsTriggerProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

type TabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
