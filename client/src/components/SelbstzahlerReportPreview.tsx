import { FileText } from "lucide-react";

/** V1-Platzhalter, bis das finale Report-Mockup vorliegt. Kein fertiges Cover. */
export function SelbstzahlerReportPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gold/35 bg-navy/80 text-center ${compact ? "h-full min-h-44 px-4 py-3" : "min-h-72 px-6 py-8 sm:min-h-80 sm:px-8 lg:min-h-96"}`}
      aria-label="Platzhalter für das kommende Selbstzahler-Report-Mockup"
    >
      <div className={`flex shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 ${compact ? "mb-3 h-10 w-10" : "mb-5 h-16 w-16"}`}>
        <FileText className={`${compact ? "h-5 w-5" : "h-8 w-8"} text-gold`} aria-hidden="true" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Kostenloser Report</p>
      <p className={`max-w-xs font-display font-extrabold leading-tight text-foreground ${compact ? "mt-2 text-lg" : "mt-3 text-2xl sm:text-3xl"}`}>
        Selbstzahler-Angebote,{compact ? " " : <br />}die dein Team verkauft.
      </p>
      <p className={`${compact ? "mt-3" : "mt-5"} rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground`}>
        Mockup folgt
      </p>
    </div>
  );
}
