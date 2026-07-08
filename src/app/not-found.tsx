"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/20">
        <FileQuestion className="h-6 w-6 text-brand-500" />
      </div>
      <h1 className="mt-4 text-6xl font-bold text-brand-500">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
      <p className="mt-2 text-muted">
        A página que você procura não existe ou foi removida.
      </p>
      <Link href="/">
        <Button variant="primary" className="mt-6">
          Voltar ao inicio
        </Button>
      </Link>
    </motion.div>
  );
}
