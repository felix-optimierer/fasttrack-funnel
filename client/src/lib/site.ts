// Zentrale Inhalte des Fast-Track Funnels.
// Fallstudien hier einfach erweitern -> erscheinen automatisch im Grid.

export const ASSETS = {
  heroBg:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663184004032/n4HsdnCPFsDhTY9NVz5q9i/hero-bg-F4uycHxjSbLve2mstTQRps.webp",
  logo: "/manus-storage/physiofreiheit-logo-weiss_db1773b7.png",
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
  // Echte TÜV Rheinland Zertifikate (ID 0217466534 & 0217466539)
  tuv1: "/manus-storage/tuv-1-round_44a2fd80.png",
  tuv2: "/manus-storage/tuv-2-round_d5e3f886.png",
  // Echte Fallstudien-Bilder (von den Original-Webseiten)
  caseTorben: "/manus-storage/torben_moeller_ef873c93.jpeg",
  caseReichl: "/manus-storage/alexander_reichl_c936ba49.webp",
  caseMarion: "/manus-storage/marion-stegemann_85d97a90.webp",
  caseDesiree: "/manus-storage/desiree-nowak-v2_107a0327.webp",
  caseFlorian: "/manus-storage/florian-zurheiden-v4_4bdef1c6.webp",
  caseAnica: "/manus-storage/anica-bommert-v3_d8696714.webp",
  caseKlaus: "/manus-storage/klaus-leipholz_5e66daec.webp",
  caseAndrea: "/manus-storage/andrea-schaich-logo-v2_4c8c22b7.webp",
  caseTabea: "/manus-storage/tabea-gruender_2a935f6d.webp",
};

export const BRAND = {
  name: "Physio Freiheit",
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
  sourceUrl?: string;
  sourceLabel?: string;
  // true = wörtliches Kundenzitat; false/undefined = redaktioneller Faktentext
  isQuote?: boolean;
  // true = Bild ist ein Logo (object-contain statt object-cover)
  isLogo?: boolean;
  // Link zur verifizierten Bewertung (Expertenmarkt etc.)
  reviewUrl?: string;
};

