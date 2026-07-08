"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors
      position="top-center"
      closeButton
      toastOptions={{
        duration: 4000
      }}
    />
  );
}
