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

async function assertAdmin(req: any) {
  const ok = await isAdminRequest(req);
  if (!ok) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin-Login erforderlich." });
  }
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
