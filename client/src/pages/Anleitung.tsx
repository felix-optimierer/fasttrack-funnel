// ANLEITUNG PAGE (vormals /vsl) — maximal on point.
// EIN Hook: Webseite mit KI-Agenten in unter 60 Min. Trust-Siegel + Video + 1 CTA, dann echte Fallstudien + Buchung.
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { useLocation } from "wouter";
import { ASSETS, HOOK } from "@/lib/site";
import {
  Logo,
  GoldButton,
  ProofBar,
  CaseGrid,
  TrustBadges,
  DoubleSeals,
  Footer,
} from "@/components/funnel";
import { Calendar, ArrowRight } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";

export default function Anleitung() {
  const [, navigate] = useLocation();

  usePageView("vsl");

  useEffect(() => {
    window.scrollTo(0, 0);
    // Load Wistia player script
    const script = document.createElement("script");
    script.src = "https://fast.wistia.net/player.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  function goToTermin() {
    navigate("/webseite-termin");
  }

  return (
    <>
    <SEO {...SEO_CONFIG.anleitung} />
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
              <div className="wistia_responsive_padding" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                <div className="wistia_responsive_wrapper" style={{ height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }}>
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/dp3vfy7i47?web_component=true&seo=true"
                    title="VSL Neu Video"
                    allow="autoplay; fullscreen"
                    frameBorder="0"
                    scrolling="no"
                    className="wistia_embed"
                    name="wistia_embed"
                    width="100%"
                    height="100%"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  />
                </div>
              </div>
            </div>

            <GoldButton glow className="mt-4 w-full" onClick={goToTermin}>
              Kostenlose 1:1 Praxisanalyse sichern
              <ArrowRight className="h-5 w-5" />
            </GoldButton>

            {/* Echte TÜV-Rheinland-Siegel unter dem Video */}
            <div className="mt-6 flex flex-col items-center gap-2.5">
              <DoubleSeals />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Doppelt TÜV-zertifiziert
              </p>
            </div>
          </div>
        </section>

        {/* Proof-Band */}
        <section className="container pb-10">
          <div className="mx-auto max-w-4xl">
            <ProofBar />
          </div>
        </section>
      </main>

      {/* 9 Beweise */}
      <section className="border-t border-border bg-navy py-14">
        <div className="container">
          <h2 className="mb-2 text-center text-2xl font-extrabold md:text-3xl">
            Echte Praxen. Echte Ergebnisse.
          </h2>
          <p className="mb-9 text-center text-sm text-muted-foreground">
            Über 100× bewiesen – hier sind echte Stimmen unserer Kunden.
          </p>
          <CaseGrid />
        </div>
      </section>

      {/* CTA -> /webseite-termin */}
      <section className="bg-navy-deep py-14">
        <div className="container max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card px-4 py-1.5 text-sm font-semibold text-gold">
            <Calendar className="h-4 w-4" />
            Begrenzte Plätze
          </div>
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Sichere dir deine kostenlose 1:1 Praxisanalyse.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Wähle im nächsten Schritt deinen Wunschtermin – wir zeigen dir live,
            wie deine Praxis-Webseite in unter 60 Minuten entsteht.
          </p>
          <div className="mt-7 flex justify-center">
            <GoldButton glow className="max-w-sm" onClick={goToTermin}>
              Jetzt Termin sichern
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
    </>
  );
}
