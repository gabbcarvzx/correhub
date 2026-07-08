import Link from "next/link"

const navLinks = [
  { href: "/agenda", label: "Agenda" },
  { href: "/grupos", label: "Grupos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/parceiros", label: "Parceiros" },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface py-12">
      <div className="app-shell grid gap-8 md:grid-cols-3">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight">
            CorreHub
          </Link>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Comunidades de corrida, grupos locais, treinos, eventos e parceiros em uma plataforma nacional.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Navegação</p>
          <ul className="space-y-2 text-sm text-muted">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Piloto</p>
          <p className="text-sm text-muted">Tenant inicial: São Lourenço da Mata.</p>
        </div>
      </div>
    </footer>
  )
}
