/**
 * Testoptimierer – Neuer Test erstellen
 * Auto-fills control text from element, offers LLM-powered variant suggestions.
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, FlaskConical, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export default function TestoptimiererNeuerTest() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id ?? "0", 10);

  const projectQuery = trpc.testoptimierer.getProject.useQuery(
    { id: projectId },
    { retry: false, enabled: projectId > 0 }
  );

  const [elementId, setElementId] = useState<number | null>(null);
  const [controlText, setControlText] = useState("");
  const [variantText, setVariantText] = useState("");
  const [trafficSplit, setTrafficSplit] = useState(50);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; reasoning: string }>>([]);

  const createTestMutation = trpc.testoptimierer.createTest.useMutation({
    onSuccess: () => {
      toast.success("Test erfolgreich gestartet!");
      navigate(`/testoptimierer/projekt/${projectId}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const suggestMutation = trpc.testoptimierer.suggestVariant.useMutation({
    onSuccess: (data) => {
      setSuggestions(data.variants);
      toast.success("3 Varianten generiert!");
    },
    onError: (err) => toast.error(err.message),
  });

  // Auto-fill control text when element is selected
  useEffect(() => {
    if (elementId && projectQuery.data) {
      const el = projectQuery.data.elements.find(e => e.id === elementId);
      if (el) {
        setControlText(el.originalText);
        setSuggestions([]);
        setVariantText("");
      }
    }
  }, [elementId, projectQuery.data]);

  function handleSuggest() {
    if (!elementId || !controlText.trim()) {
      toast.error("Bitte wähle zuerst ein Element aus.");
      return;
    }
    const el = projectQuery.data?.elements.find(e => e.id === elementId);
    suggestMutation.mutate({
      originalText: controlText.trim(),
      elementType: el?.elementType ?? "main_headline",
      context: `Seite: ${projectQuery.data?.project.targetUrl ?? ""}`,
    });
  }

  function selectSuggestion(text: string) {
    setVariantText(text);
  }

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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gold uppercase">
                          {el.elementType.replace(/_/g, " ")}
                        </span>
                        {el.label && <span className="text-xs text-muted-foreground">({el.label})</span>}
                      </div>
                      <p className="text-sm mt-0.5 truncate">{el.originalText}</p>
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
              <div className="w-full rounded-md border border-input bg-navy-deep/30 px-3 py-2 text-sm text-foreground/80 min-h-[60px]">
                {controlText || <span className="text-muted-foreground italic">Wähle ein Element aus...</span>}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Wird automatisch aus dem Element übernommen.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gold">
                  Variante (B) – Challenger
                </label>
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={suggestMutation.isPending || !elementId}
                  className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-soft transition disabled:opacity-40"
                >
                  {suggestMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  KI-Vorschlag
                </button>
              </div>
              <textarea
                value={variantText}
                onChange={(e) => setVariantText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gold/30 bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 resize-none"
                placeholder="Dein neuer alternativer Text..."
              />
            </div>

            {/* LLM Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Vorschläge (klicke zum Übernehmen):</p>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => selectSuggestion(s.text)}
                    className={`rounded-lg border p-3 cursor-pointer transition ${
                      variantText === s.text
                        ? "border-gold bg-gold/10"
                        : "border-border/20 hover:border-gold/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${
                        variantText === s.text ? "bg-gold text-navy-deep" : "border border-border"
                      }`}>
                        {variantText === s.text && <Check className="h-2.5 w-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{s.reasoning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <p className="text-[10px] text-muted-foreground mt-2">
              Empfehlung: 50/50 für schnellste Ergebnisse. Bei Risiko-Aversion: 70/30 (mehr Traffic auf bewährtem Original).
            </p>
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
