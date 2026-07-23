// KI-REPORT-TERMIN PAGE — Nach Opt-in auf /ki-report: WhatsApp-Button + Calendly-Buchung.
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { ASSETS } from "@/lib/site";
import { Logo, DoubleSeals, Footer } from "@/components/funnel";
import { useLocation } from "wouter";
import { usePageView } from "@/hooks/usePageView";

// === CALENDLY ===
const CALENDLY_URL =
  "https://calendly.com/d/d3f9-kc7-rc3/kostenloses-ki-analysegesprach";

// === WHATSAPP ===
const WHATSAPP_NUMBER = "491791653801";
const WHATSAPP_KEYWORD = "KI-Report 2026";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_KEYWORD)}`;

export default function KiReportTermin() {
  const [, navigate] = useLocation();

  usePageView("ki-report-termin");

  // Testoptimierer: Load tag on conversion page to track conversion
  useEffect(() => {
    const toScript = document.createElement("script");
    toScript.src = "/api/testoptimierer/tag/120001";
    toScript.async = true;
    document.body.appendChild(toScript);
    return () => { try { document.body.removeChild(toScript); } catch(e) {} };
  }, []);

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
    <SEO {...SEO_CONFIG.kiReportTermin} />
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
          {/* Headline: Herzlichen Glückwunsch */}
          <h1 className="mx-auto max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] md:text-4xl">
            Herzlichen Glückwunsch, du hast dir den{" "}
            <span className="text-gradient-gold">KI-Report 2026</span>{" "}
            gesichert.
          </h1>

          {/* Badge: WhatsApp-Anweisung */}
          <div className="mt-4 mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-2 text-xs font-semibold text-gold backdrop-blur md:text-sm">
            Klicke auf den Button und sende uns eine WhatsApp-Nachricht, um anschließend den KI-Report 2026 zu erhalten.
          </div>

          {/* WhatsApp-Button */}
          <div className="mb-12">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#1ebe57] hover:shadow-xl active:scale-[0.97] md:text-lg"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Jetzt KI-Report 2026 zugesendet bekommen
            </a>
          </div>

          {/* Trennlinie */}
          <div className="mx-auto mb-8 max-w-md border-t border-border/30" />

          {/* Calendly-Bereich */}
          <h2 className="mx-auto max-w-2xl text-balance text-xl font-bold leading-[1.2] md:text-2xl mb-6">
            Sichere dir jetzt deine{" "}
            <span className="text-gradient-gold">1:1-Praxisanalyse</span>
          </h2>

          <div className="mx-auto max-w-3xl">
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
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
