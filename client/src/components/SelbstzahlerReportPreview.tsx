import { ASSETS } from "@/lib/site";

/** KI-generiertes Report-Mockup; Kennzeichnung ist im Bild integriert. */
export function SelbstzahlerReportPreview({ compact = false }: { compact?: boolean }) {
  return (
    <figure className={`relative mx-auto flex w-full min-w-0 items-center justify-center ${compact ? "h-full" : "max-w-xl"}`}>
      <img
        src={ASSETS.selbstzahlerMockup}
        width={1400}
        height={1400}
        alt="KI-generiertes Mockup des Selbstzahler-Reports mit Cover und drei Vorschauseiten"
        loading={compact ? "lazy" : "eager"}
        decoding="async"
        className={`${compact ? "h-full max-h-full w-auto max-w-full" : "h-auto w-full"} object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]`}
      />
    </figure>
  );
}
