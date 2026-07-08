"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginData } from "@/lib/validations/auth";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;

  async function onSubmit(data: LoginData) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Credenciais inválidas.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <FormProvider {...form}>
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="você@exemplo.com"
                type="email"
                autoComplete="email"
                autoFocus
                {...field}
              />
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
              <Input
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button disabled={isSubmitting} type="submit" size="lg" className="w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
      <Button disabled type="button" variant="outline" size="lg" className="w-full">
        Continuar com Google
      </Button>
    </form>
    </FormProvider>
  );
}
