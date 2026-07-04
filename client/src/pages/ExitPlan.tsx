// EXIT-PLAN PAGE — Lead-Magnet-Landingpage im PhysioFreiheit Navy-Gold-Design
// Zweispaltiges Layout: Text links, Mockup rechts. Dunkler Hintergrund.
import { useEffect } from "react";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { Download, Check } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";

// Mockup-Bild: Platzhalter bis echtes Bild übergeben wird
const MOCKUP_URL = ""; // TODO: Echtes Mockup-Bild hier einfügen

const BENEFITS = [
  "Der 5-Schritte-Plan: Von Kassensystem-Abhängigkeit zum Hybrid-Modell",
  "Wie du dir deinen \"Patienten freien Freitag\" sicherst",
  "1:1 Praxis Analyse",
];

export default function ExitPlan() {
  usePageView("exit-plan");

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
      <header className="container flex items-center py-4 md:py-5">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="container flex flex-1 flex-col justify-center pb-12 pt-4 md:pt-6">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Left Column – Text */}
          <div className="flex-1 max-w-2xl">
            {/* Header Badge */}
            <div className="mb-5 inline-block rounded-sm border border-gold/50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-gold md:text-xs">
              Interne Schritt für Schritt Anleitung
            </div>

            {/* Headline */}
            <h1 className="mb-5 font-display text-2xl font-extrabold uppercase leading-[1.1] tracking-tight text-foreground md:text-[2rem] lg:text-[2.4rem]">
              Der 5-Schritte<br className="hidden md:inline" /> "Zeit-Gegen-Geld" Exit-Plan
            </h1>

            {/* Body Copy */}
            <p className="mb-7 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Entdecke den exakten 5 Schritte-Plan, mit dem{" "}
              <strong className="text-foreground">
                100+ Praxis-Inhaber ihre Behandlungszeit reduziert haben
              </strong>{" "}
              bei mehr Gewinn auf dem Konto durch modernste KI-Agenten &amp;
              kassenunabhängige online Umsätze ohne noch mehr Patienten behandeln
              zu müssen.
              <br /><br />
              <em className="text-foreground/80">
                Inklusive: Bewiesenem Weg von Kassenabhängigkeit zu online
                Umsatzquellen + die konkrete Roadmap für deinen "Patienten
                freien Freitag"
              </em>
            </p>

            {/* CTA Button */}
            <GoldButton
              glow
              className="mb-7 w-auto px-8"
              onClick={() => {
                // TODO: Lead-Erfassung / Download-Logik
                window.alert("Download-Funktion wird noch verknüpft.");
              }}
            >
              <Download className="h-5 w-5" />
              Jetzt kostenlos herunterladen
            </GoldButton>

            {/* Benefit Points */}
            <ul className="space-y-3">
              {BENEFITS.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-foreground/90 md:text-base"
                >
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* TÜV-Siegel */}
            <div className="mt-8 flex flex-col items-start gap-2">
              <DoubleSeals />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Doppelt TÜV-zertifiziert
              </p>
            </div>
          </div>

          {/* Right Column – Mockup */}
          <div className="flex flex-1 items-center justify-center lg:justify-end">
            {MOCKUP_URL ? (
              <img
                src={MOCKUP_URL}
                alt="Exit-Plan Mockup"
                className="w-full max-w-md rounded-lg shadow-2xl lg:max-w-lg"
              />
            ) : (
              <div className="flex h-80 w-full max-w-md items-center justify-center rounded-2xl border-2 border-dashed border-gold/30 bg-card/50 backdrop-blur lg:h-[28rem] lg:max-w-lg">
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
    </div>
  );
}
