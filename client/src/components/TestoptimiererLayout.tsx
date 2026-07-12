/**
 * Shared layout for all Testoptimierer pages.
 * Provides consistent header with Admin switch and sub-navigation.
 */
import { ReactNode } from "react";
import { useLocation } from "wouter";
import {
  FlaskConical, BarChart3, Trophy, Settings, Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/testoptimierer", label: "Übersicht", icon: BarChart3 },
  { path: "/testoptimierer/scorecard", label: "Scorecard", icon: Trophy },
  { path: "/testoptimierer/einstellungen", label: "Einstellungen", icon: Settings },
];

interface Props {
  children: ReactNode;
  activeTab?: string;
}

export default function TestoptimiererLayout({ children, activeTab }: Props) {
  const [locationPath, navigate] = useLocation();
  const currentPath = activeTab ?? locationPath;

  return (
    <div className="min-h-screen bg-navy-deep text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6 text-gold" />
            <h1 className="font-display text-lg font-bold">Testoptimierer</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/testoptimierer/neu")}
              className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" />
              Neues Projekt
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition hover:border-gold/50"
            >
              <BarChart3 className="h-4 w-4" /> Admin
            </button>
          </div>
        </div>
      </header>

      {/* Sub-Navigation */}
      <div className="border-b border-border/20">
        <div className="container flex gap-1 pt-2">
          {NAV_ITEMS.map(t => {
            const Icon = t.icon;
            const isActive = currentPath === t.path;
            return (
              <button
                key={t.path}
                onClick={() => navigate(t.path)}
                className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-card text-gold border-b-2 border-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
