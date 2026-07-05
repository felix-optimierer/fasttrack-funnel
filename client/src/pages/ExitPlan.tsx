// EXIT-PLAN PAGE — Lead-Magnet-Landingpage im PhysioFreiheit Navy-Gold-Design
// Layout wie SpeedScaling/KI-Report: Blurred-Bild als Fullscreen-Hintergrund, Mockup zentriert darüber
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { Download, Check } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { LeadPopup } from "@/components/LeadPopup";

const BG_BLURRED_URL = "/manus-storage/exit-plan-bg_73338363.webp";
const MOCKUP_URL = "/manus-storage/exit-plan-mockup_5abddb0b.webp";

const BENEFITS = [
  "Der 5-Schritte-Plan: Von Kassensystem-Abhängigkeit zum Hybrid-Modell",
  "Wie du dir deinen \"Patienten freien Freitag\" sicherst",
  "1:1 Praxis Analyse",
];

export default function ExitPlan() {
  usePageView("exit-plan");
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* === FULLSCREEN BACKGROUND: Blurred image covering entire section === */}
      <div className="absolute inset-0 -z-10">
        {/* Collage image as full background */}
        <img
          src={BG_BLURRED_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Desktop gradient: Navy fades from left (protects text) to transparent right (shows image) */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(to right, rgba(6,15,28,0.97) 0%, rgba(6,15,28,0.95) 30%, rgba(6,15,28,0.75) 50%, rgba(6,15,28,0.3) 70%, rgba(6,15,28,0.1) 100%)",
          }}
        />
        {/* Mobile gradient: Navy fades from top (protects text) to transparent bottom (shows image) */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,15,28,0.97) 0%, rgba(6,15,28,0.92) 40%, rgba(6,15,28,0.7) 65%, rgba(6,15,28,0.4) 85%, rgba(6,15,28,0.2) 100%)",
          }}
        />
      </div>

      {/* Header / Logo */}
      <header className="container relative flex items-center py-3">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="container relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center pb-8 pt-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
          {/* === Left Column: Text content (limited width) === */}
          <div className="max-w-lg lg:max-w-xl lg:flex-[1.3]">
            {/* Header Badge – kein whitespace-nowrap damit es auf Mobile umbricht */}
            <div className="mb-3 inline-block rounded-sm border border-gold/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold md:text-[11px] md:whitespace-nowrap">
              Internes Dokument (inkl. Umsetzungs-Roadmap)
            </div>

            {/* Über-Headline (Sub-Headline – mehrzeilig erlaubt) */}
            <p className="mb-2 font-display text-sm font-medium italic text-gold md:text-base">
              Interne Schritt für Schritt Anleitung
            </p>

            {/* Headline */}
            <h1 className="mb-4 font-display text-2xl font-extrabold uppercase leading-[1.1] tracking-tight text-foreground md:text-[2rem] lg:text-[2.4rem]">
              Der 5-Schritte
              <br />
              "Zeit-Gegen-Geld" Exit-Plan
            </h1>

            {/* Body Copy */}
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Entdecke den exakten 5 Schritte-Plan, mit dem{" "}
              <strong className="text-foreground">
                100+ Praxis-Inhaber ihre Behandlungszeit reduziert haben
              </strong>{" "}
              bei mehr Gewinn auf dem Konto durch modernste KI-Agenten &amp;
              kassenunabhängige online Umsätze ohne noch mehr Patienten behandeln
              zu müssen.
            </p>

            {/* Inklusive – mehrzeilig */}
            <p className="mb-4 text-sm italic text-foreground/80 md:text-base">
              Inklusive: Bewiesenem Weg von Kassenabhängigkeit zu online
              Umsatzquellen + die konkrete Roadmap für deinen "Patienten freien
              Freitag"
            </p>

            {/* CTA Button – schmaler */}
            <GoldButton
              glow
              className="mb-4 w-fit px-8"
              onClick={() => setPopupOpen(true)}
            >
              <Download className="h-5 w-5" />
              Jetzt kostenlos herunterladen
            </GoldButton>

            {/* === MOBILE: TÜV-Siegel direkt nach Button === */}
            <div className="mb-4 flex flex-col items-start gap-2 lg:hidden">
              <DoubleSeals />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Doppelt TÜV-zertifiziert
              </p>
            </div>

            {/* === MOBILE: Mockup nach TÜV === */}
            {MOCKUP_URL && (
              <div className="mb-5 flex items-center justify-center lg:hidden">
                <img
                  src={MOCKUP_URL}
                  alt="Exit-Plan Vorschau"
                  className="w-full max-w-[280px] object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                />
              </div>
            )}

            {/* Benefit Points (auf Mobile NACH dem Mockup) */}
            <ul className="space-y-2">
              {BENEFITS.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-foreground/90 md:text-base"
                >
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* === DESKTOP: TÜV-Siegel unter den Häkchen === */}
            <div className="mt-5 hidden flex-col items-start gap-2 lg:flex">
              <DoubleSeals />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Doppelt TÜV-zertifiziert
              </p>
            </div>
          </div>

          {/* === Right Column: Mockup (Desktop only) === */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
            {MOCKUP_URL ? (
              <img
                src={MOCKUP_URL}
                alt="Exit-Plan Mockup"
                className="w-full max-w-md object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <div className="flex h-[22rem] w-full max-w-md items-center justify-center rounded-2xl border-2 border-dashed border-gold/30 bg-card/50 backdrop-blur">
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
        headline="An wen dürfen wir den Exit-Plan senden?"
        subtext="Die Inhalte kommen per WhatsApp – deswegen gib bitte deine WhatsApp Nummer ein (ohne 0)"
        source="exit-plan"
      />
    </div>
  );
}
