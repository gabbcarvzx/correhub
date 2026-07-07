"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shared/button";

export function CheckInButton({
  runEventId
}: Readonly<{
  runEventId: string;
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const response = await fetch("/api/v1/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ runEventId })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(payload?.error ?? "Nao foi possivel registrar o check-in.");
        return;
      }

      toast.success("Check-in registrado.");
      router.refresh();
    });
  }

  return (
    <Button className="mt-6 w-full" disabled={pending} onClick={handleClick}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Registrar presenca"}
    </Button>
  );
}
