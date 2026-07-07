import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-[var(--primary)]">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Pagina nao encontrada</h2>
      <p className="mt-2 text-[var(--muted)]">
        A pagina que voce procura nao existe ou foi removida.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Voltar ao inicio
      </Link>
    </div>
  );
}
