export type AnalyticsEvent =
  | { name: "page_view"; properties?: Record<string, string> }
  | { name: "login"; properties?: { method?: string } }
  | { name: "signup"; properties?: Record<string, string> }
  | { name: "check_in"; properties?: { event_id?: string } }
  | { name: "attendance_confirm"; properties?: { event_id?: string } }
  | { name: "attendance_cancel"; properties?: { event_id?: string } }
  | { name: "group_join"; properties?: { group_id?: string } }
  | { name: "group_view"; properties?: { group_slug?: string } }
  | { name: "event_view"; properties?: { event_id?: string } }
  | { name: "ranking_view"; properties?: Record<string, string> }
  | { name: "partner_view"; properties?: { partner_slug?: string } }
  | { name: "search"; properties?: { query?: string } }
  | { name: "error"; properties?: { error_type?: string; message?: string } }
  | { name: "conversion"; properties?: { type?: string } };

export type AnalyticsProvider = {
  track: (event: AnalyticsEvent) => void;
  pageView: (url: string) => void;
};
