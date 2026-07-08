"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { motion } from "motion/react"

const themes = ["light", "dark", "system"] as const

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const labels = {
  light: "Modo claro",
  dark: "Modo escuro",
  system: "Sistema",
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const current = (theme as "light" | "dark" | "system") || "system"
  const next = themes[(themes.indexOf(current) + 1) % themes.length]
  const Icon = icons[current]

  return (
    <motion.button
      key={current}
      initial={{ rotate: -90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={() => setTheme(next)}
      aria-label={`Alternar tema. Atual: ${labels[current]}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:text-fg transition-colors"
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  )
}
