"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Search, CalendarDays, Users, Medal, Store, LayoutDashboard } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const navLinks = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/grupos", label: "Grupos", icon: Users },
  { href: "/ranking", label: "Ranking", icon: Medal },
  { href: "/parceiros", label: "Parceiros", icon: Store },
  { href: "/comunidade", label: "Comunidade", icon: LayoutDashboard },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface backdrop-blur-xl">
      <div className="app-shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          CorreHub
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm text-muted md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-fg ${pathname.startsWith(link.href) ? "text-brand-500" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/buscar">
              <Search className="h-4 w-4" />
              Buscar
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/cadastro">Começar</Link>
          </Button>
          <div className="hidden md:inline-flex">
            <ThemeToggle />
          </div>
          <button
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-4 border-l border-border bg-surface-strong p-6 shadow-lg md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold tracking-tight">Menu</span>
                <button
                  aria-label="Fechar menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname.startsWith(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-fg-secondary"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-auto border-t border-border pt-4">
                <span className="mb-2 block text-sm text-muted">Tema</span>
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16 md:h-0" />
    </header>
  )
}
