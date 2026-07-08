"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shared/button";

export function ModerationActionCard({
  entityId,
  entityType,
  title,
  subtitle
}: Readonly<{
  entityId: string;
  entityType: "groups" | "partners";
  title: string;
  subtitle: string;
}>) {
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      const response = await fetch(`/api/v1/admin/${entityType}/${entityId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status,
          reviewNotes
        })
      });

      if (!response.ok) {
        toast.error("Não foi possível registrar a moderação.");
        return;
      }

      toast.success(status === "APPROVED" ? "Aprovado." : "Rejeitado.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl bg-surface-solid p-4 border border-border">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <textarea
        className="mt-4 min-h-24 w-full rounded-2xl border border-border bg-slate-50 p-4"
        onChange={(event) => setReviewNotes(event.target.value)}
        placeholder="Observações do admin"
        value={reviewNotes}
      />
      <div className="mt-4 flex gap-3">
        <Button className="flex-1" disabled={pending} onClick={() => submit("APPROVED")}>
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Aprovar"}
        </Button>
        <Button className="flex-1" disabled={pending} onClick={() => submit("REJECTED")} variant="secondary">
          Rejeitar
        </Button>
      </div>
    </div>
  );
}
