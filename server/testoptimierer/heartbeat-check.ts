/**
 * Testoptimierer – Heartbeat Check
 * Runs every 3 hours to check significance of all running tests.
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { abTests, abProjects, abElements, abNotificationsLog, abSettings } from "../../drizzle/schema";
import { calculateSignificance, shouldAutoStop } from "./statistics";
import { notifyOwner } from "../_core/notification";

interface CheckResult {
  testsChecked: number;
  winnersFound: number;
  testsStopped: number;
}

/**
 * Get a setting value from ab_settings table.
 */
async function getAbSetting(key: string, defaultValue: string): Promise<string> {
  const db = await getDb();
  if (!db) return defaultValue;
  const rows = await db.select().from(abSettings).where(eq(abSettings.settingKey, key)).limit(1);
  return rows[0]?.settingValue ?? defaultValue;
}

/**
 * Run significance check on all running tests.
 * Called by the heartbeat scheduler every 3 hours.
 */
export async function runSignificanceCheck(): Promise<CheckResult> {
  const db = await getDb();
  if (!db) return { testsChecked: 0, winnersFound: 0, testsStopped: 0 };

  // Load configurable settings
  const significanceThreshold = parseFloat(await getAbSetting("significance_threshold", "0.05"));
  const minVisitorsForStop = parseInt(await getAbSetting("min_visitors_for_stop", "1000"), 10);
  const pValueThresholdForStop = parseFloat(await getAbSetting("p_value_threshold_for_stop", "0.20"));
  const maxVisitorsTimeout = parseInt(await getAbSetting("max_visitors_timeout", "2000"), 10);

  // Get all running tests
  const runningTests = await db.select().from(abTests).where(eq(abTests.status, "running"));

  let winnersFound = 0;
  let testsStopped = 0;

  for (const test of runningTests) {
    const result = calculateSignificance(
      test.visitorsA,
      test.conversionsA,
      test.visitorsB,
      test.conversionsB,
      significanceThreshold,
    );

    // Update significance level on the test
    await db.update(abTests).set({
      significanceLevel: String(result.pValue),
      improvementPercent: String(result.improvementPercent),
    }).where(eq(abTests.id, test.id));

    // Check if we have a winner
    if (result.isSignificant) {
      const winnerStatus = result.winner === "b" ? "winner_b" : "winner_a";
      await db.update(abTests).set({
        status: winnerStatus as any,
        endedAt: new Date(),
      }).where(eq(abTests.id, test.id));

      // If winner is B, update the element's original text
      if (result.winner === "b") {
        await db.update(abElements).set({
          originalText: test.variantText,
        }).where(eq(abElements.id, test.elementId));
      }

      // Get project and element info for notification
      const projects = await db.select().from(abProjects).where(eq(abProjects.id, test.projectId)).limit(1);
      const elements = await db.select().from(abElements).where(eq(abElements.id, test.elementId)).limit(1);
      const projectName = projects[0]?.name ?? "Unbekannt";
      const elementLabel = elements[0]?.label ?? elements[0]?.elementType ?? "Element";

      // Send notification
      const crA = (result.crA * 100).toFixed(2);
      const crB = (result.crB * 100).toFixed(2);
      const improvement = result.improvementPercent.toFixed(2);
      const confidence = result.confidencePercent.toFixed(1);

      const message = `Test abgeschlossen für "${elementLabel}" auf ${projectName}.\n\n` +
        `Gewinner: Variante ${result.winner === "b" ? "B (neue Variante)" : "A (Original)"}\n\n` +
        `Original (A): ${test.visitorsA} Besucher, ${test.conversionsA} Conversions, CR ${crA}%\n` +
        `Variante (B): ${test.visitorsB} Besucher, ${test.conversionsB} Conversions, CR ${crB}%\n\n` +
        `Steigerung: ${improvement}% (Konfidenz: ${confidence}%)\n\n` +
        `Die bessere Variante wurde automatisch als neues Original übernommen.`;

      await notifyOwner({
        title: `Testoptimierer: Gewinner gefunden bei ${projectName}`,
        content: message,
      });

      // Log notification
      await db.insert(abNotificationsLog).values({
        testId: test.id,
        type: "winner_found",
        message,
      });

      winnersFound++;
      continue;
    }

    // Check if test should be auto-stopped (no significance after enough visitors)
    const totalVisitors = test.visitorsA + test.visitorsB;

    if (shouldAutoStop(test.visitorsA, test.visitorsB, result.pValue, minVisitorsForStop, pValueThresholdForStop)) {
      await db.update(abTests).set({
        status: "no_result" as any,
        endedAt: new Date(),
      }).where(eq(abTests.id, test.id));

      // Get project and element info
      const projects = await db.select().from(abProjects).where(eq(abProjects.id, test.projectId)).limit(1);
      const elements = await db.select().from(abElements).where(eq(abElements.id, test.elementId)).limit(1);
      const projectName = projects[0]?.name ?? "Unbekannt";
      const elementLabel = elements[0]?.label ?? elements[0]?.elementType ?? "Element";

      const crA = (result.crA * 100).toFixed(2);
      const crB = (result.crB * 100).toFixed(2);
      const improvement = result.improvementPercent.toFixed(2);

      const message = `Der Test für "${elementLabel}" auf ${projectName} wurde nach ${totalVisitors} Besuchern ohne signifikantes Ergebnis abgebrochen.\n\n` +
        `Original (A): ${test.visitorsA} Besucher, ${test.conversionsA} Conversions, CR ${crA}%\n` +
        `Variante (B): ${test.visitorsB} Besucher, ${test.conversionsB} Conversions, CR ${crB}%\n\n` +
        `Differenz: ${improvement}% – aber nicht signifikant (p-value: ${result.pValue.toFixed(3)})\n\n` +
        `Empfehlung: Setze einen neuen Test mit einer stärker abweichenden Variante auf.`;

      await notifyOwner({
        title: `Testoptimierer: Test ohne Ergebnis bei ${projectName}`,
        content: message,
      });

      // Log notification
      await db.insert(abNotificationsLog).values({
        testId: test.id,
        type: "no_significance",
        message,
      });

      testsStopped++;
      continue;
    }

    // Timeout check: too many visitors without any result
    if (totalVisitors >= maxVisitorsTimeout && result.pValue > significanceThreshold) {
      await db.update(abTests).set({
        status: "no_result" as any,
        endedAt: new Date(),
      }).where(eq(abTests.id, test.id));

      const projects = await db.select().from(abProjects).where(eq(abProjects.id, test.projectId)).limit(1);
      const elements = await db.select().from(abElements).where(eq(abElements.id, test.elementId)).limit(1);
      const projectName = projects[0]?.name ?? "Unbekannt";
      const elementLabel = elements[0]?.label ?? elements[0]?.elementType ?? "Element";

      const message = `Der Test für "${elementLabel}" auf ${projectName} wurde nach ${totalVisitors} Besuchern (Timeout) abgebrochen.\n\n` +
        `Keine statistische Signifikanz erreicht (p-value: ${result.pValue.toFixed(3)}).\n\n` +
        `Empfehlung: Neuen Test mit deutlich anderem Text aufsetzen.`;

      await notifyOwner({
        title: `Testoptimierer: Timeout bei ${projectName}`,
        content: message,
      });

      await db.insert(abNotificationsLog).values({
        testId: test.id,
        type: "no_significance",
        message,
      });

      testsStopped++;
    }
  }

  return {
    testsChecked: runningTests.length,
    winnersFound,
    testsStopped,
  };
}
