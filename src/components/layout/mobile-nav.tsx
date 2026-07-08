"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Users, Medal, Store, LayoutDashboard } from "lucide-react"

const items = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/grupos", label: "Grupos", icon: Users },
  { href: "/ranking", label: "Ranking", icon: Medal },
  { href: "/parceiros", label: "Parceiros", icon: Store },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border bg-surface backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              isActive ? "text-brand-500" : "text-muted hover:text-fg-secondary"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
