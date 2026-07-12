/**
 * Testoptimierer – tRPC Router
 * Admin procedures for managing A/B tests.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { isAdminRequest } from "../admin-auth";
import * as abDb from "./db";
import { calculateSignificance, calculateOverallPerformance } from "./statistics";
import * as cheerio from "cheerio";
import { invokeLLM } from "../_core/llm";

async function assertAdmin(req: any) {
  const ok = await isAdminRequest(req);
  if (!ok) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin-Login erforderlich." });
  }
}

// Helper: generate a reasonable CSS selector for a cheerio element
function generateSelector($: cheerio.CheerioAPI, el: cheerio.Cheerio<any>): string {
  const tagName = el.prop("tagName")?.toLowerCase() ?? "";
  const id = el.attr("id");
  if (id) return `#${id}`;
  const classes = el.attr("class")?.split(/\s+/).filter(c => c && !c.startsWith("__")).slice(0, 2);
  if (classes && classes.length > 0) return `${tagName}.${classes.join(".")}`;
  // Fallback: tag + parent context
  const parent = el.parent();
  const parentTag = parent.prop("tagName")?.toLowerCase();
  if (parentTag) return `${parentTag} > ${tagName}`;
  return tagName;
}

export const testoptimiererRouter = router({
  // ─── PROJECTS ──────────────────────────────────────────────────────────────

  listProjects: publicProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx.req);
    const projects = await abDb.listProjects();

    // Enrich with running test info and overall stats
    const enriched = await Promise.all(projects.map(async (project) => {
      const tests = await abDb.listTests(project.id);
      const runningTest = tests.find(t => t.status === "running") ?? null;
      const completedTests = tests.filter(t =>
        ["winner_a", "winner_b", "no_result"].includes(t.status)
      );
      const totalVisitors = tests.reduce((sum, t) => sum + t.visitorsA + t.visitorsB, 0);

      return {
        ...project,
        runningTest: runningTest ? {
          id: runningTest.id,
          visitorsA: runningTest.visitorsA,
          visitorsB: runningTest.visitorsB,
          conversionsA: runningTest.conversionsA,
          conversionsB: runningTest.conversionsB,
        } : null,
        totalTests: tests.length,
        completedTests: completedTests.length,
        totalVisitors,
      };
    }));

    return enriched;
  }),

  getProject: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      const project = await abDb.getProject(input.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      const elements = await abDb.listElements(input.id);
      const tests = await abDb.listTests(input.id);
      return { project, elements, tests };
    }),

  createProject: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      targetUrl: z.string().url().max(500),
      conversionUrlPattern: z.string().min(1).max(500),
      conversionMatchType: z.enum(["exact", "contains"]).default("contains"),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      const id = await abDb.createProject(input);
      return { id };
    }),

  updateProject: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      targetUrl: z.string().url().max(500).optional(),
      conversionUrlPattern: z.string().min(1).max(500).optional(),
      conversionMatchType: z.enum(["exact", "contains"]).optional(),
      status: z.enum(["active", "paused", "stopped"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      const { id, ...data } = input;
      await abDb.updateProject(id, data);
      return { success: true };
    }),

  deleteProject: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      await abDb.deleteProject(input.id);
      return { success: true };
    }),

  // ─── ELEMENTS ──────────────────────────────────────────────────────────────

  createElement: publicProcedure
    .input(z.object({
      projectId: z.number(),
      elementType: z.enum(["main_headline", "pre_headline", "sub_headline", "cta"]),
      cssSelector: z.string().min(1).max(1000),
      originalText: z.string().min(1),
      label: z.string().max(255).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      const id = await abDb.createElement(input);
      return { id };
    }),

  updateElement: publicProcedure
    .input(z.object({
      id: z.number(),
      cssSelector: z.string().min(1).max(1000).optional(),
      originalText: z.string().min(1).optional(),
      label: z.string().max(255).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      const { id, ...data } = input;
      await abDb.updateElement(id, data);
      return { success: true };
    }),

  deleteElement: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      await abDb.deleteElement(input.id);
      return { success: true };
    }),

  // ─── TESTS ─────────────────────────────────────────────────────────────────

  createTest: publicProcedure
    .input(z.object({
      projectId: z.number(),
      elementId: z.number(),
      variantText: z.string().min(1),
      controlText: z.string().min(1),
      trafficSplit: z.number().int().min(1).max(99).default(50),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      // Check if there's already a running test for this project
      const running = await abDb.getRunningTestForProject(input.projectId);
      if (running) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Es läuft bereits ein Test für dieses Projekt. Bitte beende oder stoppe den aktuellen Test zuerst.",
        });
      }
      const id = await abDb.createTest(input);
      return { id };
    }),

  updateTestStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["running", "paused", "stopped", "skipped"]),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      await abDb.updateTestStatus(input.id, input.status);
      return { success: true };
    }),

  getTestSignificance: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      const test = await abDb.getTest(input.id);
      if (!test) throw new TRPCError({ code: "NOT_FOUND" });

      const settings = await abDb.getAbSettings();
      const threshold = parseFloat(
        settings.find(s => s.settingKey === "significance_threshold")?.settingValue ?? "0.05"
      );

      return calculateSignificance(
        test.visitorsA,
        test.conversionsA,
        test.visitorsB,
        test.conversionsB,
        threshold,
      );
    }),

  // ─── OVERALL PERFORMANCE ───────────────────────────────────────────────────

  getProjectPerformance: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      const tests = await abDb.getProjectPerformanceData(input.projectId);
      const testData = tests.map(t => ({
        status: t.status,
        visitorsA: t.visitorsA,
        visitorsB: t.visitorsB,
        conversionsA: t.conversionsA,
        conversionsB: t.conversionsB,
        improvementPercent: t.improvementPercent ? parseFloat(t.improvementPercent) : null,
      }));
      return calculateOverallPerformance(testData);
    }),

  // ─── SETTINGS ──────────────────────────────────────────────────────────────

  getSettings: publicProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx.req);
    return abDb.getAbSettings();
  }),

  updateSetting: publicProcedure
    .input(z.object({
      key: z.string().min(1),
      value: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      await abDb.upsertAbSetting(input.key, input.value);
      return { success: true };
    }),

  initSettings: publicProcedure.mutation(async ({ ctx }) => {
    await assertAdmin(ctx.req);
    await abDb.initDefaultSettings();
    return { success: true };
  }),

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────

  listNotifications: publicProcedure
    .input(z.object({ testId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      return abDb.listNotifications(input?.testId);
    }),

  // ─── SCAN PAGE ─────────────────────────────────────────────────────────────

  scanPage: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);

      // Fetch the page HTML
      let html: string;
      try {
        const resp = await fetch(input.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Testoptimierer/1.0)",
            "Accept": "text/html,application/xhtml+xml",
          },
          redirect: "follow",
        });
        if (!resp.ok) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Seite konnte nicht geladen werden (HTTP ${resp.status}).` });
        }
        html = await resp.text();
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "BAD_REQUEST", message: `Seite konnte nicht geladen werden: ${err.message}` });
      }

      const $ = cheerio.load(html);
      const detected: Array<{
        elementType: "main_headline" | "pre_headline" | "sub_headline" | "cta";
        cssSelector: string;
        currentText: string;
        label: string;
      }> = [];

      // Detect main headline (h1)
      const h1 = $("h1").first();
      if (h1.length && h1.text().trim()) {
        detected.push({
          elementType: "main_headline",
          cssSelector: "h1",
          currentText: h1.text().trim(),
          label: "Haupt-Headline (H1)",
        });
      }

      // Detect sub-headline (first p after h1, or p.italic, or h2)
      const subHeadline = $("main p.italic").first();
      if (subHeadline.length && subHeadline.text().trim()) {
        detected.push({
          elementType: "sub_headline",
          cssSelector: "main p.italic",
          currentText: subHeadline.text().trim(),
          label: "Sub-Headline (italic)",
        });
      } else {
        // Try h2
        const h2 = $("h2").first();
        if (h2.length && h2.text().trim()) {
          detected.push({
            elementType: "sub_headline",
            cssSelector: "h2",
            currentText: h2.text().trim(),
            label: "Sub-Headline (H2)",
          });
        }
      }

      // Detect pre-headline (badge/span before h1, or small text above)
      const preHeadline = $("h1").prev("div, span, p").first();
      if (preHeadline.length && preHeadline.text().trim().length < 100) {
        detected.push({
          elementType: "pre_headline",
          cssSelector: generateSelector($, preHeadline),
          currentText: preHeadline.text().trim(),
          label: "Pre-Headline (Badge)",
        });
      }

      // Detect CTA button
      const ctaButton = $("button[type='submit'], a.cta, button.cta, form button").first();
      if (ctaButton.length && ctaButton.text().trim()) {
        detected.push({
          elementType: "cta",
          cssSelector: generateSelector($, ctaButton),
          currentText: ctaButton.text().trim(),
          label: "CTA-Button",
        });
      } else {
        // Fallback: first prominent button
        const anyButton = $("button").filter((_, el) => {
          const text = $(el).text().trim();
          return text.length > 2 && text.length < 60;
        }).first();
        if (anyButton.length) {
          detected.push({
            elementType: "cta",
            cssSelector: generateSelector($, anyButton),
            currentText: anyButton.text().trim(),
            label: "CTA-Button",
          });
        }
      }

      return { elements: detected, pageTitle: $("title").text() || "" };
    }),

  // ─── SUGGEST VARIANT ──────────────────────────────────────────────────────

  suggestVariant: publicProcedure
    .input(z.object({
      originalText: z.string().min(1),
      elementType: z.enum(["main_headline", "pre_headline", "sub_headline", "cta"]),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);

      const typeLabels: Record<string, string> = {
        main_headline: "Haupt-Headline",
        pre_headline: "Pre-Headline / Badge",
        sub_headline: "Sub-Headline / Untertitel",
        cta: "Call-to-Action Button",
      };

      const systemPrompt = `Du bist ein Conversion-Optimierungs-Experte für Physiotherapie-Praxen und Gesundheitsdienstleister.
Deine Aufgabe: Generiere 3 alternative Varianten für ein ${typeLabels[input.elementType]} auf einer Landing Page.

Regeln:
- Jede Variante muss sich deutlich vom Original unterscheiden (anderer Angle, andere Emotion)
- Halte die Länge ähnlich zum Original (max. 20% länger/kürzer)
- Nutze bewährte Copywriting-Prinzipien (Spezifität, Dringlichkeit, Nutzenversprechen)
- Schreibe auf Deutsch, duze den Leser
- Für CTAs: kurz und handlungsorientiert (max. 5-6 Wörter)
- Für Headlines: emotional, spezifisch, neugierig machend

Antworte NUR als JSON-Array mit genau 3 Objekten:
[{"text": "...", "reasoning": "..."}]`;

      const userPrompt = `Original-Text: "${input.originalText}"
Element-Typ: ${typeLabels[input.elementType]}
${input.context ? `Kontext: ${input.context}` : ""}

Generiere 3 alternative Varianten.`;

      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "variants",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  variants: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string", description: "Der alternative Text" },
                        reasoning: { type: "string", description: "Kurze Begründung warum diese Variante besser konvertieren könnte" },
                      },
                      required: ["text", "reasoning"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["variants"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = result.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new Error("Keine Antwort vom LLM erhalten.");
        }

        const parsed = JSON.parse(content);
        return { variants: parsed.variants as Array<{ text: string; reasoning: string }> };
      } catch (err: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Varianten-Generierung fehlgeschlagen: ${err.message}`,
        });
      }
    }),

  // ─── WEEKLY PERFORMANCE ────────────────────────────────────────────────────

  getWeeklyPerformance: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertAdmin(ctx.req);
      return abDb.getWeeklyPerformance(input.projectId);
    }),

  // ─── SCORECARD ─────────────────────────────────────────────────────────────

  getScorecard: publicProcedure.query(async ({ ctx }) => {
    await assertAdmin(ctx.req);
    const projects = await abDb.listProjects();

    const scorecard = await Promise.all(projects.map(async (project) => {
      const tests = await abDb.getProjectPerformanceData(project.id);
      const testData = tests.map(t => ({
        status: t.status,
        visitorsA: t.visitorsA,
        visitorsB: t.visitorsB,
        conversionsA: t.conversionsA,
        conversionsB: t.conversionsB,
        improvementPercent: t.improvementPercent ? parseFloat(t.improvementPercent) : null,
      }));
      const performance = calculateOverallPerformance(testData);
      return {
        project,
        performance,
      };
    }));

    return scorecard;
  }),
});
