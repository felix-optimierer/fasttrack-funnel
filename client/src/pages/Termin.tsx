// TERMIN PAGE — Calendly-Buchungsseite (Ziel des VSL-CTAs).
// Hier den echten Calendly-Embed einsetzen (siehe Markierung unten).
import { useEffect } from "react";
import { ASSETS, HOOK } from "@/lib/site";
import { Logo, TrustBadges, Footer } from "@/components/funnel";
import { Calendar, Check, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

// === CALENDLY ===
// Trage hier deinen echten Calendly-Link ein, dann wird der Kalender eingebettet.
// Beispiel: "https://calendly.com/deine-praxis/demo"
const CALENDLY_URL = "";

export default function Termin() {
  const [, navigate] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!CALENDLY_URL) return;
    // Calendly-Widget-Skript laden
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
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
        <section className="container pb-14 pt-2 text-center">
          {/* Trust-Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur md:text-sm">
            {HOOK.trust}
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] md:text-4xl">
            Wähle deinen <span className="text-gradient-gold">Wunschtermin</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground md:text-base">
            Im kostenlosen Demo-Termin zeigen wir dir live, wie deine
            Praxis-Webseite in unter 60 Minuten per KI-Agent entsteht.
          </p>

          {/* Mini-Trust-Punkte */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-foreground/90">
            {["100 % kostenlos", "ca. 30 Minuten", "ohne Verpflichtung"].map(
              (b) => (
                <span key={b} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-gold" />
                  {b}
                </span>
              ),
            )}
          </div>

          {/* Calendly-Embed */}
          <div className="mx-auto mt-8 max-w-3xl">
            {CALENDLY_URL ? (
              <div
                className="calendly-inline-widget overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                data-url={CALENDLY_URL}
                style={{ minWidth: "320px", height: "680px" }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-gold/40 bg-card p-10">
                <Calendar className="mx-auto h-10 w-10 text-gold" />
                <p className="mt-4 text-base font-semibold text-foreground">
                  Calendly hier einbetten
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Trage in <code className="text-gold">Termin.tsx</code> deinen
                  Calendly-Link bei <code className="text-gold">CALENDLY_URL</code>{" "}
                  ein – der Kalender erscheint dann automatisch an dieser Stelle.
                </p>
              </div>
            )}
          </div>

          {/* Zurück-Link */}
          <button
            onClick={() => navigate("/vsl")}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Video
          </button>

          <div className="mt-8">
            <TrustBadges />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
