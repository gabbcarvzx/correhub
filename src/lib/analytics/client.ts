"use client";

import { useEffect } from "react";
import { getAnalyticsProvider, GA4AnalyticsProvider, setAnalyticsProvider } from "./provider";
import type { AnalyticsEvent } from "./events";

export function track(event: AnalyticsEvent) {
  getAnalyticsProvider().track(event);
}

export function pageView(url: string) {
  getAnalyticsProvider().pageView(url);
}

export function usePageView() {
  useEffect(() => {
    pageView(window.location.pathname);
  }, []);
}

export function initAnalytics(measurementId?: string) {
  if (measurementId && typeof window !== "undefined") {
    const ga4 = new GA4AnalyticsProvider(measurementId);
    setAnalyticsProvider(ga4);
  }
}
