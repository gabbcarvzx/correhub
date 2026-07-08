"use client";

import { SessionProvider } from "next-auth/react";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-register";
import { ThemeProvider } from "./theme-provider";
import { AnalyticsProvider } from "./analytics-provider";
import { PerformanceProvider } from "./performance-provider";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <AnalyticsProvider>
        <SessionProvider>
          <PerformanceProvider>
            {children}
            <ServiceWorkerRegister />
          </PerformanceProvider>
        </SessionProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}