// 9 echte Fallstudien.
export const CASE_STUDIES: CaseStudy[] = [
  {
    name: "Torben Möller",
    role: "Mobile Physiotherapie · Geesthacht",
    image: ASSETS.caseTorben,
    result: "Eigene KI Webseite, über die laufend Anfragen reinkommen.",
    quote:
      "Mobile Physiotherapie mit eigener Webseite und App: Anfragen laufen direkt online rein ohne Agentur und ohne Wartezimmer. Über 1.000 Patienten wurden bereits begleitet, bei 5,0 ★ auf Google.",
    metrics: [
      { label: "Google-Bewertung", value: "5,0 ★" },
      { label: "Patienten", value: "1.000+" },
    ],
    sourceUrl: "https://www.physiotherapie-torben-moeller.de/",
    sourceLabel: "physiotherapie-torben-moeller.de",
    isQuote: false,
  },
  {
    name: "Alexander Reichl",
    role: "Physiotherapie Reichl · Neumarkt i.d.OPf.",
    image: ASSETS.caseReichl,
    result: "Moderne Online-Präsenz mit Online-Terminbuchung statt nur Telefon.",
    quote:
      "Traditionspraxis seit 1980 mit moderner Webseite: Terminanfragen laufen heute direkt online statt nur übers Telefon, ausgezeichnet mit 4,9 ★ aus über 40 Google-Bewertungen.",
    metrics: [
      { label: "Google-Bewertung", value: "4,9 ★" },
      { label: "Erfahrung", value: "44+ Jahre" },
    ],
    sourceUrl: "https://physiotherapie-neumarkt.com/",
    sourceLabel: "physiotherapie-neumarkt.com",
    isQuote: false,
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
  },
  {
    name: "Anica Bommert",
    role: "Physio & Gesundheitscoach · Gelsenkirchen",
    image: ASSETS.caseAnica,
    result: "Erste zwei Klienten für 5.000 € im ersten Monat abgeschlossen.",
    quote:
      "Das Fast-Track-System zu buchen war die beste Entscheidung, um in die Online-Selbstständigkeit zu starten. Klare, praxisnahe Schritte und eine unglaublich intensive, persönliche Betreuung. Das habe ich in keinem Coaching vorher erlebt.",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "1. Monat", value: "2 × 5K" },
    ],
    sourceUrl:
      "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
    sourceLabel: "Verifizierte Bewertung",
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
  },
  {
    name: "Marion Stegemann",
    role: "Psychotherapeutin · Fast-Track-Teilnehmerin",
    image: ASSETS.caseMarion,
    result: "Nach 3 Wochen stolze Besitzerin der eigenen Webseite.",
    quote:
      "Ich hatte keine Website und war quasi unsichtbar. Seit heute Vormittag bin ich stolze Besitzerin einer Webseite. Unglaublich, wie schnell und einfach das funktioniert. Und ich bin nicht mal Physiotherapeutin, es lässt sich also auf jeden Bereich übertragen.",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "Webseite live", value: "3 Wochen" },
    ],
    sourceUrl: "https://physiotherapie-greussen.de/",
    sourceLabel: "physiotherapie-greussen.de",
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
  },
  {
    name: "Klaus Leipholz",
    role: "Kraftwerk Physiotraining · Berlin-Mitte",
    image: ASSETS.caseKlaus,
    result: "700 % mehr Umsatz in 4 Monaten mit neuer Webseite.",
    quote:
      "Mit der neuen Webseite von den Bewegungsoptimierern habe ich in 4 Monaten 700% mehr Umsatz gemacht. Danke für Eure Unterstützung!",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "Umsatzsteigerung", value: "700 %" },
    ],
    sourceUrl: "https://www.kraftwerk-berlin.com/",
    sourceLabel: "kraftwerk-berlin.com",
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung?page=2",
    isQuote: true,
  },
  {
    name: "Desirée Nowak",
    role: "Physiotherapeutin · Greußen",
    image: ASSETS.caseDesiree,
    result: "Auch ohne Technik-Vorwissen sicher zur eigenen Seite.",
    quote:
      "Kompetente und problemorientierte Beratung, auch für Personen, die technisch sehr wenig bewandert sind. Einfach TOP.",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "Technik-Vorwissen", value: "keins" },
    ],
    sourceUrl: "https://physiotherapie-greussen.de/",
    sourceLabel: "physiotherapie-greussen.de",
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
  },
  {
    name: "Tabea Gründer",
    role: "Privatpraxis Physiotherapie & Personal Training · Düsseldorf",
    image: ASSETS.caseTabea,
    result: "Traumwebseite mit Online-Buchung in unter einer Stunde erstellt.",
    quote:
      "Privatpraxis für Sportphysiotherapie und Personal Training mit eigener Webseite, Online-Terminbuchung via Doctolib und 5,0 ★ aus 31 Google-Bewertungen. Spezialisiert auf Kletterer und CrossFit-Athleten.",
    metrics: [
      { label: "Google-Bewertung", value: "5,0 ★" },
      { label: "Bewertungen", value: "31" },
    ],
    sourceUrl: "https://www.tabea-physiotherapie.de/",
    sourceLabel: "tabea-physiotherapie.de",
    isQuote: false,
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
  },
  {
    name: "Florian Zurheiden",
    role: "Schwarzwald-Physio · Waldkirch",
    image: ASSETS.caseFlorian,
    result: "Traumwebseite in unter einer Stunde gebaut.",
    quote:
      "Moderne Praxis-Webseite mit Video, Online-Terminbuchung und Newsletter-Funktion. Alles in unter einer Stunde live. 62+ Bewertungen bei 5,0 ★ auf Google sprechen für sich.",
    metrics: [
      { label: "Google-Bewertung", value: "5,0 ★" },
      { label: "Bewertungen", value: "62+" },
    ],
    sourceUrl: "https://schwarzwald-physio.de/",
    sourceLabel: "schwarzwald-physio.de",
    isQuote: false,
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
  },
  {
    name: "Andrea Schaich",
    role: "Schmerz & Physiotherapie · Enkenbach-Alsenborn",
    image: ASSETS.caseAndrea,
    result: "Privatpraxis mit professioneller Online-Präsenz positioniert.",
    quote:
      "Als sektorale Heilpraktikerin für Physiotherapie mit über 30 Jahren Erfahrung: Eigene Webseite mit Online-Terminanfrage, Leistungsübersicht und Patientenbewertungen. Alles per KI-Agent erstellt.",
    metrics: [
      { label: "Google-Bewertung", value: "4,8 ★" },
      { label: "Erfahrung", value: "30+ Jahre" },
    ],
    sourceUrl: "https://www.physioschaich.de/",
    sourceLabel: "physioschaich.de",
    isQuote: false,
    isLogo: true,
    reviewUrl: "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
  },
];
