export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}
