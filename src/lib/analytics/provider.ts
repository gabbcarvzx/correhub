import type { AnalyticsEvent, AnalyticsProvider } from "./events";

interface GtagWindow {
  gtag: (...args: unknown[]) => void;
}

class ConsoleAnalyticsProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", event.name, event.properties);
    }
  }

  pageView(url: string) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Page view:", url);
    }
  }
}

class GA4AnalyticsProvider implements AnalyticsProvider {
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  private get gtag() {
    return (window as unknown as GtagWindow).gtag;
  }

  track(event: AnalyticsEvent) {
    if (typeof window === "undefined" || !this.gtag) return;
    this.gtag("event", event.name, event.properties);
  }

  pageView(url: string) {
    if (typeof window === "undefined" || !this.gtag) return;
    this.gtag("config", this.measurementId, { page_path: url });
  }
}

let provider: AnalyticsProvider = new ConsoleAnalyticsProvider();

export function setAnalyticsProvider(newProvider: AnalyticsProvider) {
  provider = newProvider;
}

export function getAnalyticsProvider(): AnalyticsProvider {
  return provider;
}

export { ConsoleAnalyticsProvider, GA4AnalyticsProvider };
