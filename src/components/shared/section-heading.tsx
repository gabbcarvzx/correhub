import { MotionDiv } from "@/components/ui/motion-wrapper"

export function SectionHeading({
  eyebrow,
  title,
  description
}: Readonly<{
  eyebrow: string
  title: string
  description: string
}>) {
  return (
    <MotionDiv className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-500">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">{title}</h2>
      <div className="mt-2 h-1 w-12 rounded-full bg-brand-500" />
      <p className="mt-4 text-sm leading-6 text-fg-secondary">{description}</p>
    </MotionDiv>
  )
}
