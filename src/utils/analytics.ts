/**
 * Fire a GA4 event via gtag when available (no-op during SSR/dev without gtag).
 */
export function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean> = {},
): void {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return

  window.gtag("event", eventName, params)
}
