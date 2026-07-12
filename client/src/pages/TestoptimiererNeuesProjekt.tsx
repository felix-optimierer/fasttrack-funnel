/**
 * Testoptimierer – Neues Projekt erstellen
 * Allows creating a new A/B testing project with target URL and conversion URL.
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Plus, FlaskConical, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ElementDraft = {
  elementType: "main_headline" | "pre_headline" | "sub_headline" | "cta";
  cssSelector: string;
  originalText: string;
  label: string;
};

export default function TestoptimiererNeuesProjekt() {
  const [, navigate] = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [conversionUrlPattern, setConversionUrlPattern] = useState("");
  const [conversionMatchType, setConversionMatchType] = useState<"exact" | "contains">("contains");
  const [elements, setElements] = useState<ElementDraft[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  const createProjectMutation = trpc.testoptimierer.createProject.useMutation({
    onSuccess: async (data) => {
      // Create elements for the project
      if (elements.length > 0) {
        for (const el of elements) {
          await createElementMutation.mutateAsync({
            projectId: data.id,
            ...el,
          });
        }
      }
      toast.success("Projekt erstellt!");
      navigate(`/testoptimierer/projekt/${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const createElementMutation = trpc.testoptimierer.createElement.useMutation();

  function addElement() {
    setElements([...elements, {
      elementType: "main_headline",
      cssSelector: "",
      originalText: "",
      label: "",
    }]);
  }

  function removeElement(index: number) {
    setElements(elements.filter((_, i) => i !== index));
  }

  function updateElement(index: number, field: keyof ElementDraft, value: string) {
    const updated = [...elements];
    (updated[index] as any)[field] = value;
    setElements(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Bitte gib einen Projektnamen ein."); return; }
    if (!targetUrl.trim()) { toast.error("Bitte gib die Ziel-URL ein."); return; }
    if (!conversionUrlPattern.trim()) { toast.error("Bitte gib die Conversion-URL ein."); return; }

    createProjectMutation.mutate({
      name: name.trim(),
      targetUrl: targetUrl.trim(),
      conversionUrlPattern: conversionUrlPattern.trim(),
      conversionMatchType,
    });
  }

  return (
    <div className="min-h-screen bg-navy-deep text-foreground">
      <SEO title="Neues Projekt – Testoptimierer" description="Neues A/B Testing Projekt erstellen" />

      <header className="border-b border-border/30 bg-card/50 backdrop-blur">
        <div className="container flex items-center gap-3 py-3">
          <button onClick={() => navigate("/testoptimierer")} className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold">Neues Projekt</h1>
        </div>
      </header>

      <main className="container py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Project Basics */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5 space-y-4">
            <h3 className="text-sm font-semibold">Projekt-Grunddaten</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Projektname</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. KI-Report Landing Page"
                className="w-full rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Ziel-URL (die Seite, die getestet wird)
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://go.physiofreiheit.de/ki-report"
                className="w-full rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Conversion-URL (Danke-Seite / Bestätigungsseite)
              </label>
              <input
                type="text"
                value={conversionUrlPattern}
                onChange={(e) => setConversionUrlPattern(e.target.value)}
                placeholder="https://go.physiofreiheit.de/danke"
                className="w-full rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                URL-Matching
              </label>
              <select
                value={conversionMatchType}
                onChange={(e) => setConversionMatchType(e.target.value as "exact" | "contains")}
                className="rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold"
              >
                <option value="contains">Enthält (empfohlen)</option>
                <option value="exact">Exakt</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                "Enthält" zählt eine Conversion, wenn die URL den angegebenen Text enthält. "Exakt" erfordert eine exakte Übereinstimmung.
              </p>
            </div>
          </div>

          {/* Step 2: Elements */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Elemente zum Testen</h3>
              <button
                type="button"
                onClick={addElement}
                className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-soft transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Element hinzufügen
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Definiere die Elemente auf deiner Seite, die du testen möchtest. Du brauchst den CSS-Selektor und den aktuellen Text.
            </p>

            {elements.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Noch keine Elemente. Klicke oben auf "Element hinzufügen".
                <br />
                <span className="text-xs">(Du kannst Elemente auch später hinzufügen)</span>
              </div>
            )}

            {elements.map((el, i) => (
              <div key={i} className="rounded-lg border border-border/20 bg-navy-deep/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gold">Element {i + 1}</span>
                  <button type="button" onClick={() => removeElement(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-0.5">Typ</label>
                    <select
                      value={el.elementType}
                      onChange={(e) => updateElement(i, "elementType", e.target.value)}
                      className="w-full rounded-md border border-input bg-navy-deep/50 px-2 py-1.5 text-xs outline-none focus:border-gold"
                    >
                      <option value="main_headline">Main-Headline</option>
                      <option value="pre_headline">Pre-Headline</option>
                      <option value="sub_headline">Sub-Headline</option>
                      <option value="cta">CTA-Button</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-0.5">Label (optional)</label>
                    <input
                      type="text"
                      value={el.label}
                      onChange={(e) => updateElement(i, "label", e.target.value)}
                      placeholder="z.B. Hero Section"
                      className="w-full rounded-md border border-input bg-navy-deep/50 px-2 py-1.5 text-xs outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">CSS-Selektor</label>
                  <input
                    type="text"
                    value={el.cssSelector}
                    onChange={(e) => updateElement(i, "cssSelector", e.target.value)}
                    placeholder="h1.hero-title, .headline-text, #main-heading"
                    className="w-full rounded-md border border-input bg-navy-deep/50 px-2 py-1.5 text-xs font-mono outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Aktueller Text</label>
                  <textarea
                    value={el.originalText}
                    onChange={(e) => updateElement(i, "originalText", e.target.value)}
                    rows={2}
                    placeholder="Der aktuelle Text dieses Elements..."
                    className="w-full rounded-md border border-input bg-navy-deep/50 px-2 py-1.5 text-xs outline-none focus:border-gold resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createProjectMutation.isPending || !name.trim() || !targetUrl.trim() || !conversionUrlPattern.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold py-3 font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {createProjectMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="h-4 w-4" />
            )}
            Projekt erstellen
          </button>
        </form>
      </main>
    </div>
  );
}
