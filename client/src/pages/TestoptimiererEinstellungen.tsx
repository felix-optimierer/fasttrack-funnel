/**
 * Testoptimierer – Einstellungen Page (/testoptimierer/einstellungen)
 * Configurable significance thresholds with explanations.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import { Info, Save, Copy, Code } from "lucide-react";
import TestoptimiererLayout from "@/components/TestoptimiererLayout";

const SETTING_EXPLANATIONS: Record<string, { title: string; description: string; recommendation: string }> = {
  significance_threshold: {
    title: "Signifikanz-Schwelle (p-Wert)",
    description: "Der p-Wert gibt an, wie wahrscheinlich es ist, dass der beobachtete Unterschied zufällig entstanden ist. Ein p-Wert von 0.05 bedeutet: Es besteht nur eine 5%ige Wahrscheinlichkeit, dass der Unterschied Zufall ist (= 95% Konfidenz).",
    recommendation: "Standard: 0.05 (95% Konfidenz). Für schnellere Ergebnisse bei geringem Traffic: 0.10 (90% Konfidenz). Für kritische Entscheidungen: 0.01 (99% Konfidenz).",
  },
  min_visitors_for_stop: {
    title: "Min. Besucher für Auto-Stopp",
    description: "Mindestanzahl Besucher (beide Varianten zusammen), bevor ein Test ohne Signifikanz automatisch abgebrochen wird. Verhindert, dass Tests zu früh gestoppt werden, wenn noch nicht genug Daten vorliegen.",
    recommendation: "Standard: 1.000 Besucher. Bei Seiten mit hoher Conversion (>5%): 500 reichen. Bei niedriger Conversion (<1%): mindestens 2.000 empfohlen.",
  },
  p_value_threshold_for_stop: {
    title: "p-Wert-Schwelle für Auto-Stopp",
    description: "Wenn nach Erreichen der Mindestbesucher der p-Wert über diesem Schwellenwert liegt, wird der Test als 'kein Ergebnis' beendet. Ein p-Wert von 0.20 bedeutet: Es gibt weniger als 80% Wahrscheinlichkeit für einen echten Unterschied – der Test lohnt sich nicht weiter.",
    recommendation: "Standard: 0.20 bei 1.000 Besuchern ist sinnvoll. Hintergrund: Bei 1.000 Besuchern (500 pro Variante) und einer Basis-CR von 3% erkennt der Chi²-Test einen relativen Unterschied von \u226520% mit ca. 80% Power. Wenn nach 1.000 Besuchern p > 0.20, ist der Effekt entweder zu klein oder nicht vorhanden \u2013 weiterlaufen lassen bringt selten ein anderes Ergebnis. Empfehlung: 0.20 beibehalten. Bei h\u00f6herer Basis-CR (>5%) kannst du auf 0.15 senken.",
  },
  check_interval_hours: {
    title: "Prüf-Intervall (Stunden)",
    description: "Wie oft automatisch geprüft wird, ob ein Test signifikant ist. Bei jeder Prüfung wird der Chi-Squared-Test durchgeführt und bei Ergebnis eine E-Mail gesendet.",
    recommendation: "Standard: 3 Stunden. Bei viel Traffic (>500 Besucher/Tag): 1 Stunde. Bei wenig Traffic (<100/Tag): 6 Stunden reichen.",
  },
};

export default function TestoptimiererEinstellungen() {
  const { data: settings, isLoading } = trpc.testoptimierer.getSettings.useQuery();
  const initSettings = trpc.testoptimierer.initSettings.useMutation();
  const updateSetting = trpc.testoptimierer.updateSetting.useMutation();
  const utils = trpc.useUtils();

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => { map[s.settingKey] = s.settingValue; });
      setValues(map);
    }
  }, [settings]);

  // Auto-init settings if empty
  useEffect(() => {
    if (settings && settings.length === 0) {
      initSettings.mutate(undefined, {
        onSuccess: () => utils.testoptimierer.getSettings.invalidate(),
      });
    }
  }, [settings]);

  function handleSave(key: string) {
    updateSetting.mutate(
      { key, value: values[key] },
      {
        onSuccess: () => {
          toast.success("Einstellung gespeichert");
          utils.testoptimierer.getSettings.invalidate();
        },
        onError: () => toast.error("Fehler beim Speichern"),
      }
    );
  }

  // Generate embed prompt for Manus
  const embedPrompt = `Bitte baue das folgende Script-Tag in den <head>-Bereich meiner Seite ein (vor dem schließenden </head>-Tag):

<script src="https://go.physiofreiheit.de/api/testoptimierer/tag/[PROJEKT-ID]" defer></script>

Ersetze [PROJEKT-ID] durch die ID des Testoptimierer-Projekts.

Das Script muss auf der Seite eingebunden werden, die getestet wird. Es braucht nur EIN Tag – das Script erkennt automatisch sowohl die Testseite als auch die Conversion-Seite (Danke-Seite) anhand der konfigurierten URL-Patterns.`;

  return (
    <TestoptimiererLayout activeTab="/testoptimierer/einstellungen">
      <SEO title="Einstellungen – Testoptimierer" description="Signifikanz-Einstellungen" />

      <div className="space-y-8">
        {/* Significance Settings */}
        <section>
          <h2 className="text-xl font-bold mb-2">Signifikanz-Einstellungen</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Hier kannst du die Schwellenwerte für die automatische Signifikanz-Prüfung anpassen.
            Die Prüfung läuft automatisch alle {values.check_interval_hours ?? "3"} Stunden.
          </p>

          {isLoading ? (
            <div className="text-muted-foreground">Laden...</div>
          ) : (
            <div className="grid gap-4">
              {Object.entries(SETTING_EXPLANATIONS).map(([key, info]) => (
                <div key={key} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{info.title}</h3>
                    <button
                      onClick={() => handleSave(key)}
                      className="flex items-center gap-1.5 rounded-md bg-gold/20 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/30"
                    >
                      <Save className="h-3 w-3" /> Speichern
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{info.description}</p>
                  <div className="flex items-start gap-2 mb-3 rounded-lg bg-gold/5 border border-gold/20 p-2.5">
                    <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <p className="text-xs text-gold/90">{info.recommendation}</p>
                  </div>
                  <input
                    type="text"
                    value={values[key] ?? ""}
                    onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-md border border-border bg-navy-deep px-4 py-2.5 text-sm font-mono"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Embed Prompt */}
        <section>
          <h2 className="text-xl font-bold mb-2">Einbettungs-Anleitung</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kopiere diesen Prompt und füge ihn in Manus ein, um das Testoptimierer-Tag auf deiner Seite einzubauen.
            Du brauchst nur <strong>ein einziges Tag</strong> pro Seite – es erkennt automatisch sowohl die Testseite
            als auch die Conversion-Seite (z.B. Danke-Seite) anhand der URL-Patterns.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-gold" />
                <span className="text-sm font-semibold">Manus-Prompt zum Einbauen</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedPrompt);
                  toast.success("Prompt kopiert!");
                }}
                className="flex items-center gap-1.5 rounded-md bg-gold/20 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/30"
              >
                <Copy className="h-3 w-3" /> Kopieren
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-navy-deep rounded-lg p-4 border border-border/50">
              {embedPrompt}
            </pre>
          </div>

          <div className="mt-4 rounded-lg bg-gold/5 border border-gold/20 p-4">
            <h4 className="text-sm font-semibold text-gold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" /> Warum nur ein Tag?
            </h4>
            <p className="text-xs text-muted-foreground">
              Das Testoptimierer-Script funktioniert auf beiden Seiten gleichzeitig: Auf der Testseite ersetzt es den
              Text und zählt Impressions. Wenn der Besucher dann auf die Danke-Seite kommt (Conversion-URL),
              erkennt das gleiche Script automatisch, dass eine Conversion stattgefunden hat, und zählt sie.
              Du brauchst also kein separates Conversion-Tag – alles läuft über ein einziges Script.
            </p>
          </div>
        </section>

        {/* Significance Recommendation */}
        <section>
          <h2 className="text-xl font-bold mb-2">Signifikanz-Empfehlung</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hier eine Einordnung, ob die Standard-Einstellungen für deine Situation passen.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Sind 0.20 p-Value bei 1.000 Besuchern sinnvoll?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Ja, das ist eine gute Kombination.</strong> Die Logik dahinter:
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1.5 list-disc pl-4">
                <li>Bei 1.000 Besuchern (500 pro Variante) und einer typischen Physio-Landingpage-CR von 3–5% hat der Chi²-Test genug statistische Power (~80%), um einen relativen Unterschied von 20%+ zu erkennen.</li>
                <li>Der p-Wert von 0.20 als Stopp-Schwelle bedeutet: Wenn nach 1.000 Besuchern kein Signal unter p=0.20 vorliegt, ist der Effekt entweder nicht vorhanden oder so klein (&lt;10% relativ), dass er wirtschaftlich irrelevant ist.</li>
                <li>Weiterlaufen lassen würde nur Sinn machen, wenn du einen sehr kleinen Effekt (5–10%) nachweisen willst – dafür bräuchtest du aber 5.000–10.000 Besucher.</li>
              </ul>
            </div>

            <div className="border-t border-border/30 pt-4">
              <h4 className="text-sm font-semibold mb-1">Wann solltest du die Werte anpassen?</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs mt-2">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground">
                      <th className="text-left py-2 pr-3 font-medium">Situation</th>
                      <th className="text-left py-2 px-2 font-medium">Min. Besucher</th>
                      <th className="text-left py-2 px-2 font-medium">p-Stopp</th>
                      <th className="text-left py-2 pl-2 font-medium">Begründung</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/10">
                      <td className="py-2 pr-3 font-medium text-foreground">Standard (3–5% CR)</td>
                      <td className="py-2 px-2">1.000</td>
                      <td className="py-2 px-2">0.20</td>
                      <td className="py-2 pl-2">Gute Balance zwischen Geschwindigkeit und Genauigkeit</td>
                    </tr>
                    <tr className="border-b border-border/10">
                      <td className="py-2 pr-3 font-medium text-foreground">Hohe CR (&gt;5%)</td>
                      <td className="py-2 px-2">500</td>
                      <td className="py-2 px-2">0.15</td>
                      <td className="py-2 pl-2">Mehr Conversions = schnellere Signifikanz</td>
                    </tr>
                    <tr className="border-b border-border/10">
                      <td className="py-2 pr-3 font-medium text-foreground">Niedrige CR (&lt;2%)</td>
                      <td className="py-2 px-2">2.000</td>
                      <td className="py-2 px-2">0.20</td>
                      <td className="py-2 pl-2">Wenige Events brauchen mehr Daten</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-medium text-foreground">Kritische Entscheidung</td>
                      <td className="py-2 px-2">2.000</td>
                      <td className="py-2 px-2">0.10</td>
                      <td className="py-2 pl-2">Höhere Sicherheit, längere Laufzeit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-border/30 pt-4">
              <h4 className="text-sm font-semibold mb-1">Unterschied zu OptiMind (2 Tags)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bei OptiMind brauchtest du einen Tag für die Seite und einen für die Danke-Seite.
                Der Testoptimierer erkennt die Conversion automatisch per URL-Match – deshalb reicht <strong className="text-foreground">ein einziger Tag</strong>.
                Das Script prüft bei jedem Seitenaufruf, ob die aktuelle URL zum Conversion-Pattern passt,
                und zählt die Conversion dann automatisch für den richtigen Besucher.
              </p>
            </div>
          </div>
        </section>
      </div>
    </TestoptimiererLayout>
  );
}
