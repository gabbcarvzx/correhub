"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shared/button";

export function AttendanceToggleButton({
  runEventId,
  status
}: Readonly<{
  runEventId: string;
  status?: "CONFIRMED" | "CANCELLED" | null;
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status ?? null);

  function handleClick() {
    startTransition(async () => {
      const method = currentStatus === "CONFIRMED" ? "DELETE" : "POST";
      const response = await fetch("/api/v1/attendance", {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ runEventId })
      });

      if (!response.ok) {
        toast.error("Nao foi possivel atualizar sua presenca.");
        return;
      }

      setCurrentStatus(currentStatus === "CONFIRMED" ? "CANCELLED" : "CONFIRMED");
      toast.success(currentStatus === "CONFIRMED" ? "Presenca cancelada." : "Presenca confirmada.");
      router.refresh();
    });
  }

  return (
    <Button className="w-full" disabled={pending} onClick={handleClick} variant={currentStatus === "CONFIRMED" ? "secondary" : "primary"}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : currentStatus === "CONFIRMED" ? "Cancelar presenca" : "Vou participar"}
    </Button>
  );
}
