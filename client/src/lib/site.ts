// Zentrale Inhalte des Fast-Track Funnels.
// Fallstudien hier einfach erweitern -> erscheinen automatisch im Grid.

export const ASSETS = {
  heroBg:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/hero-bg-F4uycHxjSbLve2mstTQRps.webp",
  logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/logo-6DRbDgCFrwhVA4hn7uzrui.webp",
  case1:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/case-1-NF8jJ5cUCwwqSeZvcEzuaw.webp",
  case2:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/case-2-JCzQWvBo5fprroMFaR9nNf.webp",
  dashboard:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/dashboard-mock-mKS2XfQsJ7tWy7tiW9SZas.webp",
};

export const BRAND = {
  name: "Fast-Track",
  system: "Online-Praxis-Umsatz Fast-Track System",
  parent: "Physio Freiheit | Bewegungsoptimierer",
};

export const PROOF_STATS = [
  { value: "100+", label: "begleitete Physiopraxen" },
  { value: "2×", label: "TÜV-zertifiziertes Wissen" },
  { value: "< 1 Std.", label: "bis zur eigenen KI-Webseite" },
  { value: "Wochen", label: "bis zum ersten Online-Umsatz" },
];

export type CaseStudy = {
  name: string;
  role: string;
  image?: string;
  result: string;
  quote: string;
  metrics: { label: string; value: string }[];
};

// Platzhalter-Fallstudien. ECHTE Kundennamen/Zahlen vor Live-Schaltung einsetzen.
export const CASE_STUDIES: CaseStudy[] = [
  {
    name: "Praxisinhaber (Beispiel)",
    role: "Physiopraxis · Bayern",
    image: ASSETS.case1,
    result: "Eigene KI-Webseite in 48 Minuten – ganz ohne Agentur.",
    quote:
      "Ich habe jahrelang auf meine Agentur gewartet. Mit dem Fast-Track-System stand meine Traumwebseite an einem Nachmittag – und sieht besser aus als alles davor.",
    metrics: [
      { label: "Webseite live", value: "48 Min" },
      { label: "Agenturkosten", value: "0 €" },
    ],
  },
  {
    name: "Praxisinhaberin (Beispiel)",
    role: "Physiopraxis · NRW",
    image: ASSETS.case2,
    result: "Eigene Klienten-Coaching-App gelauncht und erste Pakete verkauft.",
    quote:
      "Innerhalb weniger Wochen hatte ich meine eigene Coaching-App und habe die ersten Selbstzahler-Pakete verkauft. Endlich Umsatz ohne mehr Stunden an der Bank.",
    metrics: [
      { label: "App live", value: "3 Wochen" },
      { label: "Erste Pakete", value: "verkauft" },
    ],
  },
];
