/**
 * Testoptimierer – Scorecard Page (/testoptimierer/scorecard)
 * Shows overall performance per project with LP CR and expandable test details.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, Minus,
} from "lucide-react";
import TestoptimiererLayout from "@/components/TestoptimiererLayout";

type SortBy = "improvement" | "visitors" | "tests";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  running: { label: "Läuft", color: "text-emerald-400" },
  paused: { label: "Pausiert", color: "text-yellow-400" },
  winner_a: { label: "Original gewonnen", color: "text-blue-400" },
  winner_b: { label: "Variante gewonnen", color: "text-emerald-400" },
  no_result: { label: "Kein Ergebnis", color: "text-muted-foreground" },
  stopped: { label: "Gestoppt", color: "text-red-400" },
  skipped: { label: "Übersprungen", color: "text-muted-foreground" },
};

export default function TestoptimiererScorecard() {
  const [, navigate] = useLocation();
  const [sortBy, setSortBy] = useState<SortBy>("improvement");
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const { data: scorecard, isLoading } = trpc.testoptimierer.getScorecard.useQuery();

  const cards = scorecard?.map(s => ({
    projectName: s.project.name,
    projectId: s.project.id,
    targetUrl: s.project.targetUrl,
    baselineCR: s.baselineCR,
    currentCR: s.currentCR,
    testDetails: s.testDetails,
    ...s.performance,
  })) ?? [];

  // Sort
  const sorted = [...cards].sort((a, b) => {
    if (sortBy === "improvement") return b.weightedImprovement - a.weightedImprovement;
    if (sortBy === "visitors") return b.totalVisitors - a.totalVisitors;
    return b.completedTests - a.completedTests;
  });

  return (
    <TestoptimiererLayout activeTab="/testoptimierer/scorecard">
      <SEO title="Scorecard – Testoptimierer" description="Gesamtperformance aller Projekte" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold">Scorecard</h2>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="improvement">Beste Verbesserung</option>
          <option value="visitors">Meiste Besucher</option>
          <option value="tests">Meiste Tests</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Laden...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          Noch keine Projekte vorhanden.
        </div>
      ) : (
        <div className="grid gap-4">
          {sorted.map((card) => {
            const isPositive = card.weightedImprovement > 0;
            const isExpanded = expandedProject === card.projectId;
            return (
              <div
                key={card.projectId}
                className="rounded-xl border border-border bg-card p-5 transition hover:border-gold/40"
              >
                {/* Header Row – clickable to navigate */}
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer"
                  onClick={() => navigate(`/testoptimierer/projekt/${card.projectId}`)}
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{card.projectName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.targetUrl}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-lg font-bold ${isPositive ? "text-green-400" : card.weightedImprovement < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                    {isPositive ? <TrendingUp className="h-5 w-5" /> : card.weightedImprovement < 0 ? <TrendingDown className="h-5 w-5" /> : null}
                    {card.weightedImprovement > 0 ? "+" : ""}{card.weightedImprovement.toFixed(1)}%
                  </div>
                </div>

                {/* Metrics Grid with LP CR */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">LP CR (Start)</span>
                    <p className="font-semibold">{card.baselineCR.toFixed(2).replace(".", ",")}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">LP CR (Aktuell)</span>
                    <p className={`font-semibold ${card.currentCR > card.baselineCR ? "text-green-400" : card.currentCR < card.baselineCR ? "text-red-400" : ""}`}>
                      {card.currentCR.toFixed(2).replace(".", ",")}%
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tests</span>
                    <p className="font-semibold">{card.completedTests} / {card.totalTests}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Besucher</span>
                    <p className="font-semibold">{card.totalVisitors.toLocaleString("de-DE")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Zusätzliche Leads</span>
                    <p className={`font-semibold ${card.estimatedAdditionalLeads >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {card.estimatedAdditionalLeads >= 0 ? "+" : ""}{card.estimatedAdditionalLeads}
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse Tests */}
                {card.testDetails.length > 0 && (
                  <div className="mt-3 border-t border-border/20 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedProject(isExpanded ? null : card.projectId);
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-gold transition"
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      {card.testDetails.length} Test{card.testDetails.length !== 1 ? "s" : ""} anzeigen
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {card.testDetails.map((test) => {
                          const crA = test.visitorsA > 0 ? ((test.conversionsA / test.visitorsA) * 100) : 0;
                          const crB = test.visitorsB > 0 ? ((test.conversionsB / test.visitorsB) * 100) : 0;
                          const statusInfo = STATUS_LABELS[test.status] ?? { label: test.status, color: "text-muted-foreground" };
                          const improvement = test.improvementPercent;
                          return (
                            <div key={test.id} className="rounded-lg bg-navy-deep/40 border border-border/10 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                                {improvement !== null && (
                                  <span className={`text-xs font-bold ${improvement > 0 ? "text-green-400" : improvement < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                                    {improvement > 0 ? "+" : ""}{improvement.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Original:</span>
                                  <p className="text-foreground/80 line-clamp-1">{test.controlText || "–"}</p>
                                  <span className="text-muted-foreground">CR: {crA.toFixed(2).replace(".", ",")}% ({test.conversionsA}/{test.visitorsA})</span>
                                </div>
                                <div>
                                  <span className="text-gold">Variante:</span>
                                  <p className="text-foreground/80 line-clamp-1">{test.variantText || "–"}</p>
                                  <span className="text-muted-foreground">CR: {crB.toFixed(2).replace(".", ",")}% ({test.conversionsB}/{test.visitorsB})</span>
                                </div>
                              </div>
                              {test.startedAt && (
                                <p className="text-[10px] text-muted-foreground mt-1.5">
                                  {new Date(test.startedAt).toLocaleDateString("de-DE")}
                                  {test.endedAt && ` – ${new Date(test.endedAt).toLocaleDateString("de-DE")}`}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </TestoptimiererLayout>
  );
}
