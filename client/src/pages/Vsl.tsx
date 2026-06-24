// VSL PAGE — maximal on point (Vorbild: ecomscaling.org/sta-vsl).
// EIN Hook: Webseite mit KI-Agenten in unter 60 Min. Trust-Siegel + Video + 1 CTA, dann 7 Beweise + Buchung.
import { useEffect, useState } from "react";
import { ASSETS, HOOK } from "@/lib/site";
import {
  Logo,
  GoldButton,
  ProofBar,
  CaseGrid,
  TrustBadges,
  Footer,
} from "@/components/funnel";
import { Play, Volume2, Calendar, ArrowRight, Check } from "lucide-react";
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
          {/* TÜV-Trust-Siegel + Trust-Zeile */}
          <div className="mb-4 flex flex-col items-center gap-3">
            <img
              src={ASSETS.trustSeal}
              alt="Doppelt zertifiziert & geprüft"
              className="h-16 w-16 drop-shadow-[0_4px_16px_rgba(201,162,39,0.25)]"
            />
            <span className="rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-sm font-semibold text-gold backdrop-blur">
              {HOOK.trust}
            </span>
          </div>

          {/* Sub-Headline */}
          <h1 className="mx-auto max-w-3xl text-balance text-xl font-extrabold leading-[1.18] md:text-3xl">
            Wie unsere Kunden schon{" "}
            <span className="text-gradient-gold">&gt;100 Praxis-Webseiten</span>{" "}
            mit KI-Agenten in 2026 durch die neuen KI-Modelle DSGVO-konform
            gebaut haben.
          </h1>

          {/* 4-Minuten-Hinweis */}
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Alle Infos in 4 Minuten (auf 2× Speed)
          </p>
        </section>

        {/* Video + EIN CTA */}
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

      {/* 7 Beweise */}
      <section className="border-t border-border bg-navy py-14">
        <div className="container">
          <h2 className="mb-2 text-center text-2xl font-extrabold md:text-3xl">
            7 Beweise. Echte Praxen.
          </h2>
          <p className="mb-9 text-center text-sm text-muted-foreground">
            Über 100× bewiesen – hier sind 7 davon.
          </p>
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
