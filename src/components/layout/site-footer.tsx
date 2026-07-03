export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-white/60 py-10">
      <div className="app-shell grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">CorreHub</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Comunidades de corrida, grupos locais, treinos, eventos e parceiros em uma plataforma nacional.
          </p>
        </div>
        <div className="text-sm text-[var(--muted)]">
          <p className="font-semibold text-[var(--foreground)]">Produto</p>
          <p className="mt-2">Agenda, grupos, ranking, comunidade, parceiros.</p>
        </div>
        <div className="text-sm text-[var(--muted)]">
          <p className="font-semibold text-[var(--foreground)]">Piloto</p>
          <p className="mt-2">Tenant inicial: Sao Lourenco da Mata.</p>
        </div>
      </div>
    </footer>
  );
}
