// OPT-IN PAGE — maximal on point (Vorbild: ecomscaling.org/sta).
// EIN Hook: Traumwebseite mit KI-Agenten in unter 60 Min. Trust-Siegel + Bullet-Trust + 3 Felder + 1 CTA.
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ASSETS, HOOK } from "@/lib/site";
import { Logo, GoldButton } from "@/components/funnel";
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
    toast.success("Perfekt! Weiter zu den Beweisen.");
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
        {/* TÜV-Trust-Siegel + Trust-Zeile oben */}
        <div className="mb-5 flex flex-col items-center gap-3">
          <img
            src={ASSETS.trustSeal}
            alt="Doppelt zertifiziert & geprüft"
            className="h-20 w-20 drop-shadow-[0_4px_16px_rgba(201,162,39,0.25)]"
          />
          <span className="rounded-full border border-gold/40 bg-card/70 px-4 py-1.5 text-sm font-semibold text-gold backdrop-blur">
            {HOOK.trust}
          </span>
        </div>

        {/* Kurze Headline, max 2 Zeilen, ein klarer Engel */}
        <h1 className="max-w-2xl text-balance text-3xl font-extrabold leading-[1.1] md:text-5xl">
          Deine <span className="text-gradient-gold">Traumwebseite</span> mit
          KI-Agenten in unter 60 Minuten.
        </h1>

        {/* Bullet-Trust: ohne XY */}
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

        {/* Formular */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card/90 p-5 text-left shadow-2xl backdrop-blur"
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
          <GoldButton type="submit" glow className="w-full text-base">
            Beweise ansehen
            <ArrowRight className="h-5 w-5" />
          </GoldButton>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            100 % kostenlos · Daten sicher
          </div>
        </form>
      </main>
    </div>
  );
}
