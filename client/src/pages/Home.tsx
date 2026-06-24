// OPT-IN PAGE — simpel wie ecomscaling.org/sta.
// Ziel: EINE Aktion = Eintragen, danach Weiterleitung zur VSL-Seite.
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ASSETS } from "@/lib/site";
import { Logo, GoldButton, TrustBadges } from "@/components/funnel";
import { ShieldCheck, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
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
    toast.success("Perfekt! Wir leiten dich direkt zu den Fallstudien weiter.");
    setTimeout(() => navigate("/vsl"), 700);
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(6,15,28,0.82), rgba(6,15,28,0.92)), url(${ASSETS.heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="container flex items-center justify-center py-6">
        <Logo />
      </header>

      <main className="container flex flex-col items-center pb-16 pt-4 text-center">
        {/* Proof-Zeile oben (wie ecomscaling) */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5" />
          Über 100 Physiopraxen begleitet · Doppelt TÜV-zertifiziert
        </div>

        <h1 className="max-w-3xl text-balance text-3xl font-extrabold leading-[1.12] md:text-5xl">
          Wie Physiopraxen 2026{" "}
          <span className="text-gradient-gold">planbare Online-Umsätze</span>{" "}
          aufbauen – ohne Agentur und ohne mehr Stunden an der Bank
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Trag dich ein und sieh dir die kostenlose Fallstudie an: Wie über 100
          Praxen ihre Traumwebseite mit KI in unter einer Stunde gebaut und mit
          ihrer eigenen Klienten-Coaching-App in wenigen Wochen Pakete verkauft
          haben.
        </p>

        {/* Opt-In Formular */}
        <form
          onSubmit={handleSubmit}
          className="mt-9 w-full max-w-md rounded-2xl border border-border bg-card/90 p-6 text-left shadow-2xl backdrop-blur"
        >
          <div className="mb-4 text-center">
            <div className="font-display text-lg font-bold text-foreground">
              Jetzt kostenlosen Zugang sichern
            </div>
            <div className="text-xs text-muted-foreground">
              Sofortiger Zugriff auf die Fallstudien-Präsentation
            </div>
          </div>

          <div className="space-y-3">
            <FormField
              label="Dein Name"
              placeholder="Max Mustermann"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <FormField
              label="Deine E-Mail"
              type="email"
              placeholder="max@praxis.de"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <FormField
              label="Deine Handynummer"
              type="tel"
              placeholder="+49 170 1234567"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
          </div>

          <GoldButton type="submit" glow className="mt-5 w-full text-lg">
            Ja, ich will die Fallstudien sehen
            <ArrowRight className="h-5 w-5" />
          </GoldButton>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            100 % kostenlos · Deine Daten sind sicher
          </div>
        </form>

        {/* Mini-Benefit-Liste */}
        <ul className="mt-8 flex flex-col items-start gap-2 text-sm text-foreground/90 sm:flex-row sm:gap-6">
          {[
            "KI-Webseite in < 1 Stunde",
            "Eigene Coaching-App",
            "Raus aus der Kassenabhängigkeit",
          ].map((b) => (
            <li key={b} className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <TrustBadges />
        </div>
      </main>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-navy-deep/60 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
      />
    </label>
  );
}
