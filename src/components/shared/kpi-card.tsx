import { Card } from "@/components/ui/card"
import { MotionDiv } from "@/components/ui/motion-wrapper"

export function KpiCard({
  label,
  value
}: Readonly<{
  label: string
  value: string | number
}>) {
  return (
    <MotionDiv whileHover={{ y: -2 }}>
      <Card variant="elevated" className="border border-border p-5 shadow-sm">
        <p className="text-sm text-fg-secondary">{label}</p>
        <p className="mt-3 text-3xl font-black">{value}</p>
      </Card>
    </MotionDiv>
  )
}
