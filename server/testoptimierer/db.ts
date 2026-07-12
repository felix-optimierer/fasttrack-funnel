/**
 * Testoptimierer – Database Helpers
 * Query helpers for A/B testing data.
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  abProjects, abElements, abTests, abVisitors, abNotificationsLog, abSettings,
  type InsertAbProject, type InsertAbElement, type InsertAbTest,
} from "../../drizzle/schema";

// ─── PROJECTS ──────────────────────────────────────────────────────────────────

export async function listProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(abProjects).orderBy(desc(abProjects.updatedAt));
}

export async function getProject(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(abProjects).where(eq(abProjects.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createProject(data: InsertAbProject) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(abProjects).values(data);
  const insertId = (result as any)[0]?.insertId;
  return insertId ?? null;
}

export async function updateProject(id: number, data: Partial<InsertAbProject>) {
  const db = await getDb();
  if (!db) return;
  await db.update(abProjects).set(data).where(eq(abProjects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  // Delete all related data
  const tests = await db.select({ id: abTests.id }).from(abTests).where(eq(abTests.projectId, id));
  for (const test of tests) {
    await db.delete(abVisitors).where(eq(abVisitors.testId, test.id));
    await db.delete(abNotificationsLog).where(eq(abNotificationsLog.testId, test.id));
  }
  await db.delete(abTests).where(eq(abTests.projectId, id));
  await db.delete(abElements).where(eq(abElements.projectId, id));
  await db.delete(abProjects).where(eq(abProjects.id, id));
}

// ─── ELEMENTS ──────────────────────────────────────────────────────────────────

export async function listElements(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(abElements).where(eq(abElements.projectId, projectId));
}

export async function createElement(data: InsertAbElement) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(abElements).values(data);
  const insertId = (result as any)[0]?.insertId;
  return insertId ?? null;
}

export async function updateElement(id: number, data: Partial<InsertAbElement>) {
  const db = await getDb();
  if (!db) return;
  await db.update(abElements).set(data).where(eq(abElements.id, id));
}

export async function deleteElement(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(abElements).where(eq(abElements.id, id));
}

// ─── TESTS ─────────────────────────────────────────────────────────────────────

export async function listTests(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(abTests)
    .where(eq(abTests.projectId, projectId))
    .orderBy(desc(abTests.startedAt));
}

export async function getTest(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(abTests).where(eq(abTests.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createTest(data: InsertAbTest) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(abTests).values(data);
  const insertId = (result as any)[0]?.insertId;
  return insertId ?? null;
}

export async function updateTestStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  const updates: any = { status };
  if (["winner_a", "winner_b", "no_result", "stopped", "skipped"].includes(status)) {
    updates.endedAt = new Date();
  }
  await db.update(abTests).set(updates).where(eq(abTests.id, id));
}

export async function getRunningTestForProject(projectId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(abTests)
    .where(and(eq(abTests.projectId, projectId), eq(abTests.status, "running")))
    .limit(1);
  return rows[0] ?? null;
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

export async function getAbSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(abSettings);
}

export async function upsertAbSetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) return;
  // Try update first
  const existing = await db.select().from(abSettings).where(eq(abSettings.settingKey, key)).limit(1);
  if (existing.length > 0) {
    await db.update(abSettings).set({ settingValue: value }).where(eq(abSettings.settingKey, key));
  } else {
    await db.insert(abSettings).values({ settingKey: key, settingValue: value, description });
  }
}

export async function initDefaultSettings() {
  const db = await getDb();
  if (!db) return;

  const defaults = [
    { key: "significance_threshold", value: "0.05", description: "p-Wert-Schwelle für statistische Signifikanz (0.05 = 95% Konfidenz). Niedrigere Werte = strengere Anforderungen. Empfehlung: 0.05 für die meisten Tests." },
    { key: "min_visitors_for_stop", value: "1000", description: "Mindestanzahl Besucher (beide Varianten zusammen), bevor ein Test ohne Signifikanz abgebrochen wird. Empfehlung: 1000 für Seiten mit gutem Traffic." },
    { key: "p_value_threshold_for_stop", value: "0.20", description: "Wenn nach min_visitors_for_stop der p-Wert über diesem Schwellenwert liegt, wird der Test abgebrochen. 0.20 bedeutet: weniger als 80% Wahrscheinlichkeit für einen echten Unterschied." },
    { key: "max_visitors_timeout", value: "2000", description: "Absolute Obergrenze an Besuchern. Nach dieser Zahl wird ein Test in jedem Fall beendet, wenn keine Signifikanz erreicht wurde." },
    { key: "check_interval_hours", value: "3", description: "Wie oft die Signifikanz-Prüfung läuft (in Stunden). Empfehlung: 3 Stunden ist ein guter Kompromiss zwischen Reaktionszeit und unnötiger Belastung." },
  ];

  for (const d of defaults) {
    const existing = await db.select().from(abSettings).where(eq(abSettings.settingKey, d.key)).limit(1);
    if (existing.length === 0) {
      await db.insert(abSettings).values({ settingKey: d.key, settingValue: d.value, description: d.description });
    }
  }
}

// ─── NOTIFICATIONS LOG ─────────────────────────────────────────────────────────

export async function listNotifications(testId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (testId) {
    return db.select().from(abNotificationsLog)
      .where(eq(abNotificationsLog.testId, testId))
      .orderBy(desc(abNotificationsLog.sentAt));
  }
  return db.select().from(abNotificationsLog).orderBy(desc(abNotificationsLog.sentAt)).limit(50);
}

// ─── OVERALL PERFORMANCE ───────────────────────────────────────────────────────

export async function getProjectPerformanceData(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(abTests)
    .where(eq(abTests.projectId, projectId))
    .orderBy(abTests.startedAt);
}
