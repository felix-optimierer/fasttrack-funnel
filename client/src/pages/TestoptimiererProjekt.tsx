/**
 * Testoptimierer – Projekt-Detail-Seite
 * Zeigt alle Tests, Elemente und Performance eines Projekts.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import {
  Loader2, ArrowLeft, Plus, Play, Pause, Square, SkipForward,
  TrendingUp, TrendingDown, Minus, Users, Target, Clock,
  ExternalLink, Copy, FlaskConical, CheckCircle2, XCircle, AlertCircle,
  BarChart3, Calendar, Trash2, Pencil, Shield, ShieldCheck, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

const TEST_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  running: { label: "Läuft", color: "text-emerald-400", icon: Play },
  paused: { label: "Pausiert", color: "text-yellow-400", icon: Pause },
  winner_a: { label: "Gewinner: Original", color: "text-blue-400", icon: CheckCircle2 },
  winner_b: { label: "Gewinner: Variante", color: "text-emerald-400", icon: CheckCircle2 },
  no_result: { label: "Kein Ergebnis", color: "text-muted-foreground", icon: AlertCircle },
  stopped: { label: "Gestoppt", color: "text-red-400", icon: Square },
  skipped: { label: "Übersprungen", color: "text-muted-foreground", icon: SkipForward },
};

export default function TestoptimiererProjekt() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id ?? "0", 10);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const projectQuery = trpc.testoptimierer.getProject.useQuery(
    { id: projectId },
    { retry: false, refetchOnWindowFocus: false, enabled: projectId > 0 }
  );

  const performanceQuery = trpc.testoptimierer.getProjectPerformance.useQuery(
    { projectId },
    { retry: false, refetchOnWindowFocus: false, enabled: projectId > 0 }
  );

  const updateStatusMutation = trpc.testoptimierer.updateTestStatus.useMutation({
    onSuccess: () => {
      projectQuery.refetch();
      toast.success("Test-Status aktualisiert.");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateProjectMutation = trpc.testoptimierer.updateProject.useMutation({
    onSuccess: () => {
      projectQuery.refetch();
      toast.success("Projekt aktualisiert.");
    },
  });

  if (projectQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (projectQuery.error || !projectQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-deep text-foreground gap-4">
        <p className="text-red-400">Projekt nicht gefunden oder kein Zugriff.</p>
        <button onClick={() => navigate("/testoptimierer")} className="text-gold underline">Zurück</button>
      </div>
    );
  }

  const { project, elements, tests } = projectQuery.data;
  const performance = performanceQuery.data;
  const runningTest = tests.find(t => t.status === "running");

  // Build tag URL
  const tagUrl = `${window.location.origin}/api/testoptimierer/tag/${project.id}`;

  return (
    <div className="min-h-screen bg-navy-deep text-foreground">
      <SEO title={`${project.name} – Testoptimierer`} description="Projekt-Details" />

      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/testoptimierer")} className="text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold">{project.name}</h1>
              <p className="text-xs text-muted-foreground">{project.targetUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Project Status Toggle */}
            <select
              value={project.status}
              onChange={(e) => updateProjectMutation.mutate({ id: project.id, status: e.target.value as any })}
              className="rounded-md border border-border/30 bg-card/60 px-3 py-1.5 text-sm outline-none focus:border-gold"
            >
              <option value="active">Aktiv</option>
              <option value="paused">Pausiert</option>
              <option value="stopped">Gestoppt</option>
            </select>
            <button
              onClick={() => navigate(`/testoptimierer/projekt/${project.id}/neuer-test`)}
              disabled={!!runningTest}
              className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              Neuer Test
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Tag Embed Code + Verification */}
        <EmbedSection project={project} tagUrl={tagUrl} />

        {/* Overall Performance */}
        {performance && performance.completedTests > 0 && (
          <div className="rounded-xl border border-border/30 bg-card/60 p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gold" />
              Gesamtperformance seit Beginn
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Abgeschlossene Tests</div>
                <div className="text-lg font-bold">{performance.completedTests}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gesamtbesucher</div>
                <div className="text-lg font-bold">{performance.totalVisitors.toLocaleString("de-DE")}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gewichtete Steigerung</div>
                <div className={`text-lg font-bold ${performance.weightedImprovement >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {performance.weightedImprovement >= 0 ? "+" : ""}{performance.weightedImprovement.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Zusätzliche Leads</div>
                <div className={`text-lg font-bold ${performance.estimatedAdditionalLeads >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {performance.estimatedAdditionalLeads >= 0 ? "+" : ""}{performance.estimatedAdditionalLeads}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Performance */}
        <WeeklyPerformanceSection projectId={projectId} />

        {/* Running Test */}
        {runningTest && <RunningTestCard test={runningTest} onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status: status as "running" | "paused" | "stopped" | "skipped" })} />}

        {/* Test History */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Test-Historie ({tests.length})</h3>
          {tests.length === 0 ? (
            <p className="text-muted-foreground text-sm">Noch keine Tests. Starte deinen ersten Test oben.</p>
          ) : (
            <div className="space-y-2">
              {tests.map(test => (
                <TestHistoryRow key={test.id} test={test} onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status: status as "running" | "paused" | "stopped" | "skipped" })} />
              ))}
            </div>
          )}
        </div>

        {/* Elements with CRUD */}
        <ElementsSection elements={elements} projectId={projectId} onRefetch={() => projectQuery.refetch()} />
      </main>
    </div>
  );
}

