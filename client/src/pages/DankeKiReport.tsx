// DANKE-KI-REPORT PAGE — Nach Opt-in: Wistia-Video + WhatsApp-Button + Button zu /termin
import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { SEO } from "@/components/SEO";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals, Footer } from "@/components/funnel";
import { ArrowRight } from "lucide-react";
import { usePageView } from "@/hooks/usePageView";

// === WHATSAPP ===
const WHATSAPP_NUMBER = "491791653801";
const WHATSAPP_KEYWORD = "KI-Report 2026";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_KEYWORD)}`;

export default function DankeKiReport() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const vorname = params.get("vorname") || params.get("name") || "";

  usePageView("danke-ki-report");

  useEffect(() => {
    window.scrollTo(0, 0);

    // Load Wistia player scripts
    const playerScript = document.createElement("script");
    playerScript.src = "https://fast.wistia.com/player.js";
    playerScript.async = true;
    document.head.appendChild(playerScript);

    const embedScript = document.createElement("script");
    embedScript.src = "https://fast.wistia.com/embed/6f29tx1vos.js";
    embedScript.async = true;
    embedScript.type = "module";
    document.head.appendChild(embedScript);

    return () => {
      try { document.head.removeChild(playerScript); } catch(e) {}
      try { document.head.removeChild(embedScript); } catch(e) {}
    };
  }, []);

  return (
    <>
    <SEO
      title="Herzlichen Glückwunsch – KI-Report 2026 | PhysioFreiheit"
      description="Du hast dir den KI-Report 2026 gesichert. Schau dir die wichtige Videobotschaft von Robin an."
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
          <h1 className="mx-auto max-w-3xl text-balance text-2xl font-extrabold leading-[1.15] md:text-4xl">
            Herzlichen Glückwunsch{vorname ? `, ${vorname}` : ""} – du hast dir den{" "}
            <span className="text-gradient-gold">KI-Report 2026</span>{" "}
            gesichert{" "}
            <span className="block mt-1 text-lg md:text-2xl font-bold text-foreground/90">
              und hier noch eine wichtige Videobotschaft von Robin für dich
            </span>
          </h1>

          {/* Badge: Subheadline */}
          <div className="mt-5 mb-8 inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-card/70 px-5 py-3 text-xs font-semibold text-gold/90 backdrop-blur md:text-sm max-w-2xl text-center leading-relaxed">
            Klicke auf den Button und sende uns eine WhatsApp-Nachricht, um anschließend den KI-Report 2026 zu erhalten und schaue dir unbedingt die kurze Nachricht von Robin an.
          </div>

          {/* WhatsApp-Button */}
          <div className="mb-10">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#1ebe57] hover:shadow-xl active:scale-[0.97] md:text-lg"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Jetzt KI-Report 2026 per WhatsApp erhalten
            </a>
          </div>

          {/* Wistia Video */}
          <div className="mx-auto max-w-3xl mb-10">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* @ts-ignore - Wistia custom element */}
              <wistia-player media-id="6f29tx1vos" aspect="1.7777777777777777"></wistia-player>
            </div>
          </div>

          {/* Trennlinie */}
          <div className="mx-auto mb-8 max-w-md border-t border-border/30" />

          {/* CTA: KI-Praxisanalyse buchen */}
          <h2 className="mx-auto max-w-2xl text-balance text-xl font-bold leading-[1.2] md:text-2xl mb-6">
            Sichere dir jetzt deine{" "}
            <span className="text-gradient-gold">kostenlose 1:1 KI-Praxisanalyse</span>
          </h2>

          <GoldButton
            glow
            className="mx-auto"
            onClick={() => navigate("/termin")}
          >
            KI-Praxisanalyse buchen
            <ArrowRight className="h-5 w-5" />
          </GoldButton>

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
