// EXIT-PLAN PAGE — Lead-Magnet-Landingpage im PhysioFreiheit Navy-Gold-Design
// Layout wie SpeedScaling/KI-Report: Blurred-Bild als Fullscreen-Hintergrund, Mockup zentriert darüber
import { useEffect, useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { Download, Check } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { LeadPopup } from "@/components/LeadPopup";

const BG_BLURRED_URL = "/manus-storage/exit-plan-bg-optimized_47209fe8.webp";
const MOCKUP_URL = "/manus-storage/exit-plan-mockup_7deb8504.webp";

const BENEFITS = [
  "Der 5-Schritte-Plan: Von Kassensystem-Abhängigkeit zum Hybrid-Modell",
  "Wie du dir deinen \"Patienten freien Freitag\" sicherst",
  "1:1 Praxis Analyse",
];

export default function ExitPlan() {
  usePageView("exit-plan");
  const [popupOpen, setPopupOpen] = useState(false);
  const exitIntentFired = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Testoptimierer A/B-Testing Tag
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/api/testoptimierer/tag/150001";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Exit-Intent: Popup öffnen wenn Maus den Viewport nach oben verlässt (einmal pro Session)
  useEffect(() => {
    const SESSION_KEY = "exit-plan-exit-intent-fired";
    if (sessionStorage.getItem(SESSION_KEY)) {
      exitIntentFired.current = true;
    }

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !exitIntentFired.current && !popupOpen) {
        exitIntentFired.current = true;
        sessionStorage.setItem(SESSION_KEY, "true");
        setPopupOpen(true);
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [popupOpen]);

  return (
    <>
    <SEO {...SEO_CONFIG.exitPlan} />
    <div className="relative flex flex-col overflow-hidden">
      {/* === FULLSCREEN BACKGROUND: Blurred image covering entire section === */}
      <div className="absolute inset-0 -z-10">
        {/* Collage image as full background */}
        <img
          src={BG_BLURRED_URL}
          width={500}
          height={500}
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
        {/* Mobile gradient: Leichter Gradient damit BG-Muster auf ganzer Seite sichtbar ist */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,15,28,0.85) 0%, rgba(6,15,28,0.7) 30%, rgba(6,15,28,0.55) 50%, rgba(6,15,28,0.45) 70%, rgba(6,15,28,0.35) 100%)",
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
            {/* Header Badge */}
            <div className="mb-3 inline-block rounded-sm border border-gold/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold md:text-[11px] md:whitespace-nowrap">
              Internes Dokument (inkl. Umsetzungs-Roadmap)
            </div>

            {/* Über-Headline (Sub-Headline) */}
            <p className="mb-2 font-display text-sm font-medium italic text-gold md:text-base">
              Interne Schritt für Schritt Anleitung
            </p>

            {/* Headline – GRÖSSER */}
            <h1 className="mb-4 font-display text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-foreground md:text-[2.5rem] lg:text-[3rem]">
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

            {/* Inklusive */}
            <p className="mb-4 text-sm italic text-foreground/80 md:text-base">
              Inklusive: Bewiesenem Weg von Kassenabhängigkeit zu online
              Umsatzquellen + die konkrete Roadmap für deinen "Patienten freien
              Freitag"
            </p>

            {/* CTA Button */}
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

            {/* === MOBILE: Mockup nach TÜV – GRÖSSER + klickbar === */}
            <div
              className="mb-2 flex cursor-pointer items-center justify-center lg:hidden"
              onClick={() => setPopupOpen(true)}
            >
              <img
                src={MOCKUP_URL}
                width={768}
                height={768}
                alt="Exit-Plan Vorschau"
                className="w-full max-w-[340px] object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-[1.02]"
              />
            </div>

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

          {/* === Right Column: Mockup (Desktop only) – GRÖSSER + klickbar === */}
          <div
            className="hidden flex-1 cursor-pointer items-center justify-center lg:flex"
            onClick={() => setPopupOpen(true)}
          >
            <img
              src={MOCKUP_URL}
                width={768}
                height={768}
              alt="Exit-Plan Mockup"
              className="w-full max-w-lg object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-[1.02]"
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
        headline="An wen dürfen wir den Exit-Plan senden?"
        subtext="Die Inhalte kommen per WhatsApp deswegen gib bitte deine WhatsApp Nummer ein"
        source="exit-plan"
        redirectTo="/exit-plan-termin"
      />
    </div>
    </>
  );
}
