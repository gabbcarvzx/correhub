"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    async function register() {
      try {
        registration = await navigator.serviceWorker.register("/sw.js");

        registration.addEventListener("updatefound", () => {
          const installing = registration?.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              toast.info("Nova versão disponível. Atualize a página para usar.", {
                duration: 6000,
                action: {
                  label: "Atualizar",
                  onClick: () => window.location.reload(),
                },
              });
            }
          });
        });
      } catch {
        console.info("Service Worker registration skipped");
      }
    }

    register();

    const interval = setInterval(() => {
      registration?.update();
    }, 3600000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}
