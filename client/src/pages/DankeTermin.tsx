// DANKE-TERMIN PAGE — Bestätigungsseite nach gebuchter Praxisanalyse.
import { useEffect } from "react";
import { ASSETS } from "@/lib/site";
import { Logo, DoubleSeals, Footer } from "@/components/funnel";
import { CalendarCheck, Mail, Video, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: CalendarCheck,
    title: "1. Termin im Kalender notieren",
    text: "Trage dir den gebuchten Termin direkt in deinen Kalender ein, damit nichts dazwischenkommt. Du bekommst zusätzlich eine automatische Erinnerung.",
  },
  {
    icon: Mail,
    title: "2. Bestätigungs-E-Mail prüfen",
    text: "In deinem Postfach findest du die Bestätigung mit dem Zugangslink zum Gespräch. Schau auch kurz im Spam-Ordner nach und markiere die E-Mail als „kein Spam“.",
  },
  {
    icon: Video,
    title: "3. Auf das Gespräch vorbereiten",
    text: "Überlege dir kurz, wo du aktuell stehst und was du mit deiner Praxis erreichen willst. So holen wir in der Praxisanalyse das Maximum für dich heraus.",
  },
];

export default function DankeTermin() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="container flex items-center justify-center py-3 md:py-4">
        <Logo />
      </header>

      <main
        style={{
          backgroundImage: `linear-gradient(rgba(6,15,28,0.86), rgba(6,15,28,0.95)), url(${ASSETS.heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      >
        <section className="container pb-16 pt-4 text-center">
          {/* Erfolgs-Icon */}
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-card/70 backdrop-blur">
            <CheckCircle2 className="h-9 w-9 text-gold" />
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] md:text-4xl">
            Dein Termin ist <span className="text-gradient-gold">reserviert!</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Stark, dass du den ersten Schritt gemacht hast. Damit deine
            kostenlose Praxisanalyse ein voller Erfolg wird, sind das deine
            nächsten drei Schritte:
          </p>

          {/* Drei Schritte */}
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <article
                key={i}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <s.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </article>
            ))}
          </div>

          {/* TÜV-Siegel */}
          <div className="mt-12 flex flex-col items-center gap-2 sm:gap-3">
            <DoubleSeals />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
              Doppelt TÜV-zertifiziert
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
