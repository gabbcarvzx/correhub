export function SectionHeading({
  eyebrow,
  title,
  description
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--primary-strong)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}
