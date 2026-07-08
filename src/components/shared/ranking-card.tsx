import { Card } from "@/components/ui/card"
import { MotionDiv, staggerItem } from "@/components/ui/motion-wrapper"
import { cn } from "@/lib/utils"

interface RankingCardProps {
  entry: {
    position: number
    name: string
    group: string
    attendances: number
    km: number
  }
}

const medalColors: Record<number, string> = {
  1: "bg-[#f59e0b] text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]",
  2: "bg-[#94a3b8] text-white shadow-[0_0_12px_rgba(148,163,184,0.4)]",
  3: "bg-[#d97706] text-white shadow-[0_0_12px_rgba(217,119,6,0.4)]",
}

export function RankingCard({ entry }: RankingCardProps) {
  return (
    <MotionDiv variants={staggerItem}>
      <Card variant="elevated" className="flex items-center justify-between gap-4 border border-border p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
              entry.position <= 3
                ? medalColors[entry.position]
                : "bg-surface-solid text-fg-secondary"
            )}
          >
            {entry.position}
          </span>
          <div>
            <p className="text-lg font-bold">{entry.name}</p>
            <p className="text-sm text-fg-secondary">{entry.group}</p>
          </div>
        </div>
        <div className="text-right text-sm text-fg-secondary">
          <p>{entry.attendances} presenças</p>
          <p>{entry.km} km</p>
        </div>
      </Card>
    </MotionDiv>
  )
}
