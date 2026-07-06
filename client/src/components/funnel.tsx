// Funnel-Bausteine im "Authority Vault" Design (Navy + Gold).
import { ASSETS, BRAND, PROOF_STATS, CASE_STUDIES } from "@/lib/site";
import { ShieldCheck, Star, Quote } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={ASSETS.logo}
      alt={BRAND.name}
      className={`h-9 w-auto object-contain md:h-11 ${className}`}
    />
  );
}

export function GoldButton({
  children,
  onClick,
  type = "button",
  className = "",
  glow = false,
  subLabel,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  glow?: boolean;
  subLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-press flex w-full flex-col items-center justify-center rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-7 font-bold text-navy transition-[transform,box-shadow] duration-150 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${subLabel ? "py-2.5" : "py-3.5"} ${glow ? "cta-glow" : ""} ${className}`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <span className="inline-flex items-center justify-center gap-2 text-base leading-tight">
        {children}
      </span>
      {subLabel && (
        <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-navy/70">
          {subLabel}
        </span>
      )}
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
          {c.image ? (
            <div className={`relative h-52 w-full overflow-hidden ${c.isLogo ? 'flex items-center justify-center bg-white/95 p-6' : ''}`}>
              <img
                src={c.image}
                alt={c.name}
                className={`${c.isLogo ? 'max-h-full max-w-full object-contain' : 'h-full w-full object-cover'}`}
              />
              {!c.isLogo && <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />}
              <div className={`absolute bottom-3 left-4 right-4 ${c.isLogo ? 'bg-card/80 rounded px-2 py-1' : ''}`}>
                <p className="font-display text-sm font-bold text-gold">
                  {c.result}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex h-52 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-navy to-navy-deep">
              <span className="font-display text-6xl font-extrabold text-gold/30">
                {c.name.charAt(0)}
              </span>
              <div className="absolute inset-0 flex items-end">
                <div className="w-full bg-gradient-to-t from-card via-card/40 to-transparent px-4 pb-3 pt-10">
                  <p className="font-display text-sm font-bold text-gold">
                    {c.result}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            <Quote className="mb-2 h-5 w-5 text-gold/60" />
            <p className="flex-1 text-sm leading-relaxed text-foreground/90">
              {c.isQuote === false ? c.quote : `„${c.quote}“`}
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
              {c.sourceUrl && (
                <a
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-gold/80 hover:text-gold"
                >
                  {c.sourceLabel ?? "Quelle ansehen"} ↗
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DoubleSeals({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <a
        href="https://www.certipedia.com/quality_marks/0217466534"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:brightness-105"
      >
        <img
          src={ASSETS.tuv1}
          alt="TÜV Rheinland zertifiziert – ID 0217466534"
          className="h-14 w-auto rounded-sm shadow-lg md:h-20"
        />
      </a>
      <a
        href="https://www.certipedia.com/quality_marks/0217466539"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:brightness-105"
      >
        <img
          src={ASSETS.tuv2}
          alt="TÜV Rheinland zertifiziert – ID 0217466539"
          className="h-14 w-auto rounded-sm shadow-lg md:h-20"
        />
      </a>
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
            href="https://physiofrei.de/impressum?utm_source=fasttrack-funnel&utm_medium=footer&utm_campaign=exit-plan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
          >
            Impressum
          </a>
          <a
            href="https://physiofrei.de/datenschutz?utm_source=fasttrack-funnel&utm_medium=footer&utm_campaign=exit-plan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
          >
            Datenschutz
          </a>
        </div>
        <p className="max-w-2xl text-[11px] leading-relaxed text-muted-foreground/70">
          Wir verwenden die im Rahmen der Anmeldung zu unserem kostenlosen
          Webinaren und Infomaterialien erhobene E‑Mail‑Adresse, um Sie per
          E‑Mail über inhaltlich ähnliche eigene Angebote zu informieren,
          insbesondere zu weiteren Terminen, Vertiefungen und ergänzenden
          Leistungen in den Bereichen Coaching und digitale Beratung. Die
          Verarbeitung erfolgt auf Grundlage von § 7 Abs. 3 UWG. Sie können
          der Verwendung Ihrer E‑Mail‑Adresse zu Werbezwecken jederzeit mit
          Wirkung für die Zukunft widersprechen, ohne dass hierfür andere als
          die Übermittlungskosten nach den Basistarifen entstehen. Ihren
          Widerspruch können Sie z.&nbsp;B. über den Abmeldelink in jeder E‑Mail
          oder per E‑Mail an support@bewegungsoptimierer.de erklären.
        </p>
        <p className="max-w-2xl text-[11px] leading-relaxed text-muted-foreground/70">
          Diese Seite ist nicht Teil der Facebook-Website oder von Meta Platforms
          Inc. Ergebnisse sind individuell und keine Garantie.
        </p>
      </div>
    </footer>
  );
}
