"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/shared/button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciais invalidas.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input className="h-12 rounded-2xl border-0 bg-white px-4 ring-1 ring-[var(--border)]" defaultValue="runner@correhub.local" name="email" placeholder="voce@exemplo.com" type="email" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Senha
        <input className="h-12 rounded-2xl border-0 bg-white px-4 ring-1 ring-[var(--border)]" defaultValue="runner123" name="password" placeholder="••••••••" type="password" />
      </label>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button disabled={loading} type="submit">
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
      <Button disabled type="button" variant="secondary">
        Continuar com Google
      </Button>
    </form>
  );
}
