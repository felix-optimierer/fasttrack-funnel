// HAUPTSEITE — Übersicht über alle kostenlosen Inhalte
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { SEO_CONFIG } from "@/lib/seo-config";
import { useLocation } from "wouter";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { ArrowRight, ExternalLink } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";

const KI_REPORT_MOCKUP = "/manus-storage/ki-report-mockup_d908aa59.webp";
const EXIT_PLAN_MOCKUP = "/manus-storage/exit-plan-mockup_be5b5130.webp";

const TRAUMWEBSEITE_MOCKUP = "/manus-storage/traumwebseite-mockup_2e12bd15.webp";

const OFFERS = [
  {
    title: "Deine Traumwebseite in 60 Minuten",
    description:
      "Als Praxisinhaber deine Traumwebseite per KI-Agent bauen lassen ohne Technikkenntnisse, ohne Agentur, ohne Baukasten.",
    cta: "Jetzt Fallstudien ansehen",
    href: "/traumwebseite",
    mockup: TRAUMWEBSEITE_MOCKUP,
  },
  {
    title: "Physiopraxis KI-Report 2026",
    description:
      "Die 3 KI-Strategien, die deine Praxis in 2026 revolutionieren. Die 5 fatalsten Fehler, die 90% aller Physiopraxen machen.",
    cta: "KI-Report kostenlos sichern",
    href: "/ki-report",
    mockup: KI_REPORT_MOCKUP,
  },
  {
    title: "Der 5-Schritte Exit-Plan",
    description:
      "Der exakte Plan, mit dem 100+ Praxis-Inhaber ihre Behandlungszeit reduziert haben bei mehr Gewinn auf dem Konto.",
    cta: "Exit-Plan kostenlos sichern",
    href: "/exit-plan",
    mockup: EXIT_PLAN_MOCKUP,
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  usePageView("home");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
    <SEO {...SEO_CONFIG.home} />
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(6,15,28,0.92), rgba(6,15,28,0.97)), url(${ASSETS.heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="container flex items-center justify-center py-4 md:py-6">
        <Logo />
      </header>

      <main className="container flex flex-1 flex-col items-center pb-10 pt-4 text-center">
        {/* Headline */}
        <h1 className="max-w-3xl text-balance text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">
          Sichere dir unsere{" "}
          <span className="text-gradient-gold">kostenlosen Inhalte</span>
        </h1>

        {/* 3 Container */}
        <div className="mx-auto mt-8 grid w-full max-w-5xl gap-6 md:mt-12 md:grid-cols-3">
          {OFFERS.map((offer) => (
            <div
              key={offer.href}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card/80 p-5 text-center shadow-xl backdrop-blur transition hover:border-gold/50 hover:shadow-gold/10"
            >
              {/* Mockup */}
              <div className="mb-2 flex h-52 items-center justify-center md:h-60">
                <img
                  src={offer.mockup}
                  alt={offer.title}
                  width={768}
                  height={768}
                  loading="lazy"
                  className="max-h-full w-auto object-contain drop-shadow-lg transition group-hover:scale-[1.03]"
                />
              </div>

              {/* Text */}
              <h2 className="text-lg font-bold leading-snug md:text-xl">
                {offer.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {offer.description}
              </p>

              {/* CTA */}
              <GoldButton
                className="mt-5 w-full"
                onClick={() => navigate(offer.href)}
              >
                {offer.cta}
                <ArrowRight className="h-4 w-4" />
              </GoldButton>
            </div>
          ))}
        </div>

        {/* TÜV-Siegel */}
        <div className="mt-8 flex flex-col items-center gap-2 sm:mt-10 sm:gap-3">
          <DoubleSeals />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
            Doppelt TÜV-zertifiziert
          </p>
        </div>

        {/* Mehr erfahren – physiofreiheit.de */}
        <div className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-border bg-card/60 p-6 text-center backdrop-blur sm:p-8">
          <h2 className="text-lg font-bold md:text-xl">
            Du willst mehr über uns erfahren?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Schau auf unserer Webseite vorbei und erfahre, wie wir über 100
            Physiopraxen bei der Digitalisierung begleitet haben.
          </p>
          <a
            href="https://physiofreiheit.de"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/20"
          >
            physiofreiheit.de besuchen
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
