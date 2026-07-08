"use client";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-center">
      <h2 className="text-xl font-semibold text-red-600">Erro no Dashboard</h2>
      <p className="mt-2 text-muted">
        {error.message === "Authentication required to resolve tenant context."
          ? "Sessão expirada. Faça login novamente."
          : "Não foi possível carregar o dashboard."}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-full bg-brand-500 px-6 py-2 text-sm font-medium text-white"
      >
        Tentar novamente
      </button>
    </div>
  );
}
