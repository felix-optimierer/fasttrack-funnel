// EXIT-PLAN PAGE — Lead-Magnet-Landingpage nach Vorbild speedscaling.de/roas-5
// Zweispaltiges Layout: Text links, Mockup rechts. Heller Hintergrund.
import { useEffect } from "react";
import { ASSETS } from "@/lib/site";
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
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header / Logo */}
      <header className="container flex items-center py-5 md:py-6">
        <img
          src={ASSETS.logo}
          alt="PhysioFreiheit"
          className="h-8 w-auto md:h-10"
        />
      </header>

      {/* Main Content */}
      <main className="container pb-16 pt-4 md:pt-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Left Column – Text */}
          <div className="flex-1 max-w-2xl">
            {/* Header Badge */}
            <div className="mb-5 inline-block rounded-sm border border-neutral-800 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-800 md:text-xs">
              Internes Dokument (inkl. Umsetzungs-Roadmap)
            </div>

            {/* Subheadline */}
            <p className="mb-2 text-base font-medium italic text-amber-600 md:text-lg">
              Der 5-Schritte Exit-Plan
            </p>

            {/* Headline */}
            <h1 className="mb-5 text-2xl font-extrabold uppercase leading-[1.1] tracking-tight text-neutral-900 md:text-[2rem] lg:text-[2.4rem]">
              Raus aus der Zeit-gegen-Geld-Falle
            </h1>

            {/* Body Copy */}
            <p className="mb-7 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-base">
              Entdecke den exakten 5 Schritte-Plan, mit{" "}
              <strong>100+ Praxis-Inhaber ihre Behandlungszeit reduziert haben</strong>{" "}
              bei mehr Gewinn auf dem Konto durch modernste KI-Agenten &amp;
              kassenunabhängige online Umsätze ohne noch mehr Patienten behandeln
              zu müssen.{" "}
              <em>
                Inklusive: Der 5-Schritte-Plan von Kassensystem-Abhängigkeit zu
                online Umsatzquellen + die konkrete Roadmap für deinen
                "Patienten freien Freitag" + konkrete KI-Beispiele
              </em>
            </p>

            {/* CTA Button */}
            <button
              className="mb-7 inline-flex items-center gap-3 rounded-full bg-emerald-500 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-emerald-600 hover:shadow-xl active:scale-[0.97] md:text-base"
              onClick={() => {
                // TODO: Lead-Erfassung / Download-Logik
                window.alert("Download-Funktion wird noch verknüpft.");
              }}
            >
              <Download className="h-5 w-5" />
              Jetzt kostenlos herunterladen
            </button>

            {/* Benefit Points */}
            <ul className="space-y-3">
              {BENEFITS.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-neutral-800 md:text-base"
                >
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-700" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
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
              <div className="flex h-80 w-full max-w-md items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 lg:h-[28rem] lg:max-w-lg">
                <p className="text-center text-sm text-neutral-400">
                  Mockup-Bild<br />
                  <span className="text-xs">(wird noch eingefügt)</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-100 py-6">
        <div className="container flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Bewegungsoptimierer GmbH – Alle Rechte
            vorbehalten.
          </p>
          <div className="flex gap-5 text-xs text-neutral-500">
            <a
              href="https://physiofrei.de/impressum?utm_source=fasttrack-funnel&utm_medium=footer&utm_campaign=exit-plan"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900"
            >
              Impressum
            </a>
            <a
              href="https://physiofrei.de/datenschutz?utm_source=fasttrack-funnel&utm_medium=footer&utm_campaign=exit-plan"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900"
            >
              Datenschutz
            </a>
          </div>
          <p className="max-w-2xl text-[11px] leading-relaxed text-neutral-400">
            Wir verwenden die im Rahmen der Anmeldung erhobene E-Mail-Adresse,
            um dich per E-Mail über inhaltlich ähnliche eigene Angebote zu
            informieren. Die Verarbeitung erfolgt auf Grundlage von § 7 Abs. 3
            UWG. Du kannst der Verwendung deiner E-Mail-Adresse jederzeit mit
            Wirkung für die Zukunft widersprechen.
          </p>
        </div>
      </footer>
    </div>
  );
}
