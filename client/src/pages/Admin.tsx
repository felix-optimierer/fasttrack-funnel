// ADMIN-DASHBOARD (/admin) — 6-Tab Dashboard: Übersicht, Funnel, Submissions, CRM, Ad-Kosten, Einstellungen
import { useState, useMemo, useCallback, DragEvent } from "react";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Logo, GoldButton } from "@/components/funnel";
import { ASSETS } from "@/lib/site";
import {
  Lock, LogOut, Users, Eye, Webhook, Send, Loader2, RefreshCw,
  ArrowRight, TrendingUp, Calendar, DollarSign, Settings, BarChart3,
  Search, Download, X, ChevronLeft, ChevronRight, StickyNote,
  Table, Kanban, Globe, Monitor, ExternalLink, Phone, Mail, Clock,
  Filter, FileText, FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";

type Period = "day" | "week" | "month";
type Tab = "overview" | "funnel" | "submissions" | "crm" | "adcosts" | "settings";

const PERIOD_LABEL: Record<Period, string> = {
  day: "Heute", week: "Diese Woche", month: "Dieser Monat",
};

const CHANNEL_LABEL: Record<string, string> = {
  "ki-report": "KI-Report", "exit-plan": "Exit-Plan", "traumwebseite": "Traumwebseite",
};

const CHANNEL_COLORS: Record<string, string> = {
  "ki-report": "#c9a227", "exit-plan": "#22c55e", "traumwebseite": "#3b82f6",
};

const CRM_STATUSES = [
  { value: "new", label: "Neuer Lead", color: "bg-blue-500", border: "border-blue-500" },
  { value: "contacted", label: "Kontaktiert", color: "bg-yellow-500", border: "border-yellow-500" },
  { value: "qualified", label: "Qualifiziert", color: "bg-emerald-500", border: "border-emerald-500" },
  { value: "appointment", label: "Terminiert", color: "bg-green-600", border: "border-green-600" },
  { value: "closed", label: "Gewonnen", color: "bg-primary", border: "border-primary" },
  { value: "lost", label: "Verloren", color: "bg-red-500", border: "border-red-500" },
];

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Übersicht", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: "funnel", label: "Funnel", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "submissions", label: "Alle Leads", icon: <Table className="h-3.5 w-3.5" /> },
  { id: "crm", label: "CRM", icon: <Kanban className="h-3.5 w-3.5" /> },
  { id: "adcosts", label: "Ad-Kosten", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { id: "settings", label: "Einstellungen", icon: <Settings className="h-3.5 w-3.5" /> },
];

export default function Admin() {
  const utils = trpc.useUtils();
  const meQuery = trpc.admin.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!meQuery.data?.isAdmin) {
    return <LoginScreen onLoggedIn={() => utils.admin.me.invalidate()} />;
  }

  return (
    <>
      <SEO title="Admin Dashboard | Physio Freiheit" description="Internes Admin-Dashboard: Funnel-Statistiken, Lead-Management und Webhook-Einstellungen für Physio Freiheit." canonical="https://go.physiofreiheit.de/admin" />
      <Dashboard onLogout={() => utils.admin.me.invalidate()} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════════════════════════ */
function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = trpc.admin.login.useMutation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => { toast.success("Willkommen zurück."); onLoggedIn(); },
        onError: (err) => { toast.error(err.message || "Login fehlgeschlagen."); },
      },
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5"
      style={{
        backgroundImage: `linear-gradient(rgba(6,15,28,0.9), rgba(6,15,28,0.96)), url(${ASSETS.heroBg})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}
    >
      <Logo className="mb-8" />
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur">
        <div className="mb-2 flex items-center justify-center gap-2 text-gold">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">Admin-Login</span>
        </div>
        <input type="email" value={email} placeholder="E-Mail" autoComplete="username" onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40" />
        <input type="password" value={password} placeholder="Passwort" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40" />
        <GoldButton type="submit" glow className="w-full" disabled={login.isPending}>
          {login.isPending ? "Anmelden…" : "Anmelden"}
        </GoldButton>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DASHBOARD SHELL
   ═══════════════════════════════════════════════════════════════════════════════ */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<Period>("week");
  const [tab, setTab] = useState<Tab>("overview");
  const utils = trpc.useUtils();
  const logout = trpc.admin.logout.useMutation();

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => { toast.success("Abgemeldet."); onLogout(); } });
  }

  function handleRefresh() {
    utils.admin.invalidate();
  }

  return (
    <div className="min-h-screen bg-navy-deep text-foreground">
      <header className="border-b border-border bg-card/40 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8" />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.18em] text-gold sm:inline">Admin-Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/testoptimierer")} className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold transition hover:bg-gold/20">
              <FlaskConical className="h-4 w-4" /> Testoptimierer
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition hover:border-gold/50">
              <LogOut className="h-4 w-4" /> Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="container space-y-6 py-6">
        {/* Tab-Navigation + Zeitraum */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition sm:text-sm ${tab === t.id ? "bg-gradient-to-b from-[#e3c75a] to-[#c9a227] text-navy" : "text-muted-foreground hover:text-foreground"}`}>
                {t.icon} <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {(tab === "overview" || tab === "funnel") && (
              <div className="inline-flex rounded-lg border border-border bg-card p-1">
                {(["day", "week", "month"] as Period[]).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${period === p ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </div>
            )}
            <button onClick={handleRefresh} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {tab === "overview" && <OverviewTab period={period} />}
        {tab === "funnel" && <FunnelTab period={period} />}
        {tab === "submissions" && <SubmissionsTab />}
        {tab === "crm" && <CrmTab />}
        {tab === "adcosts" && <AdCostsTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB — KPI Tiles + Per-Channel Funnel + Charts
   ═══════════════════════════════════════════════════════════════════════════════ */
function OverviewTab({ period }: { period: Period }) {
  const funnelQuery = trpc.admin.funnelStats.useQuery({ period });
  const days = period === "day" ? 7 : period === "week" ? 14 : 30;
  const seriesQuery = trpc.admin.channelSeries.useQuery({ days });

  // KPI aggregation
  const kpis = useMemo(() => {
    if (!funnelQuery.data) return null;
    let totalVisitors = 0, totalLeads = 0, totalAppointments = 0, totalSpend = 0;
    for (const ch of funnelQuery.data) {
      totalVisitors += ch.visitors;
      totalLeads += ch.leads;
      totalAppointments += ch.appointments;
      totalSpend += ch.adSpendCents;
    }
    const avgCr = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;
    const avgTerminCr = totalLeads > 0 ? (totalAppointments / totalLeads) * 100 : 0;
    const avgCpl = totalLeads > 0 ? totalSpend / totalLeads / 100 : 0;
    return { totalVisitors, totalLeads, totalAppointments, avgCr, avgTerminCr, avgCpl, totalSpend };
  }, [funnelQuery.data]);

  // Chart data
  const chartData = useMemo(() => {
    if (!seriesQuery.data) return [];
    const dayMap = new Map<string, Record<string, any>>();
    for (const point of seriesQuery.data) {
      if (!dayMap.has(point.day)) dayMap.set(point.day, { day: point.day });
      const entry = dayMap.get(point.day)!;
      const ch = point.channel;
      const cr = point.visitors > 0 ? (point.leads / point.visitors) * 100 : 0;
      entry[`cr_${ch}`] = parseFloat(cr.toFixed(1));
      entry[`leads_${ch}`] = point.leads;
    }
    return Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [seriesQuery.data]);

  if (funnelQuery.isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      {kpis && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <KpiTile icon={<Eye className="h-4 w-4" />} label="Besucher" value={kpis.totalVisitors.toLocaleString("de-DE")} />
          <KpiTile icon={<Users className="h-4 w-4" />} label="Leads" value={kpis.totalLeads.toLocaleString("de-DE")} accent />
          <KpiTile icon={<Calendar className="h-4 w-4" />} label="Termine" value={kpis.totalAppointments.toLocaleString("de-DE")} />
          <KpiTile icon={<TrendingUp className="h-4 w-4" />} label="LP-CR" value={`${kpis.avgCr.toFixed(1)}%`} />
          <KpiTile icon={<TrendingUp className="h-4 w-4" />} label="Termin-CR" value={`${kpis.avgTerminCr.toFixed(1)}%`} />
          <KpiTile icon={<DollarSign className="h-4 w-4" />} label="CPL" value={kpis.avgCpl > 0 ? `${kpis.avgCpl.toFixed(2)} €` : "–"} />
          <KpiTile icon={<DollarSign className="h-4 w-4" />} label="Ad-Spend" value={kpis.totalSpend > 0 ? `${(kpis.totalSpend / 100).toFixed(0)} €` : "–"} />
        </div>
      )}

      {/* Per-Channel Funnel Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {funnelQuery.data?.map((ch) => <ChannelFunnelCard key={ch.channel} data={ch} />)}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="LP-Conversion-Rate (%)" subtitle="Leads / Besucher pro Tag">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#9fb2c7", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }} labelStyle={{ color: "#f4f1e8" }} />
                <Legend />
                {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
                  <Line key={ch} type="monotone" dataKey={`cr_${ch}`} name={CHANNEL_LABEL[ch]} stroke={CHANNEL_COLORS[ch]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Leads pro Tag" subtitle="Absolute Leads pro Kanal">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#9fb2c7", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }} labelStyle={{ color: "#f4f1e8" }} />
                <Legend />
                {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
                  <Bar key={ch} dataKey={`leads_${ch}`} name={CHANNEL_LABEL[ch]} fill={CHANNEL_COLORS[ch]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function KpiTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-[10px] uppercase tracking-wide">{label}</span></div>
      <div className={`mt-1 font-display text-xl font-extrabold ${accent ? "text-gold" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FUNNEL TAB — Per-Channel Funnel + Charts + UTM Pivot
   ═══════════════════════════════════════════════════════════════════════════════ */
function FunnelTab({ period }: { period: Period }) {
  const funnelQuery = trpc.admin.funnelStats.useQuery({ period });
  const utmPivotQuery = trpc.admin.utmPivot.useQuery({ period });
  const days = period === "day" ? 7 : period === "week" ? 14 : 30;
  const seriesQuery = trpc.admin.channelSeries.useQuery({ days });

  const chartData = useMemo(() => {
    if (!seriesQuery.data) return [];
    const dayMap = new Map<string, Record<string, any>>();
    for (const point of seriesQuery.data) {
      if (!dayMap.has(point.day)) dayMap.set(point.day, { day: point.day });
      const entry = dayMap.get(point.day)!;
      const ch = point.channel;
      const cr = point.visitors > 0 ? (point.leads / point.visitors) * 100 : 0;
      entry[`cr_${ch}`] = parseFloat(cr.toFixed(1));
      const tr = point.leads > 0 ? (point.appointments / point.leads) * 100 : 0;
      entry[`tr_${ch}`] = parseFloat(tr.toFixed(1));
      const cpl = point.leads > 0 ? point.adSpendCents / point.leads / 100 : 0;
      entry[`cpl_${ch}`] = parseFloat(cpl.toFixed(2));
    }
    return Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [seriesQuery.data]);

  return (
    <div className="space-y-6">
      {/* Per-Channel Funnel Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {funnelQuery.isLoading ? (
          <div className="col-span-3 flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
        ) : (
          funnelQuery.data?.map((ch) => <ChannelFunnelCard key={ch.channel} data={ch} />)
        )}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="space-y-6">
          <ChartCard title="LP-Conversion-Rate (%)" subtitle="Leads / Besucher pro Tag">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#9fb2c7", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }} labelStyle={{ color: "#f4f1e8" }} />
                <Legend />
                {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
                  <Line key={ch} type="monotone" dataKey={`cr_${ch}`} name={CHANNEL_LABEL[ch]} stroke={CHANNEL_COLORS[ch]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Termin-Rate (%)" subtitle="Termine / Leads pro Tag">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#9fb2c7", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }} labelStyle={{ color: "#f4f1e8" }} />
                <Legend />
                {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
                  <Line key={ch} type="monotone" dataKey={`tr_${ch}`} name={CHANNEL_LABEL[ch]} stroke={CHANNEL_COLORS[ch]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="CPL (€)" subtitle="Cost per Lead pro Tag">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#9fb2c7", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} unit="€" />
                <Tooltip contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }} labelStyle={{ color: "#f4f1e8" }} />
                <Legend />
                {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
                  <Line key={ch} type="monotone" dataKey={`cpl_${ch}`} name={CHANNEL_LABEL[ch]} stroke={CHANNEL_COLORS[ch]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* UTM Pivot Table */}
      {utmPivotQuery.data && utmPivotQuery.data.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-gold" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">UTM-Analyse</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Medium</th>
                  <th className="px-4 py-3 font-semibold">Campaign</th>
                  <th className="px-4 py-3 font-semibold text-right">Leads</th>
                </tr>
              </thead>
              <tbody>
                {utmPivotQuery.data.map((row, i) => (
                  <tr key={i} className="border-b border-border/60 transition hover:bg-secondary/40">
                    <td className="px-4 py-3 text-foreground">{row.utmSource}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.utmMedium}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.utmCampaign}</td>
                    <td className="px-4 py-3 text-right font-bold text-gold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SUBMISSIONS TAB — Enhanced Lead List with Search, Filter, Pagination, CSV Export
   ═══════════════════════════════════════════════════════════════════════════════ */
function SubmissionsTab() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [crmFilter, setCrmFilter] = useState("");
  const [utmSourceFilter, setUtmSourceFilter] = useState("");
  const [utmMediumFilter, setUtmMediumFilter] = useState("");
  const [utmCampaignFilter, setUtmCampaignFilter] = useState("");
  const [page, setPage] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const limit = 25;

  // Column configuration with localStorage persistence
  const ALL_COLUMNS = [
    { id: "name", label: "Name", default: true },
    { id: "email", label: "E-Mail", default: true },
    { id: "phone", label: "Telefon", default: true },
    { id: "source", label: "Quelle", default: true },
    { id: "crmStatus", label: "CRM", default: true },
    { id: "utmSource", label: "UTM Source", default: true },
    { id: "utmMedium", label: "UTM Medium", default: false },
    { id: "utmCampaign", label: "UTM Campaign", default: false },
    { id: "utmContent", label: "UTM Content", default: false },
    { id: "utmTerm", label: "UTM Term", default: false },
    { id: "referrer", label: "Referrer", default: false },
    { id: "fbclid", label: "FBClid", default: false },
    { id: "pageUrl", label: "Seiten-URL", default: false },
    { id: "device", label: "Gerät", default: false },
    { id: "browser", label: "Browser", default: false },
    { id: "isDuplicate", label: "Duplikat", default: false },
    { id: "createdAt", label: "Datum", default: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("admin-lead-columns");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ALL_COLUMNS.filter(c => c.default).map(c => c.id);
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("admin-lead-column-order");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ALL_COLUMNS.map(c => c.id);
  });

  function saveColumnConfig(visible: string[], order: string[]) {
    setVisibleColumns(visible);
    setColumnOrder(order);
    localStorage.setItem("admin-lead-columns", JSON.stringify(visible));
    localStorage.setItem("admin-lead-column-order", JSON.stringify(order));
  }

  const sortedVisibleColumns = columnOrder.filter(id => visibleColumns.includes(id));

  const utils = trpc.useUtils();
  const utmValuesQuery = trpc.admin.utmValues.useQuery();

  const deleteOne = trpc.admin.deleteLead.useMutation({
    onSuccess: () => { utils.admin.leadsEnhanced.invalidate(); toast.success("Lead gelöscht."); setShowDeleteConfirm(null); },
    onError: () => toast.error("Fehler beim Löschen."),
  });
  const deleteBulk = trpc.admin.deleteLeadsBulk.useMutation({
    onSuccess: (data) => { utils.admin.leadsEnhanced.invalidate(); toast.success(`${data.deleted} Leads gelöscht.`); setSelectedIds(new Set()); setShowBulkDeleteConfirm(false); },
    onError: () => toast.error("Fehler beim Löschen."),
  });

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    if (!leadsQuery.data?.leads) return;
    const allIds = leadsQuery.data.leads.map(l => l.id);
    const allSelected = allIds.every(id => selectedIds.has(id));
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(allIds));
  }

  // Render cell value based on column id
  function renderCell(lead: any, colId: string) {
    switch (colId) {
      case "name": return <span className="font-medium text-foreground">{lead.name}</span>;
      case "email": return <span className="text-muted-foreground">{lead.email}</span>;
      case "phone": return <span className="text-muted-foreground">{lead.phone}</span>;
      case "source": return <SourceBadge source={lead.source} />;
      case "crmStatus": return <CrmBadge status={lead.crmStatus} />;
      case "utmSource": return <span className="text-xs text-muted-foreground">{lead.utmSource ?? "–"}</span>;
      case "utmMedium": return <span className="text-xs text-muted-foreground">{lead.utmMedium ?? "–"}</span>;
      case "utmCampaign": return <span className="text-xs text-muted-foreground">{lead.utmCampaign ?? "–"}</span>;
      case "utmContent": return <span className="text-xs text-muted-foreground">{lead.utmContent ?? "–"}</span>;
      case "utmTerm": return <span className="text-xs text-muted-foreground">{lead.utmTerm ?? "–"}</span>;
      case "referrer": return <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={lead.referrer ?? ""}>{lead.referrer ?? "–"}</span>;
      case "fbclid": return <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={lead.fbclid ?? ""}>{lead.fbclid ? "✓" : "–"}</span>;
      case "pageUrl": return <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={lead.pageUrl ?? ""}>{lead.pageUrl ?? "–"}</span>;
      case "device": return <span className="text-xs text-muted-foreground">{lead.device ?? "–"}</span>;
      case "browser": return <span className="text-xs text-muted-foreground">{lead.browser ?? "–"}</span>;
      case "isDuplicate": return lead.isDuplicate ? <span className="text-xs text-red-400 font-semibold">DOP</span> : <span className="text-xs text-green-400">–</span>;
      case "createdAt": return <span className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleString("de-DE")}</span>;
      default: return "–";
    }
  }

  const leadsQuery = trpc.admin.leadsEnhanced.useQuery({
    search: search || undefined,
    source: sourceFilter || undefined,
    crmStatus: crmFilter || undefined,
    utmSource: utmSourceFilter || undefined,
    utmMedium: utmMediumFilter || undefined,
    utmCampaign: utmCampaignFilter || undefined,
    limit,
    offset: page * limit,
  });

  const totalPages = Math.ceil((leadsQuery.data?.total ?? 0) / limit);

  function handleCsvExport() {
    if (!leadsQuery.data?.leads.length) return;
    const headers = ["Name", "E-Mail", "Telefon", "Quelle", "CRM-Status", "UTM Source", "UTM Medium", "UTM Campaign", "Referrer", "Erstellt"];
    const rows = leadsQuery.data.leads.map((l) => [
      l.name, l.email, l.phone, l.source, l.crmStatus,
      l.utmSource ?? "", l.utmMedium ?? "", l.utmCampaign ?? "",
      l.referrer ?? "", new Date(l.createdAt).toLocaleString("de-DE"),
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((v) => `"${v}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportiert.");
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={search} placeholder="Name, E-Mail oder Telefon suchen…"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-md border border-input bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button onClick={() => setShowBulkDeleteConfirm(true)} className="inline-flex items-center gap-1.5 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
              <X className="h-3.5 w-3.5" /> {selectedIds.size} löschen
            </button>
          )}
          <button onClick={() => setShowColumnConfig(!showColumnConfig)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition hover:border-gold/50">
            <Settings className="h-3.5 w-3.5" /> Spalten
          </button>
          <button onClick={handleCsvExport} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition hover:border-gold/50">
            <Download className="h-3.5 w-3.5" /> CSV Export
          </button>
        </div>
      </div>

      {/* Column Config Panel */}
      {showColumnConfig && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Spalten konfigurieren</span>
            <button onClick={() => setShowColumnConfig(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <p className="text-xs text-muted-foreground">Spalten ein-/ausblenden. Ziehe zum Umsortieren.</p>
          <div className="flex flex-wrap gap-2">
            {columnOrder.map((colId, idx) => {
              const col = ALL_COLUMNS.find(c => c.id === colId);
              if (!col) return null;
              const isVisible = visibleColumns.includes(colId);
              return (
                <button
                  key={colId}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("colIdx", String(idx))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIdx = parseInt(e.dataTransfer.getData("colIdx"));
                    const newOrder = [...columnOrder];
                    const [moved] = newOrder.splice(fromIdx, 1);
                    newOrder.splice(idx, 0, moved);
                    saveColumnConfig(visibleColumns, newOrder);
                  }}
                  onClick={() => {
                    const newVisible = isVisible
                      ? visibleColumns.filter(v => v !== colId)
                      : [...visibleColumns, colId];
                    saveColumnConfig(newVisible, columnOrder);
                  }}
                  className={`cursor-grab rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${isVisible ? "border-gold/50 bg-gold/10 text-gold" : "border-border bg-secondary text-muted-foreground"}`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterSelect label="Quelle" value={sourceFilter} onChange={(v) => { setSourceFilter(v); setPage(0); }} options={[
          { value: "", label: "Alle" },
          { value: "ki-report", label: "KI-Report" },
          { value: "exit-plan", label: "Exit-Plan" },
          { value: "traumwebseite", label: "Traumwebseite" },
          { value: "home", label: "Home" },
        ]} />
        <FilterSelect label="CRM" value={crmFilter} onChange={(v) => { setCrmFilter(v); setPage(0); }} options={[
          { value: "", label: "Alle" },
          ...CRM_STATUSES.map((s) => ({ value: s.value, label: s.label })),
        ]} />
        {utmValuesQuery.data && (
          <>
            <FilterSelect label="UTM Source" value={utmSourceFilter} onChange={(v) => { setUtmSourceFilter(v); setPage(0); }} options={[{ value: "", label: "Alle" }, ...utmValuesQuery.data.sources.map((s) => ({ value: s, label: s }))]} />
            <FilterSelect label="UTM Medium" value={utmMediumFilter} onChange={(v) => { setUtmMediumFilter(v); setPage(0); }} options={[{ value: "", label: "Alle" }, ...utmValuesQuery.data.mediums.map((s) => ({ value: s, label: s }))]} />
            <FilterSelect label="UTM Campaign" value={utmCampaignFilter} onChange={(v) => { setUtmCampaignFilter(v); setPage(0); }} options={[{ value: "", label: "Alle" }, ...utmValuesQuery.data.campaigns.map((s) => ({ value: s, label: s }))]} />
          </>
        )}
      </div>

      {/* Table */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Users className="h-4 w-4 text-gold" />
          <span className="text-sm font-bold uppercase tracking-wide text-foreground">Leads</span>
          <span className="ml-auto text-xs text-muted-foreground">{leadsQuery.data?.total ?? 0} Einträge</span>
        </div>
        <div className="overflow-x-auto">
          {leadsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (leadsQuery.data?.leads.length ?? 0) === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Keine Leads gefunden.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-3 w-8">
                    <input type="checkbox" checked={leadsQuery.data?.leads.length ? leadsQuery.data.leads.every(l => selectedIds.has(l.id)) : false} onChange={toggleSelectAll} className="rounded border-border" />
                  </th>
                  {sortedVisibleColumns.map(colId => {
                    const col = ALL_COLUMNS.find(c => c.id === colId);
                    return <th key={colId} className="px-4 py-3 font-semibold">{col?.label}</th>;
                  })}
                  <th className="px-2 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {leadsQuery.data?.leads.map((l) => (
                  <tr key={l.id} className={`border-b border-border/60 transition hover:bg-secondary/40 ${l.isDuplicate ? "opacity-50" : ""}`}>
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(l.id)} onChange={() => toggleSelect(l.id)} className="rounded border-border" />
                    </td>
                    {sortedVisibleColumns.map(colId => (
                      <td key={colId} className="px-4 py-3 cursor-pointer" onClick={() => setSelectedLeadId(l.id)}>{renderCell(l, colId)}</td>
                    ))}
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      {showDeleteConfirm === l.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteOne.mutate({ id: l.id })} className="rounded bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600">Ja</button>
                          <button onClick={() => setShowDeleteConfirm(null)} className="rounded bg-secondary px-2 py-1 text-[10px] font-bold text-foreground hover:bg-secondary/80">Nein</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowDeleteConfirm(l.id)} className="rounded p-1 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400" title="Löschen">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-gold/50 disabled:opacity-40">
              <ChevronLeft className="h-3.5 w-3.5" /> Zurück
            </button>
            <span className="text-xs text-muted-foreground">Seite {page + 1} von {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-gold/50 disabled:opacity-40">
              Weiter <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Bulk Delete Confirmation */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-2">Leads löschen?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Möchtest du wirklich <span className="font-bold text-red-400">{selectedIds.size}</span> Lead{selectedIds.size > 1 ? "s" : ""} unwiderruflich löschen?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowBulkDeleteConfirm(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">Abbrechen</button>
              <button onClick={() => deleteBulk.mutate({ ids: Array.from(selectedIds) })} disabled={deleteBulk.isPending} className="rounded-md bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50">
                {deleteBulk.isPending ? "Lösche..." : "Endgültig löschen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLeadId !== null && (
        <LeadDetailModal leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LEAD DETAIL MODAL
   ═══════════════════════════════════════════════════════════════════════════════ */
function LeadDetailModal({ leadId, onClose }: { leadId: number; onClose: () => void }) {
  const utils = trpc.useUtils();
  const leadQuery = trpc.admin.leadDetail.useQuery({ id: leadId });
  const updateCrm = trpc.admin.updateCrmStatus.useMutation();
  const updateNotes = trpc.admin.updateNotes.useMutation();
  const [notes, setNotes] = useState<string | null>(null);

  const lead = leadQuery.data;

  function handleStatusChange(newStatus: string) {
    updateCrm.mutate({ id: leadId, crmStatus: newStatus }, {
      onSuccess: () => { toast.success("Status aktualisiert."); utils.admin.leadDetail.invalidate(); utils.admin.leadsEnhanced.invalidate(); },
    });
  }

  function handleSaveNotes() {
    if (notes === null) return;
    updateNotes.mutate({ id: leadId, notes }, {
      onSuccess: () => { toast.success("Notizen gespeichert."); utils.admin.leadDetail.invalidate(); },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        {leadQuery.isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
        ) : !lead ? (
          <div className="py-12 text-center text-muted-foreground">Lead nicht gefunden.</div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">{lead.name}</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                <SourceBadge source={lead.source} />
                <CrmBadge status={lead.crmStatus} />
                <WebhookBadge status={lead.webhookStatus} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow icon={<Mail className="h-3.5 w-3.5" />} label="E-Mail" value={lead.email} href={`mailto:${lead.email}`} />
              <DetailRow icon={<Phone className="h-3.5 w-3.5" />} label="Telefon" value={lead.phone} href={`tel:${lead.phone}`} />
              <DetailRow icon={<Clock className="h-3.5 w-3.5" />} label="Erstellt" value={new Date(lead.createdAt).toLocaleString("de-DE")} />
              {lead.timeOnPageSeconds != null && (
                <DetailRow icon={<Clock className="h-3.5 w-3.5" />} label="Verweildauer" value={`${lead.timeOnPageSeconds}s`} />
              )}
            </div>

            {/* Tracking */}
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Tracking-Details</h3>
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <DetailRow icon={<Globe className="h-3.5 w-3.5" />} label="IP" value={lead.ipAddress ?? "–"} />
                <DetailRow icon={<Monitor className="h-3.5 w-3.5" />} label="User-Agent" value={lead.userAgent ? (lead.userAgent.length > 60 ? lead.userAgent.slice(0, 60) + "…" : lead.userAgent) : "–"} />
                <DetailRow icon={<ExternalLink className="h-3.5 w-3.5" />} label="Referrer" value={lead.referrer ?? "–"} />
              </div>
            </div>

            {/* UTM */}
            {(lead.utmSource || lead.utmMedium || lead.utmCampaign || lead.utmTerm || lead.utmContent) && (
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">UTM-Parameter</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.utmSource && <UtmChip label="source" value={lead.utmSource} />}
                  {lead.utmMedium && <UtmChip label="medium" value={lead.utmMedium} />}
                  {lead.utmCampaign && <UtmChip label="campaign" value={lead.utmCampaign} />}
                  {lead.utmTerm && <UtmChip label="term" value={lead.utmTerm} />}
                  {lead.utmContent && <UtmChip label="content" value={lead.utmContent} />}
                </div>
              </div>
            )}

            {/* CRM Status */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">CRM-Status</label>
              <select
                value={lead.crmStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-md border border-input bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
              >
                {CRM_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Notizen</label>
              <textarea
                value={notes ?? lead.notes ?? ""}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
                placeholder="Notizen zum Lead…"
              />
              <button onClick={handleSaveNotes} disabled={updateNotes.isPending || notes === null} className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-4 py-2 text-xs font-bold text-navy transition hover:brightness-105 disabled:opacity-60">
                {updateNotes.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Notizen speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        {href ? (
          <a href={href} className="text-sm text-foreground underline decoration-gold/40 hover:decoration-gold">{value}</a>
        ) : (
          <div className="text-sm text-foreground break-all">{value}</div>
        )}
      </div>
    </div>
  );
}

function UtmChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px]">
      <span className="font-semibold text-gold">{label}:</span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CRM TAB — Kanban Board with Drag & Drop
   ═══════════════════════════════════════════════════════════════════════════════ */
function CrmTab() {
  const utils = trpc.useUtils();
  const leadsQuery = trpc.admin.leadsEnhanced.useQuery({ limit: 200 });
  const updateCrm = trpc.admin.updateCrmStatus.useMutation();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const leadsByStatus = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const s of CRM_STATUSES) map[s.value] = [];
    for (const lead of leadsQuery.data?.leads ?? []) {
      const status = lead.crmStatus || "new";
      if (!map[status]) map[status] = [];
      map[status].push(lead);
    }
    return map;
  }, [leadsQuery.data]);

  function handleDragStart(e: DragEvent<HTMLDivElement>, id: number) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverStatus(null);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, status: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, newStatus: string) {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("text/plain"));
    if (!isNaN(id)) {
      updateCrm.mutate({ id, crmStatus: newStatus }, {
        onSuccess: () => { utils.admin.leadsEnhanced.invalidate(); toast.success("Status aktualisiert."); },
      });
    }
    setDraggedId(null);
    setDragOverStatus(null);
  }

  if (leadsQuery.isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Kanban className="h-4 w-4 text-gold" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">CRM-Board</h2>
        <span className="ml-auto text-xs text-muted-foreground">{leadsQuery.data?.total ?? 0} Leads</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {CRM_STATUSES.map((status) => (
          <div
            key={status.value}
            className={`min-w-[220px] flex-shrink-0 rounded-xl border bg-card transition ${dragOverStatus === status.value ? "border-gold ring-2 ring-gold/30" : "border-border"}`}
            onDragOver={(e) => handleDragOver(e, status.value)}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, status.value)}
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <div className={`h-2.5 w-2.5 rounded-full ${status.color}`} />
              <span className="text-xs font-bold uppercase tracking-wide text-foreground">{status.label}</span>
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {leadsByStatus[status.value]?.length ?? 0}
              </span>
            </div>

            {/* Cards */}
            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-2">
              {leadsByStatus[status.value]?.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`cursor-grab rounded-lg border border-border bg-secondary/50 p-2.5 transition hover:shadow-md active:cursor-grabbing ${draggedId === lead.id ? "scale-95 opacity-50" : ""}`}
                >
                  <div className="text-xs font-medium text-foreground">{lead.name}</div>
                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{lead.email}</div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    <SourceBadge source={lead.source} small />
                  </div>
                  {lead.notes && (
                    <div className="mt-1.5 flex items-start gap-1 border-t border-border/60 pt-1.5">
                      <StickyNote className="mt-0.5 h-3 w-3 text-yellow-500" />
                      <p className="line-clamp-2 text-[10px] italic text-muted-foreground">{lead.notes}</p>
                    </div>
                  )}
                </div>
              ))}
              {(leadsByStatus[status.value]?.length ?? 0) === 0 && (
                <div className="py-6 text-center text-[10px] text-muted-foreground">Keine Leads</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedLeadId !== null && (
        <LeadDetailModal leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AD COSTS TAB — Manual Entry + CSV Upload + History
   ═══════════════════════════════════════════════════════════════════════════════ */
function AdCostsTab() {
  const utils = trpc.useUtils();
  const [channel, setChannel] = useState<"ki-report" | "exit-plan" | "traumwebseite">("ki-report");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const setAdSpend = trpc.admin.setAdSpend.useMutation();
  const bulkAdSpend = trpc.admin.bulkAdSpend.useMutation();
  const listAdSpendQuery = trpc.admin.listAdSpend.useQuery();

  function handleSave() {
    const cents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (isNaN(cents) || cents < 0) { toast.error("Bitte einen gültigen Betrag eingeben."); return; }
    setAdSpend.mutate(
      { channel, date, amountCents: cents, campaignName: campaignName || undefined },
      {
        onSuccess: () => {
          toast.success("Ad-Spend gespeichert.");
          utils.admin.invalidate();
          setAmount(""); setCampaignName("");
        },
        onError: () => toast.error("Speichern fehlgeschlagen."),
      },
    );
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) { toast.error("CSV muss mindestens eine Datenzeile haben."); return; }

      const rows: Array<{ channel: string; date: string; amountCents: number; campaignName?: string }> = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[;,]/).map((c) => c.replace(/"/g, "").trim());
        if (cols.length < 3) continue;
        const ch = cols[0].toLowerCase();
        const dt = cols[1];
        const amt = Math.round(parseFloat(cols[2].replace(",", ".")) * 100);
        if (!ch || !dt || isNaN(amt)) continue;
        rows.push({ channel: ch, date: dt, amountCents: amt, campaignName: cols[3] || undefined });
      }

      if (rows.length === 0) { toast.error("Keine gültigen Zeilen gefunden."); return; }

      bulkAdSpend.mutate({ rows }, {
        onSuccess: (res) => {
          toast.success(`${res.imported} Einträge importiert.`);
          utils.admin.invalidate();
        },
        onError: () => toast.error("Import fehlgeschlagen."),
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Manual Entry */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Ad-Spend eintragen</h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Trage hier die täglichen Werbeausgaben pro Kanal ein, um den CPL zu berechnen. Später wird dies automatisch über die Meta-API befüllt.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Kanal</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value as any)} className="rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none">
              {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => <option key={ch} value={ch}>{CHANNEL_LABEL[ch]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Datum</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Betrag (€)</label>
            <input type="text" value={amount} placeholder="z.B. 45,50" onChange={(e) => setAmount(e.target.value)} className="w-28 rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Kampagne (optional)</label>
            <input type="text" value={campaignName} placeholder="z.B. FB_KI_Report" onChange={(e) => setCampaignName(e.target.value)} className="w-40 rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none" />
          </div>
          <button onClick={handleSave} disabled={setAdSpend.isPending} className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-5 py-2.5 text-xs font-bold text-navy transition hover:brightness-105 disabled:opacity-60">
            {setAdSpend.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Speichern
          </button>
        </div>
      </section>

      {/* CSV Upload */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">CSV-Import</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Format: Kanal;Datum;Betrag(€);Kampagne (optional). Erste Zeile = Header.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-secondary px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-gold/50">
          <Download className="h-3.5 w-3.5" /> CSV hochladen
          <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
        </label>
        {bulkAdSpend.isPending && <span className="ml-3 text-xs text-muted-foreground"><Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Importiere…</span>}
      </section>

      {/* History */}
      {listAdSpendQuery.data && listAdSpendQuery.data.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Ad-Spend Verlauf</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Datum</th>
                  <th className="px-4 py-3 font-semibold">Kanal</th>
                  <th className="px-4 py-3 font-semibold">Kampagne</th>
                  <th className="px-4 py-3 font-semibold text-right">Betrag</th>
                </tr>
              </thead>
              <tbody>
                {listAdSpendQuery.data.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b border-border/60 transition hover:bg-secondary/40">
                    <td className="px-4 py-3 text-foreground">{row.date}</td>
                    <td className="px-4 py-3"><SourceBadge source={row.channel} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{row.campaignName ?? "–"}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">{(row.amountCents / 100).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SETTINGS TAB — Per-Channel Webhooks
   ═══════════════════════════════════════════════════════════════════════════════ */
function SettingsTab() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Webhook className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Webhook-Weiterleitung pro Kanal</h2>
        </div>
        <p className="mb-5 text-xs text-muted-foreground">
          Jeder neue Lead wird per POST (JSON) an die jeweilige Kanal-URL gesendet. Felder: id, name, email, phone, source, utmSource, utmMedium, utmCampaign, createdAt.
        </p>
        <div className="space-y-4">
          {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
            <ChannelWebhookRow key={ch} channel={ch} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ChannelWebhookRow({ channel }: { channel: "ki-report" | "exit-plan" | "traumwebseite" }) {
  const utils = trpc.useUtils();
  const webhookQuery = trpc.admin.getWebhook.useQuery({ channel });
  const setWebhook = trpc.admin.setWebhook.useMutation();
  const testWebhook = trpc.admin.testWebhook.useMutation();
  const [url, setUrl] = useState<string | null>(null);

  const value = url ?? webhookQuery.data?.url ?? "";
  const color = CHANNEL_COLORS[channel];

  function handleSave() {
    setWebhook.mutate({ channel, url: value }, {
      onSuccess: () => { toast.success(`Webhook für ${CHANNEL_LABEL[channel]} gespeichert.`); utils.admin.getWebhook.invalidate(); utils.admin.getWebhooks.invalidate(); },
      onError: () => toast.error("Speichern fehlgeschlagen."),
    });
  }

  function handleTest() {
    testWebhook.mutate({ channel }, {
      onSuccess: (res) => {
        if (res.status === "sent") toast.success("Test-Webhook erfolgreich gesendet.");
        else if (res.status === "none") toast.error("Keine Webhook-URL gespeichert.");
        else toast.error("Test-Webhook fehlgeschlagen (Zielserver-Fehler).");
      },
      onError: () => toast.error("Test fehlgeschlagen."),
    });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">{CHANNEL_LABEL[channel]}</span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="url" value={value} placeholder="https://hook.eu.make.com/…" onChange={(e) => setUrl(e.target.value)} className="flex-1 rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40" />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={setWebhook.isPending} className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-4 py-2.5 text-xs font-bold text-navy transition hover:brightness-105 disabled:opacity-60">
            {setWebhook.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Speichern
          </button>
          <button onClick={handleTest} disabled={testWebhook.isPending} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2.5 text-xs font-semibold text-foreground transition hover:border-gold/50 disabled:opacity-60">
            {testWebhook.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Test
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */
interface ChannelStats {
  channel: string; visitors: number; leads: number; appointments: number;
  lpCr: number; terminCr: number; adSpendCents: number; cpl: number;
}

function ChannelFunnelCard({ data }: { data: ChannelStats }) {
  const color = CHANNEL_COLORS[data.channel] ?? "#c9a227";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">{CHANNEL_LABEL[data.channel] ?? data.channel}</h3>
      </div>
      <div className="flex items-center justify-between gap-1">
        <FunnelStep icon={<Eye className="h-4 w-4" />} value={data.visitors} label="Besucher" />
        <FunnelArrow value={`${(data.lpCr * 100).toFixed(1)}%`} label="LP-CR" />
        <FunnelStep icon={<Users className="h-4 w-4" />} value={data.leads} label="Leads" />
        <FunnelArrow value={`${(data.terminCr * 100).toFixed(1)}%`} label="Termin-CR" />
        <FunnelStep icon={<Calendar className="h-4 w-4" />} value={data.appointments} label="Termine" />
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
        <DollarSign className="h-3.5 w-3.5 text-gold" />
        <span className="text-xs text-muted-foreground">CPL:</span>
        <span className="text-sm font-bold text-foreground">{data.cpl > 0 ? `${(data.cpl / 100).toFixed(2)} €` : "–"}</span>
        {data.adSpendCents > 0 && <span className="ml-auto text-[11px] text-muted-foreground">Ausgaben: {(data.adSpendCents / 100).toFixed(2)} €</span>}
      </div>
    </div>
  );
}

function FunnelStep({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 text-gold">{icon}</div>
      <div className="font-display text-lg font-extrabold text-foreground">{value.toLocaleString("de-DE")}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function FunnelArrow({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
      <div className="text-[11px] font-bold text-gold">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-1.5">
      <Filter className="h-3 w-3 text-muted-foreground" />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-input bg-white px-2 py-1.5 text-xs text-neutral-900 outline-none">
        {options.map((o) => <option key={o.value} value={o.value}>{label}: {o.label}</option>)}
      </select>
    </div>
  );
}

function WebhookBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    sent: { label: "gesendet", cls: "bg-emerald-500/15 text-emerald-400" },
    failed: { label: "fehlgeschlagen", cls: "bg-red-500/15 text-red-400" },
    pending: { label: "ausstehend", cls: "bg-amber-500/15 text-amber-400" },
    none: { label: "kein Webhook", cls: "bg-muted text-muted-foreground" },
  };
  const m = map[status] ?? map.none;
  return <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.cls}`}>{m.label}</span>;
}

function SourceBadge({ source, small }: { source: string; small?: boolean }) {
  const color = CHANNEL_COLORS[source] ?? "#9fb2c7";
  const label = CHANNEL_LABEL[source] ?? source;
  return (
    <span className={`inline-block rounded-full font-semibold ${small ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px]"}`} style={{ backgroundColor: `${color}20`, color }}>
      {label}
    </span>
  );
}

function CrmBadge({ status }: { status: string }) {
  const s = CRM_STATUSES.find((s) => s.value === status) ?? CRM_STATUSES[0];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.color}/15`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
      <span style={{ color: "inherit" }}>{s.label}</span>
    </span>
  );
}
