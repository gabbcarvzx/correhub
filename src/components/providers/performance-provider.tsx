"use client";

import { WebVitals } from "@/lib/performance/report";

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebVitals />
      {children}
    </>
  );
}
