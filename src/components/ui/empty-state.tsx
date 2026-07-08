"use client"

import { motion } from "motion/react"
import { type ReactNode, type ComponentType } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
  className?: string
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn("flex flex-col items-center justify-center gap-4 py-16 text-center", className)}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/20">
        <Icon className="h-6 w-6 text-muted" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}

export { EmptyState }
