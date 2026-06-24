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
  trustSeal:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/trust-seal-WQ8T2GFmJgkfLMn5YahH7M.webp",
  sealA:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/seal-a-CvFa5z9RWcoR87SGy3i4nB.webp",
  sealB:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/seal-b-DhsEryTV6E7xcirMM4E2fH.webp",
};

export const BRAND = {
  name: "Fast-Track",
  system: "Online-Praxis-Umsatz Fast-Track System",
  parent: "Physio Freiheit | Bewegungsoptimierer",
};

// Der EINE Hook (Engel/Angle) – überall konsistent.
export const HOOK = {
  promise: "Traumwebseite mit KI-Agenten in unter 60 Minuten",
  without: "ohne Technikkenntnisse, ohne Agentur, ohne Baukasten",
  trust: "Über 100× bewiesen · Doppelt TÜV-zertifiziert",
};

export const PROOF_STATS = [
  { value: "100+", label: "begleitete Physiopraxen" },
  { value: "2×", label: "TÜV-zertifiziert" },
  { value: "60 Min", label: "bis zur eigenen Webseite" },
  { value: "0 €", label: "Agenturkosten" },
];

export type CaseStudy = {
  name: string;
  role: string;
  image?: string;
  result: string;
  quote: string;
  metrics: { label: string; value: string }[];
};

// 7 Platzhalter-Fallstudien. ECHTE Kundennamen/Fotos/Zahlen vor Live-Schaltung einsetzen.
export const CASE_STUDIES: CaseStudy[] = [
  {
    name: "Praxisinhaber (Beispiel)",
    role: "Physiopraxis · Bayern",
    image: ASSETS.case1,
    result: "Traumwebseite in 48 Minuten – ohne Agentur.",
    quote:
      "Ich habe jahrelang auf meine Agentur gewartet. Mit dem KI-Agenten stand meine Webseite an einem Nachmittag – besser als alles davor.",
    metrics: [
      { label: "Webseite live", value: "48 Min" },
      { label: "Agenturkosten", value: "0 €" },
    ],
  },
  {
    name: "Praxisinhaberin (Beispiel)",
    role: "Physiopraxis · NRW",
    image: ASSETS.case2,
    result: "Eigene Coaching-App gelauncht, erste Pakete verkauft.",
    quote:
      "In wenigen Wochen hatte ich meine eigene Coaching-App und die ersten Selbstzahler-Pakete verkauft. Endlich Umsatz ohne mehr Stunden an der Bank.",
    metrics: [
      { label: "App live", value: "3 Wochen" },
      { label: "Erste Pakete", value: "verkauft" },
    ],
  },
  {
    name: "Praxisinhaber (Beispiel)",
    role: "Physiopraxis · Baden-Württemberg",
    result: "Webseite in 52 Minuten – komplett selbst gebaut.",
    quote:
      "Null Technikkenntnisse, trotzdem stand die Seite in unter einer Stunde. Ich hätte nie gedacht, dass das so einfach geht.",
    metrics: [
      { label: "Webseite live", value: "52 Min" },
      { label: "Technik-Vorwissen", value: "keins" },
    ],
  },
  {
    name: "Praxisinhaberin (Beispiel)",
    role: "Physiopraxis · Hessen",
    result: "Erste Selbstzahler-Anfragen über die neue Seite.",
    quote:
      "Schon in der ersten Woche kamen Anfragen über meine neue Webseite – ohne dass ich einen Cent für eine Agentur gezahlt habe.",
    metrics: [
      { label: "Erste Anfragen", value: "Woche 1" },
      { label: "Agentur", value: "0 €" },
    ],
  },
  {
    name: "Praxisinhaber (Beispiel)",
    role: "Physiopraxis · Sachsen",
    result: "Raus aus dem Baukasten-Chaos – endlich Kontrolle.",
    quote:
      "Vorher habe ich mich mit einem Baukasten gequält. Mit dem KI-Agenten hatte ich in unter einer Stunde eine Seite, auf die ich stolz bin.",
    metrics: [
      { label: "Webseite live", value: "57 Min" },
      { label: "Baukasten", value: "gekündigt" },
    ],
  },
  {
    name: "Praxisinhaberin (Beispiel)",
    role: "Physiopraxis · Niedersachsen",
    result: "Coaching-Pakete online verkauft – planbarer Umsatz.",
    quote:
      "Mit eigener Webseite und App verkaufe ich jetzt planbar Pakete. Das macht mich Schritt für Schritt unabhängiger von den Kassen.",
    metrics: [
      { label: "Pakete/Monat", value: "planbar" },
      { label: "Kassenanteil", value: "sinkt" },
    ],
  },
  {
    name: "Praxisinhaber (Beispiel)",
    role: "Physiopraxis · Berlin",
    result: "Traumwebseite an einem Abend – ganz allein.",
    quote:
      "Ich habe abends nach der letzten Behandlung angefangen und war vor dem Schlafengehen fertig. Ohne Agentur, ohne Stress.",
    metrics: [
      { label: "Webseite live", value: "1 Abend" },
      { label: "Hilfe nötig", value: "keine" },
    ],
  },
];
