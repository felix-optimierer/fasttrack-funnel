// OPT-IN PAGE — maximal on point (Vorbild: ecomscaling.org/sta).
// Headline "Definitiver Weg ...", >100x bewiesen oben, CTA -> 7 Fallstudien, Doppel-TÜV-Siegel unter dem Formular.
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, DoubleSeals } from "@/components/funnel";
import { Lock, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";

export default function Home() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const createLead = trpc.leads.create.useMutation();

  usePageView("home");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Bitte fülle alle Felder aus.");
      return;
    }
    createLead.mutate(
      { name: form.name, email: form.email, phone: form.phone, source: "home" },
      {
        onSuccess: () => {
          toast.success("Perfekt! Hier kommen deine 7 Fallstudien.");
          setTimeout(() => navigate("/vsl"), 600);
        },
        onError: () => {
          // Auch bei Backend-Fehler den Nutzer nicht blockieren
          toast.success("Perfekt! Hier kommen deine 7 Fallstudien.");
          setTimeout(() => navigate("/vsl"), 600);
        },
      },
    );
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
      <header className="container flex items-center justify-center py-3 md:py-4">
        <Logo />
      </header>

      <main className="container flex flex-1 flex-col items-center justify-center pb-6 pt-1 text-center">
        {/* >100x bewiesen oben – mobil einzeilig */}
        <div className="mb-3 inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/40 bg-card/70 px-3 py-1.5 text-[11px] font-semibold text-gold backdrop-blur sm:gap-2 sm:px-4 sm:text-sm">
          &gt;100× bewiesen
          <span className="font-normal text-muted-foreground">
            <span className="sm:hidden">(Beweise: nächste Seite)</span>
            <span className="hidden sm:inline">
              (ausführliche Beweise auf der nächsten Seite)
            </span>
          </span>
        </div>

        {/* Headline: kompakt, 2-3 Zeilen */}
        <h1 className="max-w-4xl text-balance text-xl font-extrabold leading-[1.15] sm:text-3xl md:max-w-none md:[text-wrap:initial] md:text-[2.85rem] md:leading-[1.15]">
          Als Praxisinhaber deine{" "}
          <br className="hidden md:inline" />
          <span className="text-gradient-gold">Traumwebseite</span> in 60 Minuten{" "}
          <br className="hidden md:inline" />
          per KI-Agent bauen lassen
        </h1>

        {/* Bullet-Trust */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-foreground/90 sm:mt-4 sm:gap-x-5 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-gold" />
            ohne Technikkenntnisse
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-gold" />
            ohne Agentur
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <Check className="h-4 w-4 text-gold" />
            ohne Baukasten
          </span>
        </div>

        {/* Satz über der Box, mittig ausgerichtet – einzeilig */}
        <div className="mb-3 mt-5 flex w-full max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="text-[13px] font-bold uppercase tracking-wide text-gold sm:text-sm">
            Jetzt eintragen
          </span>
          <ArrowRight className="h-4 w-4 text-gold" />
          <span className="text-[13px] font-semibold text-foreground/90 sm:text-sm">
            7 Fallstudien zugeschickt bekommen
          </span>
        </div>

        {/* Formular */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-2.5 rounded-2xl border border-border bg-card/90 p-4 text-left shadow-2xl backdrop-blur sm:p-5"
        >
          <input
            type="text"
            value={form.name}
            placeholder="Dein Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
          <input
            type="email"
            value={form.email}
            placeholder="Deine E-Mail"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
          <input
            type="tel"
            value={form.phone}
            placeholder="Deine Handynummer"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
          <GoldButton
            type="submit"
            glow
            className="w-full"
            subLabel="2FA Verification Required"
            disabled={createLead.isPending}
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
        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5 sm:gap-3">
          <DoubleSeals />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
            Doppelt TÜV-zertifiziert
          </p>
        </div>
      </main>
    </div>
  );
}
