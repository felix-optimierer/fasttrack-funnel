/**
 * Testoptimierer – Neues Projekt erstellen
 * Auto-scans the target URL to detect testable elements automatically.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, Loader2, FlaskConical, Search, Check, X,
  Type, MessageSquare, MousePointerClick, Tag,
} from "lucide-react";
import { toast } from "sonner";

type DetectedElement = {
  elementType: "main_headline" | "pre_headline" | "sub_headline" | "cta" | "bullet_point" | "body_copy";
  cssSelector: string;
  currentText: string;
  label: string;
  selected: boolean;
};

const ELEMENT_ICONS: Record<string, typeof Type> = {
  main_headline: Type,
  pre_headline: Tag,
  sub_headline: MessageSquare,
  cta: MousePointerClick,
  bullet_point: Tag,
  body_copy: MessageSquare,
};
const ELEMENT_LABELS: Record<string, string> = {
  main_headline: "Haupt-Headline",
  pre_headline: "Pre-Headline",
  sub_headline: "Sub-Headline",
  cta: "CTA-Button",
  bullet_point: "Bullet Point",
  body_copy: "Body Copy",
};

export default function TestoptimiererNeuesProjekt() {
  const [, navigate] = useLocation();

  // Step 1: Project basics
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [conversionUrlPattern, setConversionUrlPattern] = useState("/danke");
  const [conversionMatchType, setConversionMatchType] = useState<"exact" | "contains">("contains");

  // Step 2: Detected elements
  const [detectedElements, setDetectedElements] = useState<DetectedElement[]>([]);
  const [scanDone, setScanDone] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  const scanMutation = trpc.testoptimierer.scanPage.useMutation({
    onSuccess: (data) => {
      const elements = data.elements.map(el => ({ ...el, selected: true }));
      setDetectedElements(elements);
      setPageTitle(data.pageTitle);
      setScanDone(true);
      if (elements.length === 0) {
        toast.info("Keine testbaren Elemente gefunden. Du kannst sie manuell hinzufügen.");
      } else {
        toast.success(`${elements.length} Element(e) erkannt!`);
      }
      // Auto-fill project name from page title if empty
      if (!name.trim() && data.pageTitle) {
        setName(data.pageTitle.split("|")[0].trim() || data.pageTitle);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const createProjectMutation = trpc.testoptimierer.createProject.useMutation({
    onSuccess: async (data) => {
      // Create selected elements
      const selectedElements = detectedElements.filter(el => el.selected);
      for (const el of selectedElements) {
        await createElementMutation.mutateAsync({
          projectId: data.id,
          elementType: el.elementType,
          cssSelector: el.cssSelector,
          originalText: el.currentText,
          label: el.label,
        });
      }
      toast.success("Projekt erstellt!");
      navigate(`/testoptimierer/projekt/${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const createElementMutation = trpc.testoptimierer.createElement.useMutation();

  function handleScan() {
    if (!targetUrl.trim()) {
      toast.error("Bitte gib zuerst die Ziel-URL ein.");
      return;
    }
    scanMutation.mutate({ url: targetUrl.trim() });
  }

  function toggleElement(index: number) {
    setDetectedElements(prev =>
      prev.map((el, i) => i === index ? { ...el, selected: !el.selected } : el)
    );
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
          {/* URL + Scan */}
          <div className="rounded-xl border border-border/30 bg-card/60 p-5 space-y-4">
            <h3 className="text-sm font-semibold">1. Seite angeben</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Ziel-URL (die Seite, die getestet wird)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => { setTargetUrl(e.target.value); setScanDone(false); }}
                  placeholder="https://go.physiofreiheit.de/ki-report"
                  className="flex-1 rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
                />
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={scanMutation.isPending || !targetUrl.trim()}
                  className="flex items-center gap-2 rounded-lg bg-gold/20 border border-gold/40 px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/30 disabled:opacity-40 active:scale-[0.97]"
                >
                  {scanMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Scannen
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Klicke "Scannen", um automatisch testbare Elemente (Headlines, CTAs) auf der Seite zu erkennen.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Conversion-URL (Danke-Seite)
              </label>
              <input
                type="text"
                value={conversionUrlPattern}
                onChange={(e) => setConversionUrlPattern(e.target.value)}
                placeholder="/danke"
                className="w-full rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Die URL, die eine erfolgreiche Conversion anzeigt. Standard: /danke
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">URL-Matching</label>
                <select
                  value={conversionMatchType}
                  onChange={(e) => setConversionMatchType(e.target.value as "exact" | "contains")}
                  className="w-full rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  <option value="contains">Enthält (empfohlen)</option>
                  <option value="exact">Exakt</option>
                </select>
              </div>
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
            </div>
          </div>

          {/* Detected Elements */}
          {scanDone && (
            <div className="rounded-xl border border-border/30 bg-card/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">2. Erkannte Elemente</h3>
                {detectedElements.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {detectedElements.filter(e => e.selected).length} von {detectedElements.length} ausgewählt
                  </span>
                )}
              </div>

              {pageTitle && (
                <p className="text-xs text-muted-foreground">
                  Seite: <span className="text-foreground">{pageTitle}</span>
                </p>
              )}

              {detectedElements.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Keine testbaren Elemente automatisch erkannt.
                  <br />
                  <span className="text-xs">
                    Das kann bei SPAs (React/Vue) passieren, da der initiale HTML-Code leer ist.
                    Du kannst Elemente nach der Projekterstellung manuell hinzufügen.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {detectedElements.map((el, i) => {
                    const Icon = ELEMENT_ICONS[el.elementType] ?? Type;
                    return (
                      <div
                        key={i}
                        onClick={() => toggleElement(i)}
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                          el.selected
                            ? "border-gold bg-gold/5"
                            : "border-border/20 opacity-50 hover:opacity-75"
                        }`}
                      >
                        <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded ${
                          el.selected ? "bg-gold text-navy-deep" : "border border-border"
                        }`}>
                          {el.selected && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-gold" />
                            <span className="text-xs font-medium text-gold uppercase">
                              {ELEMENT_LABELS[el.elementType]}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {el.cssSelector}
                            </span>
                          </div>
                          <p className="text-sm mt-1 truncate">{el.currentText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
