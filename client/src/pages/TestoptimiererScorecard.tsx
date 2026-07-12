/**
 * Testoptimierer – Scorecard Page (/testoptimierer/scorecard)
 * Shows overall performance per project with filtering and sorting.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";
import {
  TrendingUp, TrendingDown, ArrowRight,
} from "lucide-react";
import TestoptimiererLayout from "@/components/TestoptimiererLayout";

type SortBy = "improvement" | "visitors" | "tests";

export default function TestoptimiererScorecard() {
  const [, navigate] = useLocation();
  const [sortBy, setSortBy] = useState<SortBy>("improvement");

  const { data: scorecard, isLoading } = trpc.testoptimierer.getScorecard.useQuery();

  const cards = scorecard?.map(s => ({
    projectName: s.project.name,
    projectId: s.project.id,
    targetUrl: s.project.targetUrl,
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
            return (
              <div
                key={card.projectId}
                onClick={() => navigate(`/testoptimierer/projekt/${card.projectId}`)}
                className="cursor-pointer rounded-xl border border-border bg-card p-5 transition hover:border-gold/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{card.projectName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.targetUrl}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-lg font-bold ${isPositive ? "text-green-400" : card.weightedImprovement < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                    {isPositive ? <TrendingUp className="h-5 w-5" /> : card.weightedImprovement < 0 ? <TrendingDown className="h-5 w-5" /> : null}
                    {card.weightedImprovement > 0 ? "+" : ""}{card.weightedImprovement.toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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
                  <div>
                    <span className="text-muted-foreground">Positiv / Negativ</span>
                    <p className="font-semibold">
                      <span className="text-green-400">{card.positiveTests}</span>
                      {" / "}
                      <span className="text-red-400">{card.negativeTests}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </TestoptimiererLayout>
  );
}
