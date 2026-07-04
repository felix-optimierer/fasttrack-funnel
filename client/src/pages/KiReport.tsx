// KI-REPORT PAGE — Lead-Magnet-Landingpage im PhysioFreiheit Navy-Gold-Design
// Duplikat von /exit-plan mit angepassten Texten (KI-Report 2026)
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { Download, Check } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { LeadPopup } from "@/components/LeadPopup";

// Mockup-Bild: Platzhalter bis echtes Bild übergeben wird
const MOCKUP_URL = ""; // TODO: Echtes Mockup-Bild hier einfügen

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
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(6,15,28,0.88), rgba(6,15,28,0.95)), url(${ASSETS.heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header / Logo */}
      <header className="container flex items-center py-3">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="container flex flex-1 flex-col justify-center pb-4 pt-2">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
          {/* Left Column – Text (breiter) */}
          <div className="flex-[1.4] max-w-3xl">
            {/* Header Badge */}
            <div className="mb-2 inline-block rounded-sm border border-gold/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gold md:text-[11px]">
              Internes Dokument (inkl. KI-Agenten &amp; Prompts für Physiopraxen)
            </div>

            {/* Über-Headline */}
            <p className="mb-1 font-display text-sm font-medium italic text-gold md:text-base">
              Von 60-Stunden-Wochen zum 3-Tage-Wochenende
            </p>

            {/* Headline – max 2 Zeilen */}
            <h1 className="mb-3 font-display text-xl font-extrabold uppercase leading-[1.1] tracking-tight text-foreground md:text-[1.7rem] lg:text-[2.1rem]">
              Der Physiopraxis KI-Report 2026
            </h1>

            {/* Body Copy */}
            <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground md:text-sm">
              Entdecke die exakten KI-Strategien, die seit 2026 für moderne
              Physiopraxen möglich sind, um{" "}
              <strong className="text-foreground">
                kinderleicht ihren online Auftritt zu optimieren, ihre Webseite
                neuzugestalten und einen Vollzeit KI Mitarbeiter zu gewinnen
              </strong>
              , alles mit einfacher Sprache ohne Technikkenntnisse.
            </p>

            {/* Inklusive – max 2 Zeilen */}
            <p className="mb-4 text-[13px] italic text-foreground/80 md:text-sm">
              Inklusive: Den 5 häufigsten Fehlern &amp; echten Praxen als Fallbeispiele
            </p>

            {/* CTA Button */}
            <GoldButton
              glow
              className="mb-4 w-auto px-8"
              onClick={() => setPopupOpen(true)}
            >
              <Download className="h-5 w-5" />
              Jetzt kostenlos herunterladen
            </GoldButton>

            {/* Benefit Points – einzeilig */}
            <ul className="space-y-1.5">
              {BENEFITS.map((b, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-[13px] text-foreground/90 md:text-sm"
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-gold" />
                  <span className="whitespace-nowrap">{b}</span>
                </li>
              ))}
            </ul>

            {/* TÜV-Siegel */}
            <div className="mt-4 flex flex-col items-start gap-1.5">
              <DoubleSeals />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Doppelt TÜV-zertifiziert
              </p>
            </div>
          </div>

          {/* Right Column – Mockup */}
          <div className="flex flex-1 items-center justify-center lg:justify-end">
            {MOCKUP_URL ? (
              <img
                src={MOCKUP_URL}
                alt="KI-Report Mockup"
                className="w-full max-w-sm rounded-lg shadow-2xl lg:max-w-md"
              />
            ) : (
              <div className="flex h-64 w-full max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-gold/30 bg-card/50 backdrop-blur lg:h-[22rem] lg:max-w-md">
                <p className="text-center text-sm text-muted-foreground">
                  Mockup-Bild<br />
                  <span className="text-xs">(wird noch eingefügt)</span>
                </p>
              </div>
            )}
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
