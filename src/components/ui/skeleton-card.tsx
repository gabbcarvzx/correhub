"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"

type SkeletonCardProps = HTMLAttributes<HTMLDivElement>

function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <div
      className={cn("glass-panel rounded-xl p-6 space-y-4", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-3/5" />
          <Skeleton variant="text" className="w-2/5 h-3" />
        </div>
      </div>
      <Skeleton variant="card" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-4/5" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton variant="button" className="w-24" />
        <Skeleton variant="button" className="w-24" />
      </div>
    </div>
  )
}

export { SkeletonCard }
