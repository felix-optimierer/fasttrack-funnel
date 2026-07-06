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
  caseDesiree: "/manus-storage/desiree-nowak_45b053f0.webp",
  caseFlorian: "/manus-storage/florian-zurheiden_78911900.webp",
  caseAndrea: "/manus-storage/andrea-schaich_27fdda2a.webp",
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
      "Traditionspraxis seit 1980 mit moderner Webseite: Terminanfragen laufen heute direkt online statt nur übers Telefon – ausgezeichnet mit 4,9 ★ aus über 40 Google-Bewertungen.",
    metrics: [
      { label: "Google-Bewertung", value: "4,9 ★" },
      { label: "Erfahrung", value: "44+ Jahre" },
    ],
    sourceUrl: "https://physiotherapie-neumarkt.com/",
    sourceLabel: "physiotherapie-neumarkt.com",
    isQuote: false,
  },
  {
    name: "Anica Bommert",
    role: "Physio & Gesundheitscoach · Gelsenkirchen",
    result: "Erste zwei Klienten für 5.000 € im ersten Monat abgeschlossen.",
    quote:
      "Das Fast-Track-System zu buchen war die beste Entscheidung, um in die Online-Selbstständigkeit zu starten. Klare, praxisnahe Schritte und eine unglaublich intensive, persönliche Betreuung – das habe ich in keinem Coaching vorher erlebt.",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "1. Monat", value: "2 × 5K" },
    ],
    sourceUrl:
      "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
    sourceLabel: "Verifizierte Bewertung",
  },
  {
    name: "Marion Stegemann",
    role: "Psychotherapeutin · Fast-Track-Teilnehmerin",
    image: ASSETS.caseMarion,
    result: "Nach 3 Wochen stolze Besitzerin der eigenen Webseite.",
    quote:
      "Ich hatte keine Website und war quasi unsichtbar. Seit heute Vormittag bin ich stolze Besitzerin einer Webseite – unglaublich, wie schnell und einfach das funktioniert. Und ich bin nicht mal Physiotherapeutin, es lässt sich also auf jeden Bereich übertragen.",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "Webseite live", value: "3 Wochen" },
    ],
    sourceUrl: "https://physiotherapie-greussen.de/",
    sourceLabel: "physiotherapie-greussen.de",
  },
  {
    name: "Nadine Peter",
    role: "Fast-Track-Teilnehmerin",
    result: "Schritt-für-Schritt-Umsetzung mit persönlichem Support.",
    quote:
      "Man bekommt einen spitzen Support bei den besprochenen Projekten. Perfekte Umsetzung – vielen Dank dafür!",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "Support", value: "persönlich" },
    ],
    sourceUrl:
      "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
    sourceLabel: "Verifizierte Bewertung",
  },
  {
    name: "Desirée Nowak",
    role: "Physiotherapeutin · Greußen",
    image: ASSETS.caseDesiree,
    result: "Auch ohne Technik-Vorwissen sicher zur eigenen Seite.",
    quote:
      "Kompetente und problemorientierte Beratung – auch für Personen, die technisch sehr wenig bewandert sind. Einfach TOP.",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "Technik-Vorwissen", value: "keins" },
    ],
    sourceUrl: "https://physiotherapie-greussen.de/",
    sourceLabel: "physiotherapie-greussen.de",
  },
  {
    name: "Frederik Gerber",
    role: "Physio Mastermind · Teilnehmer",
    result: "Austausch mit anderen selbstständigen Physiotherapeuten.",
    quote:
      "Das Physio Mastermind ist eine richtig schöne Plattform, um sich mit anderen selbstständigen Physiotherapeuten auszutauschen. Danke dafür!",
    metrics: [
      { label: "Bewertung", value: "5,0 ★" },
      { label: "Community", value: "aktiv" },
    ],
    sourceUrl:
      "https://www.expertenmarkt.de/experte/bewegungsoptimierer-gmbh-bechhofen/erfahrung",
    sourceLabel: "Verifizierte Bewertung",
  },
  {
    name: "Florian Zurheiden",
    role: "Schwarzwald-Physio · Waldkirch",
    image: ASSETS.caseFlorian,
    result: "Traumwebseite in unter einer Stunde gebaut.",
    quote:
      "Moderne Praxis-Webseite mit Video, Online-Terminbuchung und Newsletter-Funktion – alles in unter einer Stunde live. 62+ Bewertungen bei 5,0 ★ auf Google sprechen für sich.",
    metrics: [
      { label: "Google-Bewertung", value: "5,0 ★" },
      { label: "Bewertungen", value: "62+" },
    ],
    sourceUrl: "https://schwarzwald-physio.de/",
    sourceLabel: "schwarzwald-physio.de",
    isQuote: false,
  },
  {
    name: "Andrea Schaich",
    role: "Schmerz & Physiotherapie · Enkenbach-Alsenborn",
    image: ASSETS.caseAndrea,
    result: "Privatpraxis mit professioneller Online-Präsenz positioniert.",
    quote:
      "Als sektorale Heilpraktikerin für Physiotherapie mit über 30 Jahren Erfahrung: Eigene Webseite mit Online-Terminanfrage, Leistungsübersicht und Patientenbewertungen – alles per KI-Agent erstellt.",
    metrics: [
      { label: "Google-Bewertung", value: "4,8 ★" },
      { label: "Erfahrung", value: "30+ Jahre" },
    ],
    sourceUrl: "https://www.physioschaich.de/",
    sourceLabel: "physioschaich.de",
    isQuote: false,
  },
];
