// VSL PAGE — wie ecomscaling.org/sta-vsl.
// Headline + Proof + Video + CTA über/unter Video + Fallstudien + Buchungs-CTA.
import { useEffect, useState } from "react";
import { ASSETS, BRAND } from "@/lib/site";
import {
  Logo,
  GoldButton,
  ProofBar,
  CaseGrid,
  TrustBadges,
  Footer,
} from "@/components/funnel";
import { Play, Volume2, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Vsl() {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function scrollToBooking() {
    document
      .getElementById("buchung")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen">
      <header className="container flex items-center justify-center py-6">
        <Logo />
      </header>

      <main
        className="relative"
        style={{
          backgroundImage: `linear-gradient(rgba(6,15,28,0.86), rgba(6,15,28,0.96)), url(${ASSETS.heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      >
        {/* Headline + Proof */}
        <section className="container pb-2 pt-2 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Die komplette Fallstudie · in unter 15 Minuten erklärt
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-2xl font-extrabold leading-[1.15] md:text-4xl">
            So machst du deine Praxis 2026{" "}
            <span className="text-gradient-gold">kassenunabhängiger</span> – mit
            KI-Webseite in unter 1 Stunde und deiner eigenen Coaching-App
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Schau dir das kurze Video an. Danach weißt du genau, wie das
            Fast-Track-System funktioniert.
          </p>
        </section>

        {/* Video */}
        <section className="container pb-6">
          <div className="mx-auto max-w-3xl">
            <GoldButton glow className="mb-5 w-full text-base md:text-lg" onClick={scrollToBooking}>
              Ja, ich will eine kostenlose Demo
              <ArrowRight className="h-5 w-5" />
            </GoldButton>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl">
              <video
                className="h-full w-full object-cover"
                poster={ASSETS.dashboard}
                autoPlay
                loop
                muted={muted}
                playsInline
              >
                {/* Hier echtes VSL-Video einsetzen (z.B. Wistia/MP4) */}
              </video>
              {/* Overlay-Hinweis Ton */}
              <button
                onClick={() => {
                  setMuted(!muted);
                  toast.info(
                    muted ? "Ton aktiviert" : "Ton stummgeschaltet",
                  );
                }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-deep/40 transition hover:bg-navy-deep/30"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy shadow-lg">
                  {muted ? (
                    <Volume2 className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7" />
                  )}
                </span>
                <span className="rounded-full bg-navy-deep/70 px-4 py-1.5 text-sm font-semibold text-foreground backdrop-blur">
                  {muted ? "Für Ton klicken" : "Video läuft"}
                </span>
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Platzhalter-Video. Echtes VSL einfach in der Komponente ersetzen.
            </p>

            <GoldButton glow className="mt-6 w-full text-base md:text-lg" onClick={scrollToBooking}>
              Demo-Termin sichern – solange Plätze frei sind
              <ArrowRight className="h-5 w-5" />
            </GoldButton>
          </div>
        </section>

        {/* Proof-Band */}
        <section className="container pb-12">
          <div className="mx-auto max-w-4xl">
            <ProofBar />
          </div>
        </section>
      </main>

      {/* Fallstudien */}
      <section className="border-t border-border bg-navy py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Echte Praxen. Echte Ergebnisse.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Diese Praxisinhaber haben das Fast-Track-System umgesetzt – von der
              Agentur-Abhängigkeit zur eigenen Online-Maschine.
            </p>
          </div>
          <CaseGrid />
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Weitere Fallstudien werden laufend ergänzt.
          </p>
        </div>
      </section>

      {/* Mechanismus / Was du lernst */}
      <section className="bg-navy-deep py-16">
        <div className="container max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-extrabold md:text-3xl">
            Das Fast-Track-System in 3 Schritten
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Agentur-Unabhängigkeit",
                d: "Deine Traumwebseite mit KI in unter 1 Stunde – volle Kontrolle, null Agenturkosten.",
              },
              {
                n: "02",
                t: "Angebots-Skalierung",
                d: "Deine eigene Klienten-Coaching-App und hochpreisige Pakete statt 20-Minuten-Taktung.",
              },
              {
                n: "03",
                t: "Kassen-Befreiung",
                d: "Planbare Online-Umsätze in wenigen Wochen – mehr Marge, mehr Freiheit.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="font-display text-3xl font-extrabold text-gold/40">
                  {s.n}
                </div>
                <div className="mt-2 font-display text-lg font-bold">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buchung / CTA */}
      <section id="buchung" className="bg-navy py-16">
        <div className="container max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-gold">
            <Calendar className="h-3.5 w-3.5" />
            Begrenzte Plätze · 1-zu-1 Betreuung
          </div>
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Sichere dir jetzt deine kostenlose Demo
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground md:text-base">
            Wir schauen uns deine Praxis an und zeigen dir, wie das
            Fast-Track-System konkret bei dir funktioniert.
          </p>

          {/* Platzhalter für Kalender-Embed (z.B. Calendly) */}
          <div className="mt-8 rounded-2xl border border-dashed border-gold/40 bg-card p-10">
            <Calendar className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-4 text-sm text-muted-foreground">
              Hier wird dein Buchungs-Kalender eingebettet (z.B. Calendly /
              TidyCal).
            </p>
            <GoldButton
              glow
              className="mt-6"
              onClick={() => toast.info("Hier den echten Kalender-Link einsetzen.")}
            >
              Demo-Termin wählen
              <ArrowRight className="h-5 w-5" />
            </GoldButton>
          </div>

          <div className="mt-8">
            <TrustBadges />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
