// ADMIN-DASHBOARD (/admin) — eigenes Passwort-Login (getrennt vom Manus-OAuth).
// Besucher-Statistik, Lead-Liste und konfigurierbare Webhook-URL.
import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

type Period = "day" | "week" | "month";

const PERIOD_LABEL: Record<Period, string> = {
  day: "Heute",
  week: "Diese Woche",
  month: "Dieser Monat",
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

  return <Dashboard onLogout={() => utils.admin.me.invalidate()} />;
}

/* ---------------------------- LOGIN ---------------------------- */
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

/* ---------------------------- DASHBOARD ---------------------------- */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [period, setPeriod] = useState<Period>("day");
  const utils = trpc.useUtils();

  const statsQuery = trpc.admin.stats.useQuery({ period });
  const leadsQuery = trpc.admin.leads.useQuery();
  const logout = trpc.admin.logout.useMutation();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Abgemeldet.");
        onLogout();
      },
    });
  }

  const stats = statsQuery.data;

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

      <main className="container space-y-8 py-8">
        {/* Zeitraum-Tabs */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {(["day", "week", "month"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  period === p
                    ? "bg-gradient-to-b from-[#e3c75a] to-[#c9a227] text-navy"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              utils.admin.stats.invalidate();
              utils.admin.leads.invalidate();
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Aktualisieren
          </button>
        </div>

        {/* Statistik-Karten */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Besucher Hauptseite"
            value={stats?.views.home}
            loading={statsQuery.isLoading}
          />
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Besucher VSL"
            value={stats?.views.vsl}
            loading={statsQuery.isLoading}
          />
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Besucher Termin"
            value={stats?.views.termin}
            loading={statsQuery.isLoading}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label={`Leads (${PERIOD_LABEL[period]})`}
            value={stats?.leads}
            sub={
              stats?.totalLeads !== undefined
                ? `${stats.totalLeads} gesamt`
                : undefined
            }
            loading={statsQuery.isLoading}
          />
        </div>

        {/* Webhook-Einstellung */}
        <WebhookCard />

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
                      <td className="px-5 py-3 font-medium text-foreground">
                        {l.name}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {l.email}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {l.phone}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {l.source}
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
      </main>
    </div>
  );
}

/* ---------------------------- KOMPONENTEN ---------------------------- */
function StatCard({
  icon,
  label,
  value,
  sub,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-gold">{icon}</div>
      <div className="mt-3 font-display text-3xl font-extrabold text-foreground">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          (value ?? 0).toLocaleString("de-DE")
        )}
      </div>
      <div className="mt-1 text-xs leading-tight text-muted-foreground">
        {label}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-gold/80">{sub}</div>}
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
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

function WebhookCard() {
  const utils = trpc.useUtils();
  const webhookQuery = trpc.admin.getWebhook.useQuery();
  const setWebhook = trpc.admin.setWebhook.useMutation();
  const testWebhook = trpc.admin.testWebhook.useMutation();
  const [url, setUrl] = useState<string | null>(null);

  // Initialwert aus Query übernehmen
  const value = url ?? webhookQuery.data?.url ?? "";

  function handleSave() {
    setWebhook.mutate(
      { url: value },
      {
        onSuccess: () => {
          toast.success("Webhook-URL gespeichert.");
          utils.admin.getWebhook.invalidate();
        },
        onError: () => toast.error("Speichern fehlgeschlagen."),
      },
    );
  }

  function handleTest() {
    testWebhook.mutate(undefined, {
      onSuccess: (res) => {
        if (res.status === "sent") toast.success("Test-Webhook erfolgreich gesendet.");
        else if (res.status === "none")
          toast.error("Keine Webhook-URL gespeichert.");
        else toast.error("Test-Webhook fehlgeschlagen (Zielserver-Fehler).");
      },
      onError: () => toast.error("Test fehlgeschlagen."),
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Webhook className="h-4 w-4 text-gold" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Webhook-Weiterleitung
        </h2>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Jeder neue Lead wird per POST (JSON) an diese URL gesendet. Felder: id,
        name, email, phone, source, createdAt.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={value}
          placeholder="https://hook.eu.make.com/…"
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-md border border-input bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={setWebhook.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-b from-[#e3c75a] to-[#c9a227] px-5 py-3 text-sm font-bold text-navy transition hover:brightness-105 disabled:opacity-60"
          >
            {setWebhook.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Speichern
          </button>
          <button
            onClick={handleTest}
            disabled={testWebhook.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition hover:border-gold/50 disabled:opacity-60"
          >
            {testWebhook.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Test
          </button>
        </div>
      </div>
    </section>
  );
}
