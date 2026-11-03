// TERMIN PAGE — Zentrale Buchungsseite für KI-Praxisanalyse (KI-Report + Exit-Plan)
import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { SEO } from "@/components/SEO";
import { ASSETS } from "@/lib/site";
import { Logo, TripleSeals, Footer } from "@/components/funnel";
import { usePageView } from "@/hooks/usePageView";

// === CALENDLY ===
const CALENDLY_URL =
  "https://calendly.com/d/d3f9-kc7-rc3/kostenloses-ki-analysegesprach";

export default function Termin() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const isSelbstzahler = new URLSearchParams(search).get("quelle") === "selbstzahler";
  const bookingUrl = isSelbstzahler ? `${CALENDLY_URL}?utm_source=funnel&utm_campaign=selbstzahler` : CALENDLY_URL;

  usePageView("termin");

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
      try { document.body.removeChild(script); } catch(e) {}
    };
  }, [navigate]);

  return (
    <>
    <SEO
      title={isSelbstzahler ? "Kostenlose Selbstzahler-Praxisanalyse buchen | PhysioFreiheit" : "Kostenlose KI-Praxisanalyse buchen | PhysioFreiheit"}
      description={isSelbstzahler ? "Passe die Selbstzahler-Strategie auf deine Physiopraxis an. Buche deine kostenlose Praxisanalyse." : "Buche jetzt deine kostenlose 1:1 KI-Praxisanalyse und erfahre, wie du mit KI deine Praxis auf das nächste Level bringst."}
      canonical="https://go.physiofreiheit.de/termin"
    />
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
          {/* Headline */}
          <h1 className="mx-auto max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] md:text-4xl">
            Buche jetzt deine{" "}
            <span className="text-gradient-gold">{isSelbstzahler ? "kostenlose 1:1 Praxisanalyse" : "kostenlose 1:1 KI-Praxisanalyse"}</span>
          </h1>

          {/* Calendly-Bereich */}
          <div className="mx-auto max-w-3xl">
            <div
              className="calendly-inline-widget overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              data-url={bookingUrl}
              style={{ minWidth: "320px", height: "700px" }}
            />
          </div>

          {/* TÜV-Siegel */}
          <div className="mt-10 flex flex-col items-center gap-2 sm:gap-3">
            <TripleSeals />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
              Dreifach TÜV-zertifiziert
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
