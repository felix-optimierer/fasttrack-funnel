/**
 * Testoptimierer – Neuer Test erstellen
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";

export default function TestoptimiererNeuerTest() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id ?? "0", 10);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const projectQuery = trpc.testoptimierer.getProject.useQuery(
    { id: projectId },
    { retry: false, enabled: projectId > 0 }
  );

  const [elementId, setElementId] = useState<number | null>(null);
  const [controlText, setControlText] = useState("");
  const [variantText, setVariantText] = useState("");
  const [trafficSplit, setTrafficSplit] = useState(50);

  const createTestMutation = trpc.testoptimierer.createTest.useMutation({
    onSuccess: () => {
      toast.success("Test erfolgreich gestartet!");
      navigate(`/testoptimierer/projekt/${projectId}`);
    },
    onError: (err) => toast.error(err.message),
  });

  // Auto-fill control text when element is selected
  useEffect(() => {
    if (elementId && projectQuery.data) {
      const el = projectQuery.data.elements.find(e => e.id === elementId);
      if (el) setControlText(el.originalText);
    }
  }, [elementId, projectQuery.data]);

  if (projectQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const elements = projectQuery.data?.elements ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!elementId) { toast.error("Bitte wähle ein Element aus."); return; }
    if (!controlText.trim()) { toast.error("Bitte gib den Original-Text ein."); return; }
    if (!variantText.trim()) { toast.error("Bitte gib den Varianten-Text ein."); return; }

    createTestMutation.mutate({
      projectId,
      elementId,
      controlText: controlText.trim(),
      variantText: variantText.trim(),
      trafficSplit,
    });
  }

  return (
    <div className="min-h-screen bg-navy-deep text-foreground">
      <SEO title="Neuer Test – Testoptimierer" description="Neuen A/B Test erstellen" />

      <header className="border-b border-border/30 bg-card/50 backdrop-blur">
        <div className="container flex items-center gap-3 py-3">
          <button onClick={() => navigate(`/testoptimierer/projekt/${projectId}`)} className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold">Neuer Test</h1>
            <p className="text-xs text-muted-foreground">{projectQuery.data?.project.name}</p>
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Element Selection */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h3 className="text-sm font-semibold mb-3">Element auswählen</h3>
            {elements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Elemente konfiguriert. Bitte zuerst ein Element zum Projekt hinzufügen.
              </p>
            ) : (
              <div className="space-y-2">
                {elements.map(el => (
                  <label
                    key={el.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                      elementId === el.id
                        ? "border-gold bg-gold/5"
                        : "border-border/20 hover:border-border/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="element"
                      value={el.id}
                      checked={elementId === el.id}
                      onChange={() => setElementId(el.id)}
                      className="mt-1 accent-gold"
                    />
                    <div>
                      <span className="text-xs font-medium text-gold uppercase">
                        {el.elementType.replace("_", " ")}
                      </span>
                      {el.label && <span className="text-xs text-muted-foreground ml-2">({el.label})</span>}
                      <p className="text-sm mt-0.5">{el.originalText}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Test Texts */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5 space-y-4">
            <h3 className="text-sm font-semibold">Test-Texte</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Original (A) – Kontrollgruppe
              </label>
              <textarea
                value={controlText}
                onChange={(e) => setControlText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 resize-none"
                placeholder="Der aktuelle Text auf der Seite..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gold block mb-1">
                Variante (B) – Challenger
              </label>
              <textarea
                value={variantText}
                onChange={(e) => setVariantText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gold/30 bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 resize-none"
                placeholder="Dein neuer alternativer Text..."
              />
            </div>
          </div>

          {/* Traffic Split */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h3 className="text-sm font-semibold mb-3">Traffic-Verteilung</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={trafficSplit}
                  onChange={(e) => setTrafficSplit(parseInt(e.target.value))}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Original: {trafficSplit}%</span>
                  <span>Variante: {100 - trafficSplit}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createTestMutation.isPending || !elementId || !variantText.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {createTestMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="h-4 w-4" />
            )}
            Test starten
          </button>
        </form>
      </main>
    </div>
  );
}
