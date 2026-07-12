/**
 * Testoptimierer – Tracking Routes
 * Express routes for tracking impressions and conversions from external pages.
 */

import type { Express, Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { abTests, abVisitors, abProjects, abElements } from "../../drizzle/schema";
import { generateTag } from "./tag-generator";

/**
 * Register all Testoptimierer tracking routes on the Express app.
 * These are public endpoints called from external pages (CORS enabled).
 */
export function registerTestoptimiererRoutes(app: Express) {
  // CORS middleware for testoptimierer routes
  const corsMiddleware = (_req: Request, res: Response, next: () => void) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (_req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  };

  // ─── GET /api/testoptimierer/tag/:projectId ─────────────────────────────────
  // Returns the dynamically generated JavaScript tag for a project.
  app.get("/api/testoptimierer/tag/:projectId", corsMiddleware, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      if (isNaN(projectId)) {
        res.setHeader("Content-Type", "application/javascript");
        res.send("/* Testoptimierer: Invalid project ID */");
        return;
      }

      const db = await getDb();
      if (!db) {
        res.setHeader("Content-Type", "application/javascript");
        res.send("/* Testoptimierer: DB unavailable */");
        return;
      }

      // Find the project
      const projects = await db.select().from(abProjects).where(eq(abProjects.id, projectId)).limit(1);
      const project = projects[0];
      if (!project || project.status !== "active") {
        res.setHeader("Content-Type", "application/javascript");
        res.send("/* Testoptimierer: No active project */");
        return;
      }

      // Find the active/running test for this project
      const tests = await db.select().from(abTests)
        .where(and(eq(abTests.projectId, projectId), eq(abTests.status, "running")))
        .limit(1);
      const test = tests[0];
      if (!test) {
        res.setHeader("Content-Type", "application/javascript");
        res.send("/* Testoptimierer: No running test */");
        return;
      }

      // Find the element
      const elements = await db.select().from(abElements).where(eq(abElements.id, test.elementId)).limit(1);
      const element = elements[0];
      if (!element) {
        res.setHeader("Content-Type", "application/javascript");
        res.send("/* Testoptimierer: Element not found */");
        return;
      }

      // Determine base URL from request
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
      const baseUrl = `${protocol}://${host}`;

      const script = generateTag({ project, element, test, baseUrl });

      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(script);
    } catch (error) {
      console.error("[Testoptimierer] Tag generation error:", error);
      res.setHeader("Content-Type", "application/javascript");
      res.send("/* Testoptimierer: Error */");
    }
  });

  // ─── POST /api/testoptimierer/track/impression ──────────────────────────────
  // Records a page impression (visitor saw the test).
  app.post("/api/testoptimierer/track/impression", corsMiddleware, async (req: Request, res: Response) => {
    try {
      const { testId, visitorId, variant } = req.body || {};
      if (!testId || !visitorId || !variant) {
        res.status(400).json({ error: "Missing fields" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(200).json({ ok: true }); // Don't fail silently for the client
        return;
      }

      // Check if this visitor already exists for this test
      const existing = await db.select().from(abVisitors)
        .where(and(eq(abVisitors.testId, testId), eq(abVisitors.visitorUid, visitorId)))
        .limit(1);

      if (existing.length === 0) {
        // New visitor – insert and increment counter
        await db.insert(abVisitors).values({
          testId,
          visitorUid: visitorId,
          variant: variant as "a" | "b",
        });

        // Increment visitor count on the test
        if (variant === "a") {
          await db.execute(
            `UPDATE ab_tests SET visitorsA = visitorsA + 1 WHERE id = ${testId}`
          );
        } else {
          await db.execute(
            `UPDATE ab_tests SET visitorsB = visitorsB + 1 WHERE id = ${testId}`
          );
        }
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("[Testoptimierer] Impression tracking error:", error);
      res.status(200).json({ ok: true }); // Don't break the client
    }
  });

  // ─── POST /api/testoptimierer/track/conversion ──────────────────────────────
  // Records a conversion event.
  app.post("/api/testoptimierer/track/conversion", corsMiddleware, async (req: Request, res: Response) => {
    try {
      const { testId, visitorId } = req.body || {};
      if (!testId || !visitorId) {
        res.status(400).json({ error: "Missing fields" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(200).json({ ok: true });
        return;
      }

      // Find the visitor record
      const visitors = await db.select().from(abVisitors)
        .where(and(eq(abVisitors.testId, testId), eq(abVisitors.visitorUid, visitorId)))
        .limit(1);

      if (visitors.length === 0) {
        // Visitor not tracked yet – skip (they might have cleared cookies)
        res.status(200).json({ ok: true });
        return;
      }

      const visitor = visitors[0];

      // Only count conversion once per visitor
      if (visitor.converted) {
        res.status(200).json({ ok: true, already: true });
        return;
      }

      // Mark as converted
      await db.update(abVisitors)
        .set({ converted: true, convertedAt: new Date() })
        .where(eq(abVisitors.id, visitor.id));

      // Increment conversion count on the test
      if (visitor.variant === "a") {
        await db.execute(
          `UPDATE ab_tests SET conversionsA = conversionsA + 1 WHERE id = ${testId}`
        );
      } else {
        await db.execute(
          `UPDATE ab_tests SET conversionsB = conversionsB + 1 WHERE id = ${testId}`
        );
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("[Testoptimierer] Conversion tracking error:", error);
      res.status(200).json({ ok: true });
    }
  });

  // ─── POST /api/scheduled/testoptimierer-check ───────────────────────────────
  // Heartbeat callback: checks significance for all running tests.
  app.post("/api/scheduled/testoptimierer-check", async (req: Request, res: Response) => {
    try {
      // Import dynamically to avoid circular dependencies
      const { runSignificanceCheck } = await import("./heartbeat-check");
      const result = await runSignificanceCheck();
      res.json({ ok: true, ...result });
    } catch (error) {
      console.error("[Testoptimierer] Heartbeat check error:", error);
      res.status(500).json({
        error: String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });
}