// ─── EMBED SECTION ─────────────────────────────────────────────────────────────

function EmbedSection({ project, tagUrl }: { project: any; tagUrl: string }) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; embedded: boolean; message: string } | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const resp = await fetch(`/api/testoptimierer/verify/${project.id}`);
      const data = await resp.json();
      setVerifyResult(data);
    } catch {
      setVerifyResult({ ok: false, embedded: false, message: "Verbindungsfehler. Bitte erneut versuchen." });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/30 bg-card/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-gold" />
          Embed-Code
        </h3>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`<script src="${tagUrl}"></script>`);
            toast.success("Code kopiert!");
          }}
          className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-soft transition"
        >
          <Copy className="h-3.5 w-3.5" />
          Kopieren
        </button>
      </div>
      <code className="block rounded-md bg-navy-deep/80 p-3 text-xs text-muted-foreground font-mono break-all">
        {`<script src="${tagUrl}"></script>`}
      </code>
      <p className="text-xs text-muted-foreground mt-2">
        Füge diesen Code vor dem schließenden &lt;/body&gt;-Tag auf deiner Zielseite ein.
      </p>

      {/* Manus Prompt */}
      <div className="mt-3 rounded-md bg-navy-deep/60 border border-border/20 p-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-gold">Manus-Prompt zum Einbetten</p>
          <button
            onClick={() => {
              const prompt = `Bitte füge folgenden Script-Tag vor dem schließenden </body>-Tag auf der Seite ${project.targetUrl} ein:\n\n<script src="${tagUrl}"></script>\n\nDanach bitte veröffentlichen.`;
              navigator.clipboard.writeText(prompt);
              toast.success("Prompt kopiert!");
            }}
            className="flex items-center gap-1.5 text-[10px] text-gold hover:text-gold-soft transition"
          >
            <Copy className="h-3 w-3" />
            Kopieren
          </button>
        </div>
        <code className="block text-[10px] text-muted-foreground font-mono whitespace-pre-wrap">
{`Bitte füge folgenden Script-Tag vor dem schließenden </body>-Tag auf der Seite ${project.targetUrl} ein:

<script src="${tagUrl}"></script>

Danach bitte veröffentlichen.`}
        </code>
      </div>

      {/* Tag Verification */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="flex items-center gap-2 rounded-md border border-border/30 bg-navy-deep/60 px-3 py-1.5 text-xs font-medium text-foreground hover:border-gold/50 transition disabled:opacity-50"
        >
          {verifying ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Shield className="h-3.5 w-3.5 text-gold" />
          )}
          Tag testen
        </button>
        {verifyResult && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            verifyResult.embedded ? "text-emerald-400" : "text-yellow-400"
          }`}>
            {verifyResult.embedded ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            {verifyResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ELEMENTS SECTION (CRUD) ───────────────────────────────────────────────────

const ELEMENT_TYPE_OPTIONS = [
  { value: "main_headline", label: "Haupt-Headline (H1)" },
  { value: "pre_headline", label: "Pre-Headline (Badge)" },
  { value: "sub_headline", label: "Sub-Headline" },
  { value: "cta", label: "CTA-Button" },
] as const;

function ElementsSection({ elements, projectId, onRefetch }: { elements: any[]; projectId: number; onRefetch: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    elementType: "main_headline" as string,
    cssSelector: "",
    originalText: "",
    label: "",
  });

  const createMutation = trpc.testoptimierer.createElement.useMutation({
    onSuccess: () => {
      toast.success("Element hinzugefügt!");
      onRefetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.testoptimierer.updateElement.useMutation({
    onSuccess: () => {
      toast.success("Element aktualisiert!");
      onRefetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.testoptimierer.deleteElement.useMutation({
    onSuccess: () => {
      toast.success("Element gelöscht.");
      onRefetch();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ elementType: "main_headline", cssSelector: "", originalText: "", label: "" });
  }

  function handleEdit(el: any) {
    setEditingId(el.id);
    setForm({
      elementType: el.elementType,
      cssSelector: el.cssSelector,
      originalText: el.originalText,
      label: el.label || "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cssSelector.trim() || !form.originalText.trim()) {
      toast.error("CSS-Selektor und Text sind Pflichtfelder.");
      return;
    }
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        cssSelector: form.cssSelector.trim(),
        originalText: form.originalText.trim(),
        label: form.label.trim() || undefined,
      });
    } else {
      createMutation.mutate({
        projectId,
        elementType: form.elementType as any,
        cssSelector: form.cssSelector.trim(),
        originalText: form.originalText.trim(),
        label: form.label.trim() || undefined,
      });
    }
  }

  return (
    <div className="rounded-xl border border-border/30 bg-card/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Konfigurierte Elemente ({elements.length})</h3>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-md bg-gold/10 border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition active:scale-[0.97]"
        >
          <Plus className="h-3.5 w-3.5" />
          Element hinzufügen
        </button>
      </div>

      {/* Element List */}
      {elements.length === 0 && !showForm && (
        <p className="text-muted-foreground text-sm">Noch keine Elemente konfiguriert. Klicke "Element hinzufügen" oder nutze den Auto-Scan beim Projekt-Erstellen.</p>
      )}
      {elements.length > 0 && (
        <div className="space-y-2 mb-3">
          {elements.map(el => (
            <div key={el.id} className="rounded-lg border border-border/20 bg-navy-deep/40 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gold uppercase">{el.elementType.replace("_", " ")}</span>
                  {el.label && <span className="text-xs text-muted-foreground">({el.label})</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(el)}
                    className="rounded p-1 text-muted-foreground hover:text-gold transition"
                    title="Bearbeiten"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Element wirklich löschen?")) {
                        deleteMutation.mutate({ id: el.id });
                      }
                    }}
                    className="rounded p-1 text-muted-foreground hover:text-red-400 transition"
                    title="Löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm mt-1 text-foreground/80 line-clamp-2">{el.originalText}</p>
              <code className="text-[10px] text-muted-foreground mt-1 block">{el.cssSelector}</code>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gold/20 bg-navy-deep/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gold">
              {editingId ? "Element bearbeiten" : "Neues Element"}
            </h4>
            <button type="button" onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground">
              Abbrechen
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Element-Typ</label>
              <select
                value={form.elementType}
                onChange={e => setForm({ ...form, elementType: e.target.value })}
                disabled={!!editingId}
                className="w-full rounded-md border border-border/30 bg-card/60 px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-50"
              >
                {ELEMENT_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Label (optional)</label>
              <input
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                placeholder="z.B. Haupt-CTA"
                className="w-full rounded-md border border-border/30 bg-card/60 px-3 py-2 text-sm outline-none focus:border-gold placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">CSS-Selektor</label>
            <input
              value={form.cssSelector}
              onChange={e => setForm({ ...form, cssSelector: e.target.value })}
              placeholder="z.B. h1 oder .hero-headline"
              className="w-full rounded-md border border-border/30 bg-card/60 px-3 py-2 text-sm font-mono outline-none focus:border-gold placeholder:text-muted-foreground/50"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Der CSS-Selektor, mit dem das Element auf der Seite gefunden wird.</p>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Aktueller Text (Original)</label>
            <textarea
              value={form.originalText}
              onChange={e => setForm({ ...form, originalText: e.target.value })}
              placeholder="Der aktuelle Text des Elements..."
              rows={2}
              className="w-full rounded-md border border-border/30 bg-card/60 px-3 py-2 text-sm outline-none focus:border-gold placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-soft transition disabled:opacity-50 active:scale-[0.97]"
          >
            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {editingId ? "Speichern" : "Hinzufügen"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── RUNNING TEST CARD ─────────────────────────────────────────────────────────

function RunningTestCard({ test, onStatusChange }: { test: any; onStatusChange: (id: number, status: string) => void }) {
  const significanceQuery = trpc.testoptimierer.getTestSignificance.useQuery(
    { id: test.id },
    { refetchInterval: 30000 }
  );

  const sig = significanceQuery.data;
  const totalVisitors = test.visitorsA + test.visitorsB;
  const crA = test.visitorsA > 0 ? ((test.conversionsA / test.visitorsA) * 100).toFixed(2) : "0,00";
  const crB = test.visitorsB > 0 ? ((test.conversionsB / test.visitorsB) * 100).toFixed(2) : "0,00";

  return (
    <div className="rounded-xl border-2 border-gold/30 bg-card/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
          Aktueller Test
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStatusChange(test.id, "paused")}
            className="rounded-md border border-border/30 p-1.5 text-yellow-400 hover:bg-yellow-400/10 transition"
            title="Pausieren"
          >
            <Pause className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onStatusChange(test.id, "stopped")}
            className="rounded-md border border-border/30 p-1.5 text-red-400 hover:bg-red-400/10 transition"
            title="Stoppen"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onStatusChange(test.id, "skipped")}
            className="rounded-md border border-border/30 p-1.5 text-muted-foreground hover:bg-muted/20 transition"
            title="Überspringen"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Variant A */}
        <div className="rounded-lg border border-border/20 bg-navy-deep/40 p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Original (A)</div>
          <p className="text-sm mb-3 line-clamp-2">{test.controlText}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Besucher</div>
              <div className="font-bold">{test.visitorsA.toLocaleString("de-DE")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Conversions</div>
              <div className="font-bold">{test.conversionsA}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">CR</div>
              <div className="font-bold">{crA}%</div>
            </div>
          </div>
        </div>

        {/* Variant B */}
        <div className="rounded-lg border border-gold/20 bg-navy-deep/40 p-3">
          <div className="text-xs font-medium text-gold mb-1">Variante (B)</div>
          <p className="text-sm mb-3 line-clamp-2">{test.variantText}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Besucher</div>
              <div className="font-bold">{test.visitorsB.toLocaleString("de-DE")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Conversions</div>
              <div className="font-bold">{test.conversionsB}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">CR</div>
              <div className="font-bold">{crB}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Significance Bar */}
      {sig && (
        <div className="mt-4 rounded-lg bg-navy-deep/40 p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Statistische Signifikanz</span>
            <span className={`font-bold ${sig.isSignificant ? "text-emerald-400" : "text-muted-foreground"}`}>
              {sig.confidencePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-border/30 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sig.confidencePercent >= 95 ? "bg-emerald-400" :
                sig.confidencePercent >= 80 ? "bg-yellow-400" : "bg-muted-foreground"
              }`}
              style={{ width: `${Math.min(sig.confidencePercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>p-Wert: {sig.pValue.toFixed(4)}</span>
            <span className={sig.improvementPercent >= 0 ? "text-emerald-400" : "text-red-400"}>
              {sig.improvementPercent >= 0 ? "+" : ""}{sig.improvementPercent.toFixed(2)}% Steigerung
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TEST HISTORY ROW ──────────────────────────────────────────────────────────

function TestHistoryRow({ test, onStatusChange }: { test: any; onStatusChange: (id: number, status: string) => void }) {
  const config = TEST_STATUS_CONFIG[test.status] ?? { label: test.status, color: "text-muted-foreground", icon: AlertCircle };
  const StatusIcon = config.icon;
  const totalVisitors = test.visitorsA + test.visitorsB;
  const improvement = test.improvementPercent ? parseFloat(test.improvementPercent) : null;

  return (
    <div className="rounded-lg border border-border/20 bg-card/40 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          {test.startedAt && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(test.startedAt).toLocaleDateString("de-DE")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{totalVisitors.toLocaleString("de-DE")} Besucher</span>
          {improvement !== null && (
            <span className={improvement >= 0 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
              {improvement >= 0 ? "+" : ""}{improvement.toFixed(2)}%
            </span>
          )}
          {test.status === "paused" && (
            <button
              onClick={() => onStatusChange(test.id, "running" as const)}
              className="rounded border border-emerald-500/30 px-2 py-0.5 text-emerald-400 hover:bg-emerald-400/10 transition"
            >
              Fortsetzen
            </button>
          )}
          {test.status === "stopped" && (
            <button
              onClick={() => onStatusChange(test.id, "running" as const)}
              className="rounded border border-emerald-500/30 px-2 py-0.5 text-emerald-400 hover:bg-emerald-400/10 transition"
            >
              Neu starten
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="text-muted-foreground truncate">A: {test.controlText}</div>
        <div className="text-muted-foreground truncate">B: {test.variantText}</div>
      </div>
      {/* Timeline dates */}
      {(test.startedAt || test.endedAt) && (
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {test.startedAt && <span>Start: {new Date(test.startedAt).toLocaleDateString("de-DE")}</span>}
          {test.endedAt && <span>→ Ende: {new Date(test.endedAt).toLocaleDateString("de-DE")}</span>}
          {test.startedAt && test.endedAt && (
            <span className="text-gold/70">
              ({Math.ceil((new Date(test.endedAt).getTime() - new Date(test.startedAt).getTime()) / (1000 * 60 * 60 * 24))} Tage)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Missing import
function Activity(props: any) {
  return <FlaskConical {...props} />;
}

// ─── WEEKLY PERFORMANCE SECTION ──────────────────────────────────────────────

function WeeklyPerformanceSection({ projectId }: { projectId: number }) {
  const weeklyQuery = trpc.testoptimierer.getWeeklyPerformance.useQuery(
    { projectId },
    { retry: false, refetchOnWindowFocus: false, enabled: projectId > 0 }
  );

  const weeks = weeklyQuery.data ?? [];

  if (weeklyQuery.isLoading) return null;
  if (weeks.length === 0) return null;

  // Calculate cumulative improvement
  let cumulativeLeads = 0;
  const enrichedWeeks = weeks.map(w => {
    const weekLeads = w.conversionsB - (w.visitorsB > 0 && w.crA > 0 ? Math.round(w.visitorsB * w.crA / 100) : 0);
    cumulativeLeads += weekLeads;
    return { ...w, additionalLeads: weekLeads, cumulativeLeads };
  });

  return (
    <div className="rounded-xl border border-border/30 bg-card/60 p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-gold" />
        Wochen-Performance
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/20 text-muted-foreground">
              <th className="text-left py-2 pr-3 font-medium">Woche</th>
              <th className="text-right py-2 px-2 font-medium">Besucher</th>
              <th className="text-right py-2 px-2 font-medium">CR (A)</th>
              <th className="text-right py-2 px-2 font-medium">CR (B)</th>
              <th className="text-right py-2 px-2 font-medium">Steigerung</th>
              <th className="text-right py-2 pl-2 font-medium">+Leads (kum.)</th>
            </tr>
          </thead>
          <tbody>
            {enrichedWeeks.map((w, i) => (
              <tr key={w.week} className="border-b border-border/10 last:border-0">
                <td className="py-2 pr-3 font-medium flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {w.week}
                </td>
                <td className="text-right py-2 px-2">
                  {(w.visitorsA + w.visitorsB).toLocaleString("de-DE")}
                </td>
                <td className="text-right py-2 px-2">{w.crA.toFixed(2)}%</td>
                <td className="text-right py-2 px-2">{w.crB.toFixed(2)}%</td>
                <td className={`text-right py-2 px-2 font-medium ${
                  w.improvement >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {w.improvement >= 0 ? "+" : ""}{w.improvement.toFixed(1)}%
                </td>
                <td className={`text-right py-2 pl-2 font-medium ${
                  w.cumulativeLeads >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {w.cumulativeLeads >= 0 ? "+" : ""}{w.cumulativeLeads}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
