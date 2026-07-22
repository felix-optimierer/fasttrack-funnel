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
      // Calculate improvementPercent live from current visitor/conversion data
      const enrichedTests = tests.map(t => {
        const crA = t.visitorsA > 0 ? t.conversionsA / t.visitorsA : 0;
        const crB = t.visitorsB > 0 ? t.conversionsB / t.visitorsB : 0;
        const liveImprovement = crA > 0 ? ((crB - crA) / crA) * 100 : 0;
        return { ...t, improvementPercent: liveImprovement.toFixed(2) };
      });
      return { project, elements, tests: enrichedTests };
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
      elementType: z.enum(["main_headline", "pre_headline", "sub_headline", "cta", "bullet_point", "body_copy"]),
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
      const testData = tests.map(t => {
        // Calculate improvementPercent live from current data instead of stale stored value
        const crA = t.visitorsA > 0 ? t.conversionsA / t.visitorsA : 0;
        const crB = t.visitorsB > 0 ? t.conversionsB / t.visitorsB : 0;
        const liveImprovement = crA > 0 ? ((crB - crA) / crA) * 100 : null;
        return {
          status: t.status,
          visitorsA: t.visitorsA,
          visitorsB: t.visitorsB,
          conversionsA: t.conversionsA,
          conversionsB: t.conversionsB,
          improvementPercent: liveImprovement,
        };
      });
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

      type DetectedElement = {
        elementType: "main_headline" | "pre_headline" | "sub_headline" | "cta" | "bullet_point" | "body_copy";
        cssSelector: string;
        currentText: string;
        label: string;
      };

      // Check if this is our own SPA domain
      const ownDomains = ["go.physiofreiheit.de", "physiofunnel-n4hsdncp.manus.space", "localhost"];
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(input.url);
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Ungültige URL." });
      }
      const isOwnSPA = ownDomains.some(d => parsedUrl.hostname === d || parsedUrl.hostname.endsWith("." + d));

      if (isOwnSPA) {
        // For our own SPA: read the JSX source file directly based on route
        const path = await import("path");
        const fs = await import("fs/promises");
        const route = parsedUrl.pathname;

        // Route → component file mapping
        const routeMap: Record<string, string> = {
          "/": "Home.tsx",
          "/ki-report": "KiReport.tsx",
          "/exit-plan": "ExitPlan.tsx",
          "/traumwebseite": "Traumwebseite.tsx",
          "/anleitung": "Anleitung.tsx",
          "/webseite-termin": "WebseiteTermin.tsx",
          "/ki-report-termin": "KiReportTermin.tsx",
          "/exit-plan-termin": "ExitPlanTermin.tsx",
          "/danke-termin": "DankeTermin.tsx",
        };

        const componentFile = routeMap[route];
        if (!componentFile) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Route "${route}" ist keine bekannte Seite. Bekannte Routen: ${Object.keys(routeMap).join(", ")}` });
        }

        // Read the source file
        const projectRoot = path.resolve(process.cwd());
        const filePath = path.join(projectRoot, "client", "src", "pages", componentFile);
        let source: string;
        try {
          source = await fs.readFile(filePath, "utf-8");
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Quelldatei nicht gefunden: ${componentFile}` });
        }

        // Parse JSX source to extract testable elements
        const detected: DetectedElement[] = [];

        // Extract h1 content (handles multi-line h1 with <br/> tags)
        const h1Match = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        if (h1Match) {
          const h1Text = h1Match[1]
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]+>/g, "")
            .replace(/\{[^}]*\}/g, "")
            .replace(/\s+/g, " ")
            .trim();
          if (h1Text.length > 2) {
            detected.push({
              elementType: "main_headline",
              cssSelector: "h1",
              currentText: h1Text,
              label: "Haupt-Headline (H1)",
            });
          }
        }

        // Extract italic sub-headline (p with italic class before or after h1)
        const italicPMatch = source.match(/<p[^>]*italic[^>]*>([\s\S]*?)<\/p>/);
        if (italicPMatch) {
          const pText = italicPMatch[1].replace(/<[^>]+>/g, "").replace(/\{[^}]*\}/g, "").replace(/\s+/g, " ").trim();
          if (pText.length > 5 && pText.length < 200) {
            detected.push({
              elementType: "sub_headline",
              cssSelector: "p.italic",
              currentText: pText,
              label: "Sub-Headline (italic)",
            });
          }
        }

        // Extract pre-headline badge (div with uppercase/tracking or border-gold)
        const badgeMatch = source.match(/<div[^>]*(?:uppercase|border-gold|tracking-\[)[^>]*>([\s\S]*?)<\/div>/);
        if (badgeMatch) {
          const badgeText = badgeMatch[1].replace(/<[^>]+>/g, "").replace(/\{[^}]*\}/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
          if (badgeText.length > 3 && badgeText.length < 120) {
            // Generate a selector from the class
            const classMatch = badgeMatch[0].match(/className="([^"]+)"/);
            let selector = "div";
            if (classMatch) {
              const firstClass = classMatch[1].split(/\s+/).find(c => c.startsWith("inline") || c.startsWith("rounded") || c.startsWith("border"));
              if (firstClass) selector = `div.${firstClass.replace(/\//g, "\\/")}`;
            }
            detected.push({
              elementType: "pre_headline",
              cssSelector: selector,
              currentText: badgeText,
              label: "Pre-Headline (Badge)",
            });
          }
        }

        // Extract CTA button (GoldButton or button with prominent text)
        const ctaMatch = source.match(/<GoldButton[^>]*>([\s\S]*?)<\/GoldButton>/);
        if (ctaMatch) {
          const ctaText = ctaMatch[1].replace(/<[^>]+>/g, "").replace(/\{[^}]*\}/g, "").replace(/\s+/g, " ").trim();
          if (ctaText.length > 2) {
            detected.push({
              elementType: "cta",
              cssSelector: "button.gold-btn, main button",
              currentText: ctaText,
              label: "CTA-Button",
            });
          }
        } else {
          // Fallback: regular button
          const btnMatch = source.match(/<button[^>]*>([\s\S]*?)<\/button>/);
          if (btnMatch) {
            const btnText = btnMatch[1].replace(/<[^>]+>/g, "").replace(/\{[^}]*\}/g, "").replace(/\s+/g, " ").trim();
            if (btnText.length > 2 && btnText.length < 60) {
              detected.push({
                elementType: "cta",
                cssSelector: "button",
                currentText: btnText,
                label: "CTA-Button",
              });
            }
          }
        }

        // Detect Popup elements (headline + CTA inside popup/modal)
        // Check if the page imports LeadPopup or has a popup component
        const popupImport = source.match(/import.*LeadPopup.*from/);
        if (popupImport) {
          // Find the LeadPopup usage and extract headline prop
          const popupUsage = source.match(/<LeadPopup[^>]*headline=["'`{]([^"'`}]+)["'`}]/);
          if (popupUsage) {
            const popupHeadline = popupUsage[1].replace(/\s+/g, " ").trim();
            if (popupHeadline.length > 3) {
              detected.push({
                elementType: "sub_headline",
                cssSelector: ".popup-overlay h2, [role=dialog] h2",
                currentText: popupHeadline,
                label: "Popup-Headline",
              });
            }
          }
          // The popup CTA is typically "Jetzt kostenlos herunterladen" from LeadPopup
          // Read LeadPopup source to get the actual button text
          try {
            const popupPath = path.join(projectRoot, "client", "src", "components", "LeadPopup.tsx");
            const popupSource = await fs.readFile(popupPath, "utf-8");
            const popupCTA = popupSource.match(/<GoldButton[^>]*>([\s\S]*?)<\/GoldButton>/);
            if (popupCTA) {
              const ctaInPopup = popupCTA[1].replace(/<[^>]+>/g, "").replace(/\{[^}]*\}/g, "").replace(/\s+/g, " ").trim();
              // Only add if it's different from the main CTA
              const mainCTAText = detected.find(d => d.elementType === "cta")?.currentText;
              if (ctaInPopup.length > 2 && ctaInPopup !== mainCTAText) {
                detected.push({
                  elementType: "cta",
                  cssSelector: ".popup-overlay button[type=submit], [role=dialog] button[type=submit]",
                  currentText: ctaInPopup,
                  label: "Popup-CTA",
                });
              }
            }
          } catch {
            // LeadPopup source not found, skip popup CTA detection
          }
        }

        // Extract Bullet Points (spans with Check icon inside a flex container)
        const bulletContainerMatch = source.match(/\{\/* Bullet-Trust \*\/\}[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/)
          || source.match(/<div[^>]*flex[^>]*wrap[^>]*>([\s\S]*?(?:<Check[\s\S]*?<\/span>[\s\S]*?){2,})<\/div>/);
        if (bulletContainerMatch) {
          // Extract individual bullet text items
          const bulletSpans = Array.from(bulletContainerMatch[1].matchAll(/<span[^>]*inline-flex[^>]*>[\s\S]*?<Check[^>]*\/>[\s\S]*?([^<]+)<\/span>/g));
          let bulletIdx = 0;
          for (const match of bulletSpans) {
            const bulletText = match[1].trim();
            if (bulletText.length > 2) {
              bulletIdx++;
              detected.push({
                elementType: "bullet_point",
                cssSelector: `.inline-flex:nth-child(${bulletIdx})`,
                currentText: bulletText,
                label: `Bullet Point ${bulletIdx}`,
              });
            }
          }
        }

        // Extract Body Copy (p tags after h1 that are not italic sub-headlines)
        const bodyCopyMatches = Array.from(source.matchAll(/<p[^>]*(?:leading-relaxed|text-muted-foreground)[^>]*>([\s\S]*?)<\/p>/g));
        let bodyIdx = 0;
        for (const match of bodyCopyMatches) {
          // Skip if it's already detected as sub_headline (italic)
          if (match[0].includes("italic") && match[0].includes("text-gold")) continue;
          const bodyText = match[1]
            .replace(/<[^>]+>/g, "")
            .replace(/\{[^}]*\}/g, "")
            .replace(/&amp;/g, "&")
            .replace(/\s+/g, " ")
            .trim();
          if (bodyText.length > 20 && bodyText.length < 500) {
            bodyIdx++;
            detected.push({
              elementType: "body_copy",
              cssSelector: `p.leading-relaxed:nth-of-type(${bodyIdx})`,
              currentText: bodyText,
              label: `Body Copy ${bodyIdx}`,
            });
          }
        }

        // Extract "Satz über der Box" (sub-headline text like "Jetzt eintragen → 9 Fallstudien")
        const satzMatch = source.match(/\{\/\* Satz .ber der Box[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/);
        if (satzMatch) {
          const satzText = satzMatch[1]
            .replace(/<[^>]+>/g, "")
            .replace(/\{[^}]*\}/g, "")
            .replace(/\s+/g, " ")
            .trim();
          if (satzText.length > 5 && !detected.some(d => d.currentText === satzText)) {
            detected.push({
              elementType: "sub_headline",
              cssSelector: "main > div:has(> .uppercase)",
              currentText: satzText,
              label: "Sub-Headline (über Formular)",
            });
          }
        }

        // Extract page title from SEO component or file name
        const titleMatch = source.match(/title[=:]\s*["'`]([^"'`]+)["'`]/);
        const pageTitle = titleMatch ? titleMatch[1] : componentFile.replace(".tsx", "");

        return { elements: detected, pageTitle };
      }

      // External page: use cheerio (original approach)
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
      const detected: DetectedElement[] = [];

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
      const subHeadline = $("main p.italic, p.italic").first();
      if (subHeadline.length && subHeadline.text().trim()) {
        detected.push({
          elementType: "sub_headline",
          cssSelector: "p.italic",
          currentText: subHeadline.text().trim(),
          label: "Sub-Headline (italic)",
        });
      } else {
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

      // Detect pre-headline (badge/span before h1)
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
      elementType: z.enum(["main_headline", "pre_headline", "sub_headline", "cta", "bullet_point", "body_copy"]),
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
      // Calculate improvementPercent live from current data instead of stale stored value
      const testData = tests.map(t => {
        const crA = t.visitorsA > 0 ? t.conversionsA / t.visitorsA : 0;
        const crB = t.visitorsB > 0 ? t.conversionsB / t.visitorsB : 0;
        const liveImprovement = crA > 0 ? ((crB - crA) / crA) * 100 : null;
        return {
          status: t.status,
          visitorsA: t.visitorsA,
          visitorsB: t.visitorsB,
          conversionsA: t.conversionsA,
          conversionsB: t.conversionsB,
          improvementPercent: liveImprovement,
        };
      });
      const performance = calculateOverallPerformance(testData);

      // Calculate LP CR: baseline (first test) vs current (latest completed test)
      const completedTests = tests.filter(t => ["winner_a", "winner_b", "no_result"].includes(t.status));
      let baselineCR = 0;
      let currentCR = 0;
      if (completedTests.length > 0) {
        // First test = baseline CR (original conversion rate)
        const first = completedTests[completedTests.length - 1]; // oldest
        baselineCR = first.visitorsA > 0 ? (first.conversionsA / first.visitorsA) * 100 : 0;
        // Latest test = current best CR
        const latest = completedTests[0]; // newest
        const latestCR_A = latest.visitorsA > 0 ? (latest.conversionsA / latest.visitorsA) * 100 : 0;
        const latestCR_B = latest.visitorsB > 0 ? (latest.conversionsB / latest.visitorsB) * 100 : 0;
        currentCR = Math.max(latestCR_A, latestCR_B);
      }

      // Include test details for drill-down with live-calculated improvement
      const testDetails = tests.map(t => {
        const crA = t.visitorsA > 0 ? t.conversionsA / t.visitorsA : 0;
        const crB = t.visitorsB > 0 ? t.conversionsB / t.visitorsB : 0;
        const liveImprovement = crA > 0 ? ((crB - crA) / crA) * 100 : null;
        return {
          id: t.id,
          controlText: t.controlText ?? "",
          variantText: t.variantText ?? "",
          status: t.status,
          visitorsA: t.visitorsA,
          visitorsB: t.visitorsB,
          conversionsA: t.conversionsA,
          conversionsB: t.conversionsB,
          improvementPercent: liveImprovement,
          startedAt: t.startedAt,
          endedAt: t.endedAt,
        };
      });

      return {
        project,
        performance,
        baselineCR,
        currentCR,
        testDetails,
      };
    }));

    return scorecard;
  }),
});
