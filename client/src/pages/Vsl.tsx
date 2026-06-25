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
        <section className="container pt-1 text-center">
          {/* Trust nur als kompaktes Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur md:text-sm">
            {HOOK.trust}
          </div>

          {/* Sub-Headline – kompakter */}
          <h1 className="mx-auto max-w-2xl text-balance text-lg font-extrabold leading-[1.2] md:text-2xl">
            Wie schon{" "}
            <span className="text-gradient-gold">&gt;100 unserer Kunden</span>{" "}
            DSGVO-konforme Praxis-Webseiten in 2026 mit KI-Agenten durch die
            neusten KI-Modelle gebaut haben
          </h1>

          {/* 4-Minuten-Hinweis */}
          <p className="mt-2 text-xs font-medium text-muted-foreground md:text-sm">
            Alle Infos in 4 Minuten (auf 2× Speed)
          </p>
        </section>

        {/* Video + EIN CTA */}
        <section className="container pb-6 pt-4">
          <div className="mx-auto max-w-2xl">
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
              className="mt-4 w-full"
              subLabel="2FA Verification Required"
              onClick={scrollToBooking}
            >
              Kostenlose Demo sichern
              <ArrowRight className="h-5 w-5" />
            </GoldButton>
          </div>
        </section>

        {/* Proof-Band */}
        <section className="container pb-10">
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
