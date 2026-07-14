import { useMemo } from "react";

/**
 * Detects device type from user agent string
 */
function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return "Mobile";
  return "Desktop";
}

/**
 * Detects browser name from user agent string
 */
function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("MSIE") || ua.includes("Trident/")) return "Internet Explorer";
  return "Unknown";
}

export interface TrackingData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  fbclid?: string;
  pageUrl?: string;
  device?: string;
  browser?: string;
}

/**
 * Hook that captures all tracking data from the current page URL and browser.
 * Reads UTM params, fbclid, referrer, page URL, device type, and browser name.
 */
export function useTrackingData(): TrackingData {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    return {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      utmTerm: params.get("utm_term") || undefined,
      utmContent: params.get("utm_content") || undefined,
      referrer: document.referrer || undefined,
      fbclid: params.get("fbclid") || undefined,
      pageUrl: window.location.href,
      device: detectDevice(),
      browser: detectBrowser(),
    };
  }, []); // Only compute once on mount
}
