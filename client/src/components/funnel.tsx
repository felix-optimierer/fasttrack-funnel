// Funnel-Bausteine im "Authority Vault" Design (Navy + Gold).
import { ASSETS, BRAND, PROOF_STATS, CASE_STUDIES } from "@/lib/site";
import { ShieldCheck, Star, Quote } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={ASSETS.logo}
        alt={BRAND.name}
        className="h-8 w-8 object-contain"
      />
      <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
        FAST<span className="text-gold">·</span>TRACK
      </span>
    </div>
  );
}

export function GoldButton({
  children,
  onClick,
  type = "button",
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  glow?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn-press inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-7 py-4 text-base font-bold text-navy transition-[transform,box-shadow] duration-150 hover:brightness-105 ${glow ? "cta-glow" : ""} ${className}`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      {children}
    </button>
  );
}

export function ProofBar() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
      {PROOF_STATS.map((s) => (
        <div key={s.label} className="bg-card px-4 py-5 text-center">
          <div className="font-display text-2xl font-extrabold text-gold md:text-3xl">
            {s.value}
          </div>
          <div className="mt-1 text-xs leading-tight text-muted-foreground md:text-sm">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-gold" /> Doppelt TÜV-zertifiziert
      </span>
      <span className="inline-flex items-center gap-2">
        <Star className="h-4 w-4 text-gold" /> 100+ begleitete Praxen
      </span>
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-gold" /> 100 % Klartext, kein Agentur-Blabla
      </span>
    </div>
  );
}

export function CaseGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {CASE_STUDIES.map((c, i) => (
        <article
          key={i}
          className="rise-in flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {c.image && (
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="font-display text-sm font-bold text-gold">
                  {c.result}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            <Quote className="mb-2 h-5 w-5 text-gold/60" />
            <p className="flex-1 text-sm leading-relaxed text-foreground/90">
              „{c.quote}"
            </p>
            <div className="mt-4 flex items-center gap-4">
              {c.metrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-secondary px-3 py-2">
                  <div className="font-display text-base font-bold text-gold">
                    {m.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <div className="text-sm font-semibold text-foreground">
                {c.name}
              </div>
              <div className="text-xs text-muted-foreground">{c.role}</div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy-deep py-8">
      <div className="container flex flex-col items-center gap-3 text-center">
        <Logo />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.parent} – Alle Rechte vorbehalten.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a
            href="https://bewegungsoptimierer.de/impressum"
            className="hover:text-gold"
          >
            Impressum
          </a>
          <a
            href="https://bewegungsoptimierer.de/datenschutz"
            className="hover:text-gold"
          >
            Datenschutz
          </a>
        </div>
        <p className="max-w-2xl text-[11px] leading-relaxed text-muted-foreground/70">
          Diese Seite ist nicht Teil der Facebook-Website oder von Meta Platforms
          Inc. Ergebnisse sind individuell und keine Garantie.
        </p>
      </div>
    </footer>
  );
}
