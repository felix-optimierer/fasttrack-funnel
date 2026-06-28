// OPT-IN PAGE — maximal on point (Vorbild: ecomscaling.org/sta).
// Headline "Definitiver Weg ...", >100x bewiesen oben, CTA -> 7 Fallstudien, Doppel-TÜV-Siegel unter dem Formular.
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals } from "@/components/funnel";
import { Lock, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Bitte fülle alle Felder aus.");
      return;
    }
    toast.success("Perfekt! Hier kommen deine 7 Fallstudien.");
    setTimeout(() => navigate("/vsl"), 600);
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(6,15,28,0.85), rgba(6,15,28,0.93)), url(${ASSETS.heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="container flex items-center justify-center py-6">
        <Logo />
      </header>

      <main className="container flex flex-1 flex-col items-center justify-center pb-12 text-center">
        {/* >100x bewiesen oben */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-sm font-semibold text-gold backdrop-blur">
          &gt;100× bewiesen
          <span className="font-normal text-muted-foreground">
            (ausführliche Beweise auf der nächsten Seite)
          </span>
        </div>

        {/* Headline: kompakt, 2-3 Zeilen */}
        <h1 className="max-w-4xl text-balance text-3xl font-extrabold leading-[1.1] md:text-5xl">
          Als Praxisinhaber deine{" "}
          <span className="text-gradient-gold">Traumwebseite</span> in 60 Minuten
          per KI-Agent bauen lassen
        </h1>

        {/* Bullet-Trust */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-foreground/90">
          {["ohne Technikkenntnisse", "ohne Agentur", "ohne Baukasten"].map(
            (b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-gold" />
                {b}
              </span>
            ),
          )}
        </div>

        {/* Satz über der Box, mittig ausgerichtet – einzeilig */}
        <div className="mb-5 mt-8 flex w-full max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold uppercase tracking-wide text-gold">
            Jetzt eintragen
          </span>
          <ArrowRight className="h-4 w-4 text-gold" />
          <span className="text-sm font-semibold text-foreground/90">
            7 Fallstudien zugeschickt bekommen
          </span>
        </div>

        {/* Formular */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card/90 p-5 text-left shadow-2xl backdrop-blur"
        >
          <input
            type="text"
            value={form.name}
            placeholder="Dein Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-input bg-navy-deep/60 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
          <input
            type="email"
            value={form.email}
            placeholder="Deine E-Mail"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md border border-input bg-navy-deep/60 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
          <input
            type="tel"
            value={form.phone}
            placeholder="Deine Handynummer"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-md border border-input bg-navy-deep/60 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
          <GoldButton
            type="submit"
            glow
            className="w-full"
            subLabel="2FA Verification Required"
          >
            Los geht's
            <ArrowRight className="h-5 w-5" />
          </GoldButton>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            100 % kostenlos · Daten sicher
          </div>
        </form>

        {/* Echte TÜV-Rheinland-Siegel unter dem Formular */}
        <div className="mt-9 flex flex-col items-center gap-3">
          <DoubleSeals />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Doppelt TÜV-zertifiziert
          </p>
        </div>
      </main>
    </div>
  );
}
