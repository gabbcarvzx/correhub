import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/shared/button";

const links = [
  { href: "/agenda", label: "Agenda" },
  { href: "/grupos", label: "Grupos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "/comunidade", label: "Comunidade" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/70 backdrop-blur-xl">
      <div className="app-shell flex items-center justify-between gap-4 py-4">
        <Link className="text-lg font-black tracking-tight" href="/">
          CorreHub
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden md:inline-flex" variant="secondary">
            <Link href="/buscar">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Link>
          </Button>
          <Button asChild className="hidden md:inline-flex" variant="ghost">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/cadastro">Comecar</Link>
          </Button>
          <button aria-label="Abrir menu" className="inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-[var(--border)] md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
