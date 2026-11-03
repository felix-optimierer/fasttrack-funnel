import { ArrowRight, Check, CheckCircle2, Palette } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { ASSETS } from "@/lib/site";
import { Logo, TripleSeals, Footer } from "@/components/funnel";
import { usePageView } from "@/hooks/usePageView";

export default function DankeSelbstzahler() {
  usePageView("danke-selbstzahler");

  return (
    <>
      <SEO {...SEO_CONFIG.dankeSelbstzahler} />
      <div className="flex min-h-screen flex-col">
        <header className="container flex items-center justify-center py-3 md:py-4"><Logo /></header>
        <main
          className="flex-1"
          style={{
            backgroundImage: `linear-gradient(rgba(6,15,28,0.9), rgba(6,15,28,0.97)), url(${ASSETS.heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        >
          <section className="container pb-12 pt-6 text-center md:pt-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Dein Report ist vorgemerkt
            </div>
            <h1 className="mx-auto max-w-3xl text-balance text-3xl font-extrabold leading-tight md:text-5xl">
              Das ging schnell!<br />
              <span className="text-gradient-gold">Dein Selbstzahler-Report ist gesichert.</span>
            </h1>
            <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-gold/25 bg-card/80 p-5 text-left shadow-xl sm:p-7">
              <div className="flex items-start gap-3">
                <Palette className="mt-0.5 h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold text-foreground sm:text-lg">Der letzte Schliff läuft gerade.</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Der Report liegt gerade beim finalen Schliff bei unserem Designer. Sobald er nächste Woche fertig ist, senden wir ihn dir sofort zu.
                    Du musst dich dafür nicht noch einmal eintragen.
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gold">Du musst nicht bis nächste Woche warten</p>
              <h2 className="text-balance text-xl font-extrabold leading-tight sm:text-3xl">
                Lass uns die Strategie schon jetzt auf deine Praxis anpassen.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                In deiner kostenlosen Praxisanalyse schauen wir gemeinsam, wie dein Team passende Selbstzahler-Angebote verkaufen und deine Praxis kassenunabhängige Umsätze aufbauen kann.
              </p>
              <ul className="mx-auto mt-5 max-w-lg space-y-3 text-left text-sm text-foreground/90">
                {[
                  "Welche Selbstzahler-Angebote zu deiner Praxis und deinen Patienten passen",
                  "Wie du dein Team beim Ansprechen der Angebote mitnimmst",
                  "Welche nächsten Schritte für mehr Gewinn und weniger eigene Behandlungsstunden sinnvoll sind",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /><span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="/termin?quelle=selbstzahler"
                className="btn-press mt-7 inline-flex max-w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-6 py-4 text-sm font-bold text-navy shadow-lg transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:text-base"
              >
                Jetzt kostenlose Praxisanalyse buchen <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </a>
              <p className="mt-3 text-xs text-muted-foreground">Kostenlos &amp; unverbindlich. Dein Report bleibt unabhängig von einer Buchung für dich vorgemerkt.</p>
            </div>
            <div className="mt-10 flex flex-col items-center gap-2">
              <TripleSeals />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">Dreifach TÜV-zertifiziert</p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
