"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PageTransition } from "@/components/ui/page-transition";
import { registerSchema, type RegisterData } from "@/lib/validations/auth";
import { toast } from "sonner";

const distanceOptions = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "15", label: "15 km" },
  { value: "21", label: "21 km" },
  { value: "OPEN", label: "Livre" },
];

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      city: "São Lourenço da Mata",
      preferredDistance: "",
    },
  });

  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  async function onSubmit(data: RegisterData) {
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message ?? "Erro ao criar conta.");
        return;
      }

      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } catch {
      toast.error("Erro ao criar conta. Tente novamente.");
    }
  }

  return (
    <AppShell footer={false}>
      <PageTransition>
        <main className="app-shell grid min-h-[calc(100vh-88px)] items-center py-10">
          <Card variant="elevated" className="mx-auto w-full max-w-2xl p-8">
            <h1 className="text-3xl font-black">Criar conta</h1>
            <p className="mt-3 text-sm text-muted">Cadastre-se como corredor e evolua depois para líder ou parceiro.</p>
            <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="você@exemplo.com" type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input placeholder="Mínimo 8 caracteres" type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredDistance"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Distância preferida</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a distância" />
                        </SelectTrigger>
                        <SelectContent>
                          {distanceOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Button disabled={isSubmitting} size="lg" className="w-full" type="submit">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
                </Button>
              </div>
            </form>
            </FormProvider>
            <p className="mt-6 text-sm text-muted">
              Já possui conta?{" "}
              <Link className="font-semibold text-brand-600" href="/login">
                Entrar
              </Link>
            </p>
          </Card>
        </main>
      </PageTransition>
    </AppShell>
  );
}
