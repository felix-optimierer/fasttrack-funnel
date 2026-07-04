// KI-REPORT PAGE — Lead-Magnet-Landingpage im PhysioFreiheit Navy-Gold-Design
// Duplikat von /exit-plan mit angepassten Texten (KI-Report 2026)
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { Download, Check } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { LeadPopup } from "@/components/LeadPopup";

const MOCKUP_URL = "/manus-storage/ki-report-mockup-v2_cab156d3.webp";

const BENEFITS = [
  "7 getestete KI-Agenten Prompts speziell für Physiopraxen",
  "Konkrete Tool Empfehlungen + 1:1 KI Praxis Analyse",
  "Der digitale KI Mitarbeiter ohne Gehalt, Urlaub oder Krankheit",
];

export default function KiReport() {
  usePageView("ki-report");
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* Background: Navy base */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `linear-gradient(rgba(6,15,28,0.88), rgba(6,15,28,0.95)), url(${ASSETS.heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Right side mockup background – full height, like SpeedScaling */}
      <div
        className="absolute right-0 top-0 bottom-0 -z-10 hidden w-[45%] lg:block"
        style={{
          backgroundImage: `url(${MOCKUP_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Gradient overlay to blend into navy on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,15,28,1)] via-[rgba(6,15,28,0.7)] to-[rgba(6,15,28,0.15)]" />
      </div>

      {/* Header / Logo */}
      <header className="container relative flex items-center py-3">
        <Logo />
      </header>

      {/* Main Content – fills viewport, footer scrolls below */}
      <main className="container relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center pb-8 pt-4">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
          {/* Left Column – Text (breiter) */}
          <div className="flex-[1.4] max-w-3xl">
            {/* Header Badge */}
            <div className="mb-3 inline-block rounded-sm border border-gold/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold md:text-xs">
              Internes Dokument (inkl. KI-Agenten &amp; Prompts für Physiopraxen)
            </div>

            {/* Über-Headline */}
            <p className="mb-2 font-display text-sm font-medium italic text-gold md:text-base">
              Von 60-Stunden-Wochen zum 3-Tage-Wochenende
            </p>

            {/* Headline – max 2 Zeilen */}
            <h1 className="mb-4 font-display text-2xl font-extrabold uppercase leading-[1.1] tracking-tight text-foreground md:text-[2rem] lg:text-[2.4rem]">
              Der Physiopraxis KI-Report 2026
            </h1>

            {/* Body Copy */}
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Entdecke die exakten KI-Strategien, die seit 2026 für moderne
              Physiopraxen möglich sind, um{" "}
              <strong className="text-foreground">
                kinderleicht ihren online Auftritt zu optimieren, ihre Webseite
                neuzugestalten und einen Vollzeit KI Mitarbeiter zu gewinnen
              </strong>
              , alles mit einfacher Sprache ohne Technikkenntnisse.
            </p>

            {/* Inklusive – max 2 Zeilen */}
            <p className="mb-5 text-sm italic text-foreground/80 md:text-base">
              Inklusive: Den 5 häufigsten Fehlern &amp; echten Praxen als Fallbeispiele
            </p>

            {/* CTA Button */}
            <GoldButton
              glow
              className="mb-5 w-auto px-10"
              onClick={() => setPopupOpen(true)}
            >
              <Download className="h-5 w-5" />
              Jetzt kostenlos herunterladen
            </GoldButton>

            {/* Benefit Points – einzeilig */}
            <ul className="space-y-2">
              {BENEFITS.map((b, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 text-sm text-foreground/90 md:text-base"
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-gold" />
                  <span className="whitespace-nowrap">{b}</span>
                </li>
              ))}
            </ul>

            {/* TÜV-Siegel */}
            <div className="mt-6 flex flex-col items-start gap-2">
              <DoubleSeals />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Doppelt TÜV-zertifiziert
              </p>
            </div>
          </div>

          {/* Right Column – Mobile fallback (shows image on mobile) */}
          <div className="flex flex-1 items-center justify-center lg:hidden">
            <img
              src={MOCKUP_URL}
              alt="KI-Report Vorschau"
              className="w-full max-w-sm rounded-lg opacity-80"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Lead-Popup */}
      <LeadPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        headline="An wen dürfen wir den KI-Report senden?"
        subtext="Die Inhalte kommen per WhatsApp – deswegen gib bitte deine WhatsApp Nummer ein (ohne 0)"
        source="ki-report"
      />
    </div>
  );
}
