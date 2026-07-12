/**
 * Testoptimierer – Admin Dashboard
 * Main page with tabs: Übersicht, Scorecard, Einstellungen
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Logo } from "@/components/funnel";
import {
  Loader2, Plus, BarChart3, Settings, Trophy, ArrowRight,
  Activity, Users, TrendingUp, TrendingDown, Pause, Play,
  Square, ExternalLink, Eye, FlaskConical,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "scorecard" | "settings";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Aktiv", color: "bg-emerald-500" },
  paused: { label: "Pausiert", color: "bg-yellow-500" },
  stopped: { label: "Gestoppt", color: "bg-red-500" },
};

export default function Testoptimierer() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const utils = trpc.useUtils();

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  const scorecardQuery = trpc.testoptimierer.getScorecard.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: tab === "scorecard",
  });

  const settingsQuery = trpc.testoptimierer.getSettings.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: tab === "settings",
  });

  const initSettingsMutation = trpc.testoptimierer.initSettings.useMutation({
    onSuccess: () => {
      settingsQuery.refetch();
      toast.success("Standard-Einstellungen initialisiert.");
    },
  });

  const updateSettingMutation = trpc.testoptimierer.updateSetting.useMutation({
    onSuccess: () => {
      settingsQuery.refetch();
      toast.success("Einstellung gespeichert.");
    },
  });

  if (meQuery.isLoading || (meQuery.data?.isAdmin && projectsQuery.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!meQuery.data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-foreground">
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
    <div className="min-h-screen bg-navy-deep text-foreground">
      <SEO title="Testoptimierer" description="A/B Testing Dashboard" />

      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6 text-gold" />
            <h1 className="font-display text-lg font-bold">Testoptimierer</h1>
          </div>
          <button
            onClick={() => navigate("/testoptimierer/neu")}
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Neues Projekt
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border/20">
        <div className="container flex gap-1 pt-2">
          {([
            { id: "overview" as Tab, label: "Übersicht", icon: <BarChart3 className="h-3.5 w-3.5" /> },
            { id: "scorecard" as Tab, label: "Scorecard", icon: <Trophy className="h-3.5 w-3.5" /> },
            { id: "settings" as Tab, label: "Einstellungen", icon: <Settings className="h-3.5 w-3.5" /> },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-card text-gold border-b-2 border-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="container py-6">
        {tab === "overview" && <OverviewTab projects={projects} navigate={navigate} />}
        {tab === "scorecard" && <ScorecardTab data={scorecardQuery.data} isLoading={scorecardQuery.isLoading} />}
        {tab === "settings" && (
          <SettingsTab
            settings={settingsQuery.data ?? []}
            isLoading={settingsQuery.isLoading}
            onInit={() => initSettingsMutation.mutate()}
            onUpdate={(key, value) => updateSettingMutation.mutate({ key, value })}
          />
        )}
      </main>
    </div>
  );
}

// ─── OVERVIEW TAB ──────────────────────────────────────────────────────────────

function OverviewTab({ projects, navigate }: { projects: any[]; navigate: (path: string) => void }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FlaskConical className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-bold mb-2">Noch keine Projekte</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Erstelle dein erstes A/B-Testing-Projekt, um Headlines, Sub-Headlines und CTAs zu optimieren.
        </p>
        <button
          onClick={() => navigate("/testoptimierer/neu")}
          className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 font-semibold text-navy-deep transition hover:bg-gold-soft"
        >
          <Plus className="h-4 w-4" />
          Erstes Projekt erstellen
        </button>
      </div>
    );
  }

  return (
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
  );
}

// ─── SCORECARD TAB ─────────────────────────────────────────────────────────────

function ScorecardTab({ data, isLoading }: { data: any[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Noch keine Daten vorhanden. Erstelle zuerst ein Projekt und starte einen Test.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-4">Gesamtperformance aller Projekte</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 text-left text-muted-foreground">
              <th className="pb-3 pr-4">Projekt</th>
              <th className="pb-3 pr-4 text-right">Tests</th>
              <th className="pb-3 pr-4 text-right">Besucher</th>
              <th className="pb-3 pr-4 text-right">Positiv</th>
              <th className="pb-3 pr-4 text-right">Negativ</th>
              <th className="pb-3 pr-4 text-right">Gewichtete Steigerung</th>
              <th className="pb-3 text-right">Zusätzliche Leads</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ project, performance }) => (
              <tr key={project.id} className="border-b border-border/10">
                <td className="py-3 pr-4 font-medium">{project.name}</td>
                <td className="py-3 pr-4 text-right">{performance.completedTests}</td>
                <td className="py-3 pr-4 text-right">{performance.totalVisitors.toLocaleString("de-DE")}</td>
                <td className="py-3 pr-4 text-right text-emerald-400">{performance.positiveTests}</td>
                <td className="py-3 pr-4 text-right text-red-400">{performance.negativeTests}</td>
                <td className="py-3 pr-4 text-right">
                  <span className={performance.weightedImprovement >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {performance.weightedImprovement >= 0 ? "+" : ""}{performance.weightedImprovement.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={performance.estimatedAdditionalLeads >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {performance.estimatedAdditionalLeads >= 0 ? "+" : ""}{performance.estimatedAdditionalLeads}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ──────────────────────────────────────────────────────────────

function SettingsTab({
  settings,
  isLoading,
  onInit,
  onUpdate,
}: {
  settings: any[];
  isLoading: boolean;
  onInit: () => void;
  onUpdate: (key: string, value: string) => void;
}) {
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const vals: Record<string, string> = {};
    settings.forEach(s => { vals[s.settingKey] = s.settingValue ?? ""; });
    setEditValues(vals);
  }, [settings]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }

  if (settings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Noch keine Einstellungen vorhanden.</p>
        <button
          onClick={onInit}
          className="rounded-lg bg-gold px-5 py-2.5 font-semibold text-navy-deep transition hover:bg-gold-soft"
        >
          Standard-Einstellungen initialisieren
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-bold">Signifikanz-Einstellungen</h2>
      <p className="text-sm text-muted-foreground">
        Hier kannst du die Schwellenwerte für die automatische Signifikanz-Prüfung anpassen.
        Die Prüfung läuft automatisch alle 3 Stunden.
      </p>

      {settings.map(setting => (
        <div key={setting.settingKey} className="rounded-xl border border-border/30 bg-card/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold">{formatSettingLabel(setting.settingKey)}</label>
            <button
              onClick={() => onUpdate(setting.settingKey, editValues[setting.settingKey] ?? "")}
              disabled={editValues[setting.settingKey] === setting.settingValue}
              className="text-xs rounded bg-gold/20 px-2 py-1 text-gold font-medium disabled:opacity-30 hover:bg-gold/30 transition"
            >
              Speichern
            </button>
          </div>
          {setting.description && (
            <p className="text-xs text-muted-foreground mb-3">{setting.description}</p>
          )}
          <input
            type="text"
            value={editValues[setting.settingKey] ?? ""}
            onChange={(e) => setEditValues(prev => ({ ...prev, [setting.settingKey]: e.target.value }))}
            className="w-full rounded-md border border-input bg-navy-deep/50 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
          />
        </div>
      ))}
    </div>
  );
}

function formatSettingLabel(key: string): string {
  const labels: Record<string, string> = {
    significance_threshold: "Signifikanz-Schwelle (p-Wert)",
    min_visitors_for_stop: "Min. Besucher für Auto-Stopp",
    p_value_threshold_for_stop: "p-Wert-Schwelle für Auto-Stopp",
    max_visitors_timeout: "Max. Besucher (Timeout)",
    check_interval_hours: "Prüf-Intervall (Stunden)",
  };
  return labels[key] ?? key;
}
