"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h1 className="mt-4 text-4xl font-bold text-red-600">Algo deu errado</h1>
      <p className="mt-4 text-muted">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <Button onClick={reset} variant="primary" className="mt-6">
        Tentar novamente
      </Button>
    </motion.div>
  );
}
