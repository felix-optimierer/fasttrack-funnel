// KI-REPORT PAGE — Lead-Magnet-Landingpage im PhysioFreiheit Navy-Gold-Design
// Layout: Blurred-Bild als Hintergrund rechts, scharfes Mockup zentriert darüber
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { Download, Check } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";
import { LeadPopup } from "@/components/LeadPopup";

const BG_BLURRED_URL = "/manus-storage/ki-report-bg-blurred_a5104646.webp";
const MOCKUP_SHARP_URL = "/manus-storage/ki-report-mockup-sharp_b06b329d.webp";

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
      {/* === Navy base background === */}
      <div
        className="absolute inset-0 -z-30"
        style={{
          backgroundImage: `linear-gradient(rgba(6,15,28,0.88), rgba(6,15,28,0.95)), url(${ASSETS.heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* === Right side panel: Blurred image as background + sharp mockup centered on top === */}
      <div className="absolute right-0 top-0 bottom-0 -z-10 hidden w-[42%] lg:block">
        {/* Blurred background image (the collage) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${BG_BLURRED_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Sharp book mockup centered on top of blurred background */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <img
            src={MOCKUP_SHARP_URL}
            alt="KI-Report Mockup"
            className="h-[70%] w-auto max-w-[75%] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          />
        </div>
        {/* Gradient overlay: blends left edge into navy */}
        <div
          className="absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(to right, rgba(6,15,28,1) 0%, rgba(6,15,28,0.7) 15%, rgba(6,15,28,0) 40%)",
          }}
        />
      </div>

      {/* Header / Logo */}
      <header className="container relative flex items-center py-3">
        <Logo />
      </header>

      {/* Main Content – fills viewport */}
      <main className="container relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center pb-8 pt-4">
        {/* Text content – limited width so it doesn't stretch into the image area */}
        <div className="max-w-lg lg:max-w-xl">
          {/* Header Badge */}
          <div className="mb-3 inline-block whitespace-nowrap rounded-sm border border-gold/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold md:text-[11px]">
            Internes Dokument (inkl. KI-Agenten &amp; Prompts für Physiopraxen)
          </div>

          {/* Über-Headline (Sub-Headline – mehrzeilig erlaubt) */}
          <p className="mb-2 font-display text-sm font-medium italic text-gold md:text-base">
            Von 60-Stunden-Wochen zum 3-Tage-Wochenende
          </p>

          {/* Headline – umbrechen: "Der Physiopraxis" / "KI-Report 2026" */}
          <h1 className="mb-4 font-display text-2xl font-extrabold uppercase leading-[1.1] tracking-tight text-foreground md:text-[2rem] lg:text-[2.4rem]">
            Der Physiopraxis
            <br />
            KI-Report 2026
          </h1>

          {/* Body Copy */}
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Entdecke die exakten KI-Strategien, die seit 2026 für moderne
            Physiopraxen möglich sind, um{" "}
            <strong className="text-foreground">
              kinderleicht ihren online Auftritt zu optimieren, ihre Webseite
              neuzugestalten und einen Vollzeit KI Mitarbeiter zu gewinnen
            </strong>
            , alles mit einfacher Sprache ohne Technikkenntnisse.
          </p>

          {/* Inklusive – mehrzeilig */}
          <p className="mb-4 text-sm italic text-foreground/80 md:text-base">
            Inklusive: Den 5 häufigsten Fehlern &amp; echten Praxen als
            Fallbeispiele
          </p>

          {/* CTA Button – schmaler, nicht volle Breite */}
          <GoldButton
            glow
            className="mb-5 w-fit px-8"
            onClick={() => setPopupOpen(true)}
          >
            <Download className="h-5 w-5" />
            Jetzt kostenlos herunterladen
          </GoldButton>

          {/* Benefit Points */}
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

          {/* TÜV-Siegel */}
          <div className="mt-5 flex flex-col items-start gap-2">
            <DoubleSeals />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Doppelt TÜV-zertifiziert
            </p>
          </div>
        </div>

        {/* Mobile fallback – shows blurred image with mockup */}
        <div className="mt-6 flex items-center justify-center lg:hidden">
          <div className="relative">
            <img
              src={BG_BLURRED_URL}
              alt="KI-Report Hintergrund"
              className="w-full max-w-xs rounded-lg opacity-40"
            />
            <img
              src={MOCKUP_SHARP_URL}
              alt="KI-Report Vorschau"
              className="absolute inset-0 m-auto h-[80%] w-auto object-contain"
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
