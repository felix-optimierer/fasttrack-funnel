/**
 * Testoptimierer – Übersicht (Overview Page)
 * Shows project list with summary stats. Login gate for admin access.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import {
  Loader2, Plus, ArrowRight, Activity, Users, Trophy,
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import TestoptimiererLayout from "@/components/TestoptimiererLayout";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Aktiv", color: "bg-emerald-500" },
  paused: { label: "Pausiert", color: "bg-yellow-500" },
  stopped: { label: "Gestoppt", color: "bg-red-500" },
};

export default function Testoptimierer() {
  const [, navigate] = useLocation();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const utils = trpc.useUtils();

  const meQuery = trpc.admin.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => { utils.admin.me.invalidate(); toast.success("Eingeloggt!"); },
    onError: (err) => toast.error(err.message || "Login fehlgeschlagen."),
  });

  const projectsQuery = trpc.testoptimierer.listProjects.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: meQuery.data?.isAdmin === true,
  });

  // Loading state
  if (meQuery.isLoading || (meQuery.data?.isAdmin && projectsQuery.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  // Login gate
  if (!meQuery.data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-foreground">
        <SEO title="Testoptimierer – Login" description="Admin Login" />
        <form
          onSubmit={(e) => { e.preventDefault(); loginMutation.mutate({ email: loginEmail, password: loginPassword }); }}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card/90 p-6 backdrop-blur"
        >
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="h-6 w-6 text-gold" />
            <h2 className="font-display text-lg font-bold">Testoptimierer Login</h2>
          </div>
          <input
            type="email"
            placeholder="E-Mail"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-gold py-3 font-semibold text-navy-deep transition hover:bg-gold-soft active:scale-[0.97] disabled:opacity-50"
          >
            {loginMutation.isPending ? "..." : "Einloggen"}
          </button>
        </form>
      </div>
    );
  }

  const projects = projectsQuery.data ?? [];

  return (
    <TestoptimiererLayout activeTab="/testoptimierer">
      <SEO title="Testoptimierer" description="A/B Testing Dashboard" />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FlaskConical className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold mb-2">Noch keine Projekte</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Erstelle dein erstes A/B-Testing-Projekt, um Headlines, Sub-Headlines und CTAs zu optimieren.
          </p>
          <button
            onClick={() => navigate("/testoptimierer/neu")}
            className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 font-semibold text-navy-deep transition hover:bg-gold-soft active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Erstes Projekt erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl border border-border/30 bg-card/60 p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Activity className="h-4 w-4" />
                Aktive Tests
              </div>
              <div className="text-2xl font-bold text-gold">
                {projects.filter(p => p.runningTest).length}
              </div>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Users className="h-4 w-4" />
                Gesamtbesucher
              </div>
              <div className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + p.totalVisitors, 0).toLocaleString("de-DE")}
              </div>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Trophy className="h-4 w-4" />
                Abgeschlossene Tests
              </div>
              <div className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + p.completedTests, 0)}
              </div>
            </div>
          </div>

          {/* Project List */}
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/testoptimierer/projekt/${project.id}`)}
                className="group cursor-pointer rounded-xl border border-border/30 bg-card/60 p-4 transition hover:border-gold/40 hover:bg-card/80"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${STATUS_LABELS[project.status]?.color ?? "bg-gray-500"}`} />
                    <div>
                      <h3 className="font-semibold group-hover:text-gold transition">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.targetUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {project.runningTest && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Laufender Test</div>
                        <div className="text-sm font-medium">
                          {(project.runningTest.visitorsA + project.runningTest.visitorsB).toLocaleString("de-DE")} Besucher
                        </div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Tests</div>
                      <div className="text-sm font-medium">{project.totalTests}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </TestoptimiererLayout>
  );
}
