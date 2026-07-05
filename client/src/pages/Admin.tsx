// ADMIN-DASHBOARD (/admin) — Per-Channel Funnel-Statistiken, Charts, Webhooks.
import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Logo, GoldButton } from "@/components/funnel";
import { ASSETS } from "@/lib/site";
import {
  Lock,
  LogOut,
  Users,
  Eye,
  Webhook,
  Send,
  Loader2,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Period = "day" | "week" | "month";
type Tab = "funnel" | "charts" | "settings";

const PERIOD_LABEL: Record<Period, string> = {
  day: "Heute",
  week: "Diese Woche",
  month: "Dieser Monat",
};

const CHANNEL_LABEL: Record<string, string> = {
  "ki-report": "KI-Report",
  "exit-plan": "Exit-Plan",
  "traumwebseite": "Traumwebseite",
};

const CHANNEL_COLORS: Record<string, string> = {
  "ki-report": "#c9a227",
  "exit-plan": "#22c55e",
  "traumwebseite": "#3b82f6",
};

export default function Admin() {
  const utils = trpc.useUtils();
  const meQuery = trpc.admin.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

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
        onSuccess: () => {
          toast.success("Willkommen zurück.");
          onLoggedIn();
        },
        onError: (err) => {
          toast.error(err.message || "Login fehlgeschlagen.");
        },
      },
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5"
      style={{
        backgroundImage: `linear-gradient(rgba(6,15,28,0.9), rgba(6,15,28,0.96)), url(${ASSETS.heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Logo className="mb-8" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur"
      >
        <div className="mb-2 flex items-center justify-center gap-2 text-gold">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">
            Admin-Login
          </span>
        </div>
        <input
          type="email"
          value={email}
          placeholder="E-Mail"
          autoComplete="username"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        <input
          type="password"
          value={password}
          placeholder="Passwort"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        <GoldButton type="submit" glow className="w-full" disabled={login.isPending}>
          {login.isPending ? "Anmelden…" : "Anmelden"}
        </GoldButton>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════════ */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [period, setPeriod] = useState<Period>("week");
  const [tab, setTab] = useState<Tab>("funnel");
  const utils = trpc.useUtils();

  const logout = trpc.admin.logout.useMutation();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Abgemeldet.");
        onLogout();
      },
    });
  }

  return (
    <div className="min-h-screen bg-navy-deep text-foreground">
      {/* Topbar */}
      <header className="border-b border-border bg-card/40 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8" />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.18em] text-gold sm:inline">
              Admin-Dashboard
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition hover:border-gold/50"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </header>

      <main className="container space-y-6 py-6">
        {/* Tab-Navigation + Zeitraum */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {([
              { id: "funnel" as Tab, label: "Funnel", icon: <BarChart3 className="h-3.5 w-3.5" /> },
              { id: "charts" as Tab, label: "Charts", icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { id: "settings" as Tab, label: "Einstellungen", icon: <Settings className="h-3.5 w-3.5" /> },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  tab === t.id
                    ? "bg-gradient-to-b from-[#e3c75a] to-[#c9a227] text-navy"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Zeitraum + Refresh */}
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              {(["day", "week", "month"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    period === p
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                utils.admin.funnelStats.invalidate();
                utils.admin.channelSeries.invalidate();
                utils.admin.leads.invalidate();
                utils.admin.getWebhooks.invalidate();
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {tab === "funnel" && <FunnelTab period={period} />}
        {tab === "charts" && <ChartsTab period={period} />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FUNNEL TAB — Per-Channel Funnel-Visualisierung
   ═══════════════════════════════════════════════════════════════════════════════ */
function FunnelTab({ period }: { period: Period }) {
  const funnelQuery = trpc.admin.funnelStats.useQuery({ period });
  const leadsQuery = trpc.admin.leads.useQuery();

  return (
    <div className="space-y-6">
      {/* Per-Channel Funnel Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {funnelQuery.isLoading ? (
          <div className="col-span-3 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : (
          funnelQuery.data?.map((ch) => (
            <ChannelFunnelCard key={ch.channel} data={ch} />
          ))
        )}
      </div>

      {/* Leads-Tabelle */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Users className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Leads
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {leadsQuery.data?.length ?? 0} Einträge
          </span>
        </div>
        <div className="overflow-x-auto">
          {leadsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (leadsQuery.data?.length ?? 0) === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Noch keine Leads erfasst.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">E-Mail</th>
                  <th className="px-5 py-3 font-semibold">Telefon</th>
                  <th className="px-5 py-3 font-semibold">Quelle</th>
                  <th className="px-5 py-3 font-semibold">Webhook</th>
                  <th className="px-5 py-3 font-semibold">Datum</th>
                </tr>
              </thead>
              <tbody>
                {leadsQuery.data?.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-border/60 transition hover:bg-secondary/40"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{l.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.phone}</td>
                    <td className="px-5 py-3">
                      <SourceBadge source={l.source} />
                    </td>
                    <td className="px-5 py-3">
                      <WebhookBadge status={l.webhookStatus} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CHANNEL FUNNEL CARD
   ═══════════════════════════════════════════════════════════════════════════════ */
interface ChannelStats {
  channel: string;
  visitors: number;
  leads: number;
  appointments: number;
  lpCr: number;
  terminCr: number;
  adSpendCents: number;
  cpl: number;
}

function ChannelFunnelCard({ data }: { data: ChannelStats }) {
  const color = CHANNEL_COLORS[data.channel] ?? "#c9a227";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          {CHANNEL_LABEL[data.channel] ?? data.channel}
        </h3>
      </div>

      {/* Funnel Flow */}
      <div className="flex items-center justify-between gap-1">
        {/* Besucher */}
        <FunnelStep
          icon={<Eye className="h-4 w-4" />}
          value={data.visitors}
          label="Besucher"
        />

        {/* Arrow + LP-CR */}
        <FunnelArrow value={`${(data.lpCr * 100).toFixed(1)}%`} label="LP-CR" />

        {/* Leads */}
        <FunnelStep
          icon={<Users className="h-4 w-4" />}
          value={data.leads}
          label="Leads"
        />

        {/* Arrow + Termin-CR */}
        <FunnelArrow value={`${(data.terminCr * 100).toFixed(1)}%`} label="Termin-CR" />

        {/* Termine */}
        <FunnelStep
          icon={<Calendar className="h-4 w-4" />}
          value={data.appointments}
          label="Termine"
        />
      </div>

      {/* CPL */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
        <DollarSign className="h-3.5 w-3.5 text-gold" />
        <span className="text-xs text-muted-foreground">CPL:</span>
        <span className="text-sm font-bold text-foreground">
          {data.cpl > 0 ? `${(data.cpl / 100).toFixed(2)} €` : "–"}
        </span>
        {data.adSpendCents > 0 && (
          <span className="ml-auto text-[11px] text-muted-foreground">
            Ausgaben: {(data.adSpendCents / 100).toFixed(2)} €
          </span>
        )}
      </div>
    </div>
  );
}

function FunnelStep({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 text-gold">{icon}</div>
      <div className="font-display text-lg font-extrabold text-foreground">
        {value.toLocaleString("de-DE")}
      </div>
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

/* ═══════════════════════════════════════════════════════════════════════════════
   CHARTS TAB
   ═══════════════════════════════════════════════════════════════════════════════ */
function ChartsTab({ period }: { period: Period }) {
  const days = period === "day" ? 7 : period === "week" ? 14 : 30;
  const seriesQuery = trpc.admin.channelSeries.useQuery({ days });

  // Daten für Charts aufbereiten
  const chartData = useMemo(() => {
    if (!seriesQuery.data) return { cr: [], terminRate: [], cpl: [] };

    // Gruppiere nach Tag
    const dayMap = new Map<string, Record<string, any>>();

    for (const point of seriesQuery.data) {
      if (!dayMap.has(point.day)) {
        dayMap.set(point.day, { day: point.day });
      }
      const entry = dayMap.get(point.day)!;
      const ch = point.channel;

      // CR = leads / visitors
      const cr = point.visitors > 0 ? (point.leads / point.visitors) * 100 : 0;
      entry[`cr_${ch}`] = parseFloat(cr.toFixed(1));

      // Termin-Rate = appointments / leads
      const tr = point.leads > 0 ? (point.appointments / point.leads) * 100 : 0;
      entry[`tr_${ch}`] = parseFloat(tr.toFixed(1));

      // CPL = adSpend / leads (in EUR)
      const cpl = point.leads > 0 ? point.adSpendCents / point.leads / 100 : 0;
      entry[`cpl_${ch}`] = parseFloat(cpl.toFixed(2));

      // Absolute Werte
      entry[`visitors_${ch}`] = point.visitors;
      entry[`leads_${ch}`] = point.leads;
      entry[`appts_${ch}`] = point.appointments;
    }

    const sorted = Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day));
    return { data: sorted };
  }, [seriesQuery.data]);

  if (seriesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const data = chartData.data ?? [];

  return (
    <div className="space-y-6">
      {/* LP-Conversion-Rate */}
      <ChartCard title="LP-Conversion-Rate (%)" subtitle="Leads / Besucher pro Tag">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#9fb2c7", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }}
              labelStyle={{ color: "#f4f1e8" }}
            />
            <Legend />
            {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
              <Line
                key={ch}
                type="monotone"
                dataKey={`cr_${ch}`}
                name={CHANNEL_LABEL[ch]}
                stroke={CHANNEL_COLORS[ch]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Termin-Rate */}
      <ChartCard title="Termin-Rate (%)" subtitle="Termine / Leads pro Tag">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#9fb2c7", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }}
              labelStyle={{ color: "#f4f1e8" }}
            />
            <Legend />
            {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
              <Line
                key={ch}
                type="monotone"
                dataKey={`tr_${ch}`}
                name={CHANNEL_LABEL[ch]}
                stroke={CHANNEL_COLORS[ch]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* CPL */}
      <ChartCard title="CPL (€)" subtitle="Cost per Lead pro Tag">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#9fb2c7", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fill: "#9fb2c7", fontSize: 11 }} unit="€" />
            <Tooltip
              contentStyle={{ backgroundColor: "#0e2138", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 8 }}
              labelStyle={{ color: "#f4f1e8" }}
            />
            <Legend />
            {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
              <Line
                key={ch}
                type="monotone"
                dataKey={`cpl_${ch}`}
                name={CHANNEL_LABEL[ch]}
                stroke={CHANNEL_COLORS[ch]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
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

/* ═══════════════════════════════════════════════════════════════════════════════
   SETTINGS TAB — Per-Channel Webhooks
   ═══════════════════════════════════════════════════════════════════════════════ */
function SettingsTab() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Webhook className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Webhook-Weiterleitung pro Kanal
          </h2>
        </div>
        <p className="mb-5 text-xs text-muted-foreground">
          Jeder neue Lead wird per POST (JSON) an die jeweilige Kanal-URL gesendet.
          Felder: id, name, email, phone, source, createdAt.
        </p>
        <div className="space-y-4">
          {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
            <ChannelWebhookRow key={ch} channel={ch} />
          ))}
        </div>
      </section>

      {/* Ad Spend Manual Entry */}
      <AdSpendSection />
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
    setWebhook.mutate(
      { channel, url: value },
      {
        onSuccess: () => {
          toast.success(`Webhook für ${CHANNEL_LABEL[channel]} gespeichert.`);
          utils.admin.getWebhook.invalidate();
          utils.admin.getWebhooks.invalidate();
        },
        onError: () => toast.error("Speichern fehlgeschlagen."),
      },
    );
  }

  function handleTest() {
    testWebhook.mutate(
      { channel },
      {
        onSuccess: (res) => {
          if (res.status === "sent") toast.success("Test-Webhook erfolgreich gesendet.");
          else if (res.status === "none") toast.error("Keine Webhook-URL gespeichert.");
          else toast.error("Test-Webhook fehlgeschlagen (Zielserver-Fehler).");
        },
        onError: () => toast.error("Test fehlgeschlagen."),
      },
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">
          {CHANNEL_LABEL[channel]}
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={value}
          placeholder="https://hook.eu.make.com/…"
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={setWebhook.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-4 py-2.5 text-xs font-bold text-navy transition hover:brightness-105 disabled:opacity-60"
          >
            {setWebhook.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Speichern
          </button>
          <button
            onClick={handleTest}
            disabled={testWebhook.isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2.5 text-xs font-semibold text-foreground transition hover:border-gold/50 disabled:opacity-60"
          >
            {testWebhook.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Test
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AD SPEND SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
function AdSpendSection() {
  const [channel, setChannel] = useState<"ki-report" | "exit-plan" | "traumwebseite">("ki-report");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const setAdSpend = trpc.admin.setAdSpend.useMutation();
  const utils = trpc.useUtils();

  function handleSave() {
    const cents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (isNaN(cents) || cents < 0) {
      toast.error("Bitte einen gültigen Betrag eingeben.");
      return;
    }
    setAdSpend.mutate(
      { channel, date, amountCents: cents },
      {
        onSuccess: () => {
          toast.success("Ad-Spend gespeichert.");
          utils.admin.funnelStats.invalidate();
          utils.admin.channelSeries.invalidate();
          setAmount("");
        },
        onError: () => toast.error("Speichern fehlgeschlagen."),
      },
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-gold" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Ad-Spend eintragen
        </h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Trage hier die täglichen Werbeausgaben pro Kanal ein, um den CPL zu berechnen.
        Später wird dies automatisch über die Meta-API befüllt.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Kanal</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as any)}
            className="rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none"
          >
            {(["ki-report", "exit-plan", "traumwebseite"] as const).map((ch) => (
              <option key={ch} value={ch}>{CHANNEL_LABEL[ch]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Betrag (€)</label>
          <input
            type="text"
            value={amount}
            placeholder="z.B. 45,50"
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 rounded-md border border-input bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={setAdSpend.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-5 py-2.5 text-xs font-bold text-navy transition hover:brightness-105 disabled:opacity-60"
        >
          {setAdSpend.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Speichern
        </button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */
function WebhookBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    sent: { label: "gesendet", cls: "bg-emerald-500/15 text-emerald-400" },
    failed: { label: "fehlgeschlagen", cls: "bg-red-500/15 text-red-400" },
    pending: { label: "ausstehend", cls: "bg-amber-500/15 text-amber-400" },
    none: { label: "kein Webhook", cls: "bg-muted text-muted-foreground" },
  };
  const m = map[status] ?? map.none;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const color = CHANNEL_COLORS[source] ?? "#9fb2c7";
  const label = CHANNEL_LABEL[source] ?? source;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}
