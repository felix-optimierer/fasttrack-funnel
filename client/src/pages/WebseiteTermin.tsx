// WEBSEITE-TERMIN PAGE — Calendly-Buchungsseite für die kostenlose KI-Praxisanalyse.
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { ASSETS, HOOK } from "@/lib/site";
import { Logo, DoubleSeals, Footer } from "@/components/funnel";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { usePageView } from "@/hooks/usePageView";

// === CALENDLY ===
const CALENDLY_URL =
  "https://calendly.com/d/d3f9-kc7-rc3/kostenloses-ki-analysegesprach";

export default function WebseiteTermin() {
  const [, navigate] = useLocation();

  usePageView("webseite-termin");

  useEffect(() => {
    window.scrollTo(0, 0);
    // Calendly-Widget-Skript laden
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    // Nach erfolgreicher Buchung automatisch auf die Danke-Seite leiten
    const onMessage = (e: MessageEvent) => {
      if (
        e.data?.event === "calendly.event_scheduled" ||
        (typeof e.data === "object" &&
          e.data?.event &&
          String(e.data.event).indexOf("calendly.event_scheduled") === 0)
      ) {
        navigate("/danke-termin");
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      document.body.removeChild(script);
    };
  }, [navigate]);

  return (
    <>
    <SEO {...SEO_CONFIG.webseiteTermin} />
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
        <section className="container pb-14 pt-2 text-center">
          {/* Trust-Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur md:text-sm">
            {HOOK.trust}
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] md:text-4xl">
            Sichere dir deine kostenlose{" "}
            <span className="text-gradient-gold">KI-Praxisanalyse</span>
          </h1>

          {/* Calendly-Embed */}
          <div className="mx-auto mt-8 max-w-3xl">
            <div
              className="calendly-inline-widget overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              data-url={CALENDLY_URL}
              style={{ minWidth: "320px", height: "700px" }}
            />
          </div>

          {/* TÜV-Siegel */}
          <div className="mt-10 flex flex-col items-center gap-2 sm:gap-3">
            <DoubleSeals />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
              Doppelt TÜV-zertifiziert
            </p>
          </div>

          {/* Zurück-Link */}
          <button
            onClick={() => navigate("/anleitung")}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Anleitung
          </button>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
