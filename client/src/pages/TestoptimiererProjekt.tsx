/**
 * Testoptimierer – Projekt-Detail-Seite
 * Zeigt alle Tests, Elemente und Performance eines Projekts.
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import {
  Loader2, ArrowLeft, Plus, Play, Pause, Square, SkipForward,
  TrendingUp, TrendingDown, Minus, Users, Target, Clock,
  ExternalLink, Copy, FlaskConical, CheckCircle2, XCircle, AlertCircle,
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
        {/* Tag Embed Code */}
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
        </div>

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

        {/* Elements */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Konfigurierte Elemente ({elements.length})</h3>
          {elements.length === 0 ? (
            <p className="text-muted-foreground text-sm">Noch keine Elemente konfiguriert.</p>
          ) : (
            <div className="space-y-2">
              {elements.map(el => (
                <div key={el.id} className="rounded-lg border border-border/20 bg-card/40 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-gold uppercase">{el.elementType.replace("_", " ")}</span>
                      {el.label && <span className="text-xs text-muted-foreground ml-2">({el.label})</span>}
                    </div>
                  </div>
                  <p className="text-sm mt-1 text-foreground/80 line-clamp-2">{el.originalText}</p>
                  <code className="text-[10px] text-muted-foreground mt-1 block">{el.cssSelector}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
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
    </div>
  );
}

// Missing import
function Activity(props: any) {
  return <FlaskConical {...props} />;
}
