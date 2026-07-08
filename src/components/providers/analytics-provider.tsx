"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, track } from "@/lib/analytics/client";

export function AnalyticsProvider({
  children,
  measurementId,
}: {
  children: React.ReactNode;
  measurementId?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics(measurementId);
  }, [measurementId]);

  useEffect(() => {
    track({ name: "page_view", properties: { path: pathname } });
  }, [pathname]);

  return <>{children}</>;
}
