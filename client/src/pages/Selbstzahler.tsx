import { useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, TripleSeals, Footer } from "@/components/funnel";
import { LeadPopup } from "@/components/LeadPopup";
import { SelbstzahlerReportPreview } from "@/components/SelbstzahlerReportPreview";
import { usePageView } from "@/hooks/usePageView";

const BENEFITS = [
  { title: "Mehr Gewinn bei weniger Behandlungsstunden", text: "Baue zusätzliche Einnahmen auf, statt deinen eigenen Behandlungskalender noch voller zu machen." },
  { title: "Endlich kassenunabhängige Online-Umsätze in deiner Physiopraxis", text: "Erfahre, wie digitale Selbstzahler-Angebote dein bestehendes Praxisgeschäft ergänzen können." },
  { title: "Ein Team, das passende Angebote selbst anspricht", text: "Damit nicht jedes Verkaufsgespräch an dir als Praxisinhaber hängen bleibt." },
];

export default function Selbstzahler() {
  usePageView("selbstzahler");
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <>
      <SEO {...SEO_CONFIG.selbstzahler} />
      <div
        className="relative flex min-h-screen flex-col overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(110deg, rgba(6,15,28,0.98) 0%, rgba(6,15,28,0.94) 48%, rgba(6,15,28,0.78) 100%), url(${ASSETS.heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <header className="container flex items-center py-3"><Logo /></header>
        <main className="container flex flex-1 flex-col justify-center pb-10 pt-5 lg:py-10">
          <div data-selbstzahler-intro className="mb-7 w-full lg:mb-9">
            <div className="mb-4 inline-block rounded-sm border border-gold/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold sm:text-[11px]">
              Für Physiopraxis-Inhaber mit angestellten Therapeuten
            </div>
            <p className="mb-2 text-base font-semibold text-gold sm:text-lg">Kostenloser Report enthüllt:</p>
            <h1 aria-describedby="selbstzahler-ziel-hinweis" className="w-full font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-[2.5rem] lg:text-5xl xl:text-[3.25rem]">
              Wie deine Angestellten-Therapeuten endlich täglich{" "}
              <span className="text-gradient-gold">Selbstzahler-Angebote verkaufen</span>{" "}
              für <span className="text-gradient-gold">1.000 € extra Gewinn pro Therapeut im Monat</span>
            </h1>
            <p id="selbstzahler-ziel-hinweis" className="mt-3 max-w-4xl text-xs leading-relaxed text-muted-foreground">
              Gewinnziel, keine Ergebnisgarantie. Ob und in welcher Höhe du zusätzlichen Gewinn erzielst, hängt von deinen individuellen Angeboten, deiner Marge und deiner Umsetzung ab.
            </p>
          </div>
          <div data-selbstzahler-content className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <div className="w-full max-w-2xl lg:max-w-xl lg:flex-[1.3]">
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Dein Team behandelt den ganzen Tag. Doch wenn es um Selbstzahler-Angebote geht, bleibt vieles an dir hängen?
                Entdecke, wie deine Therapeuten passende Angebote im Praxisalltag ansprechen und du dir ein zusätzliches Umsatzstandbein aufbaust.
              </p>
              <GoldButton glow className="mb-3 sm:!w-auto sm:!max-w-fit" onClick={() => setPopupOpen(true)}>
                Kostenlosen Report sichern <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </GoldButton>
              <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
                100 % kostenlos &amp; unverbindlich.
              </p>
              <div className="mb-6 flex w-full flex-col items-start gap-2 lg:hidden">
                <TripleSeals />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Dreifach TÜV-zertifiziert</p>
              </div>
              <div className="mb-6 lg:hidden"><SelbstzahlerReportPreview /></div>
              <ul className="space-y-4">
                {BENEFITS.map(({ title, text }) => (
                  <li key={title} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold leading-snug text-foreground sm:text-base">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 hidden w-full flex-col items-start gap-2 lg:flex">
                <TripleSeals />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Dreifach TÜV-zertifiziert</p>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                Erfahrung aus über 200 begleiteten Physiopraxen
              </p>
            </div>
            <div className="hidden w-full max-w-md flex-1 lg:block"><SelbstzahlerReportPreview /></div>
          </div>
        </main>
        <Footer />
        <LeadPopup
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          headline="An wen dürfen wir den Selbstzahler-Report senden?"
          subtext="Sichere dir den kostenlosen Report. Bitte gib dafür deine Kontaktdaten inklusive WhatsApp-Nummer an."
          source="selbstzahler"
          redirectTo="/danke-selbstzahler"
          submitLabel="Kostenlosen Report sichern"
        />
      </div>
    </>
  );
}
