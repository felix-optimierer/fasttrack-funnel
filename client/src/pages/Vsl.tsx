// VSL PAGE — maximal on point (Vorbild: ecomscaling.org/sta-vsl).
// Trust-Zahl + kurze Headline + Video + 1 CTA, dann kompakte Fallstudien + Buchung. Kein Fülltext.
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/site";
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
        style={{
          backgroundImage: `linear-gradient(rgba(6,15,28,0.86), rgba(6,15,28,0.95)), url(${ASSETS.heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      >
        <section className="container pt-2 text-center">
          {/* Trust-Zahl oben */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-sm font-semibold text-gold backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Über 100× bewiesen · 2× TÜV-zertifiziert
          </div>

          {/* Kurze Headline, max 2 Zeilen */}
          <h1 className="mx-auto max-w-2xl text-balance text-2xl font-extrabold leading-[1.12] md:text-4xl">
            Schau dir an, wie es{" "}
            <span className="text-gradient-gold">funktioniert</span>.
          </h1>
        </section>

        {/* Video + EIN CTA darunter */}
        <section className="container pb-8 pt-6">
          <div className="mx-auto max-w-3xl">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl">
              <video
                className="h-full w-full object-cover"
                poster={ASSETS.dashboard}
                autoPlay
                loop
                muted={muted}
                playsInline
              >
                {/* Echtes VSL-Video hier einsetzen */}
              </video>
              <button
                onClick={() => setMuted(!muted)}
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

            <GoldButton
              glow
              className="mt-6 w-full text-base md:text-lg"
              onClick={scrollToBooking}
            >
              Kostenlose Demo sichern
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

      {/* Fallstudien — kompakt, ohne Fülltext */}
      <section className="border-t border-border bg-navy py-14">
        <div className="container">
          <h2 className="mb-8 text-center text-2xl font-extrabold md:text-3xl">
            Echte Praxen. Echte Ergebnisse.
          </h2>
          <CaseGrid />
        </div>
      </section>

      {/* Buchung */}
      <section id="buchung" className="bg-navy-deep py-14">
        <div className="container max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card px-4 py-1.5 text-sm font-semibold text-gold">
            <Calendar className="h-4 w-4" />
            Begrenzte Plätze
          </div>
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Sichere dir deine Demo.
          </h2>

          <div className="mt-7 rounded-2xl border border-dashed border-gold/40 bg-card p-8">
            <Calendar className="mx-auto h-9 w-9 text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">
              Buchungs-Kalender hier einbetten (Calendly / TidyCal).
            </p>
            <GoldButton
              glow
              className="mt-5"
              onClick={() =>
                toast.info("Hier den echten Kalender-Link einsetzen.")
              }
            >
              Termin wählen
              <ArrowRight className="h-5 w-5" />
            </GoldButton>
          </div>

          <div className="mt-7">
            <TrustBadges />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
