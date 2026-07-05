import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  fireWebhook,
  getDailySeries,
  getSetting,
  getStats,
  insertLead,
  insertPageView,
  listLeads,
  setSetting,
  updateLeadWebhookStatus,
  type Period,
} from "./funnel-db";
import {
  ADMIN_COOKIE,
  createAdminToken,
  isAdminRequest,
  validateAdminCredentials,
} from "./admin-auth";
import { notifyOwner } from "./_core/notification";

const periodSchema = z.enum(["day", "week", "month"]);

/** Middleware-Ersatz: prüft das Admin-Cookie und wirft sonst FORBIDDEN. */
async function assertAdmin(req: any) {
  const ok = await isAdminRequest(req);
  if (!ok) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin-Login erforderlich." });
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /** Öffentliche Lead-Erfassung + Webhook-Versand. */
  leads: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          email: z.string().email().max(320),
          phone: z.string().min(3).max(64),
          source: z.string().max(64).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const source = input.source ?? "home";
        const id = await insertLead({
          name: input.name,
          email: input.email,
          phone: input.phone,
          source,
          webhookStatus: "pending",
        });

        const payload = {
          event: "new_lead",
          id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          source,
          createdAt: new Date().toISOString(),
        };

        // Webhook auslösen (falls konfiguriert) und Status speichern.
        const status = await fireWebhook(payload);
        if (id) await updateLeadWebhookStatus(id, status);

        // Owner-Benachrichtigung (best effort)
        notifyOwner({
          title: "Neuer Lead im Fast-Track Funnel",
          content: `${input.name} · ${input.email} · ${input.phone} (Quelle: ${source})`,
        }).catch(() => {});

        return { success: true, id } as const;
      }),
  }),

  /** Öffentliches Besucher-Tracking. */
  tracking: router({
    pageView: publicProcedure
      .input(
        z.object({
          page: z.enum(["home", "vsl", "termin", "webseite-termin", "ki-report-termin", "exit-plan-termin", "exit-plan", "ki-report", "traumwebseite"]),
          visitorId: z.string().max(64).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        await insertPageView({ page: input.page, visitorId: input.visitorId ?? null });
        return { success: true } as const;
      }),
  }),

  /** Admin-Bereich: Login + geschützte Daten. */
  admin: router({
    login: publicProcedure
      .input(z.object({ email: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!validateAdminCredentials(input.email, input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "E-Mail oder Passwort falsch." });
        }
        const token = await createAdminToken(input.email);
        ctx.res.cookie(ADMIN_COOKIE, token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return { success: true } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: -1,
      });
      return { success: true } as const;
    }),

    me: publicProcedure.query(async ({ ctx }) => {
      const ok = await isAdminRequest(ctx.req);
      return { isAdmin: ok } as const;
    }),

    stats: publicProcedure
      .input(z.object({ period: periodSchema }))
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return getStats(input.period as Period);
      }),

    series: publicProcedure
      .input(z.object({ days: z.number().min(1).max(90) }))
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return getDailySeries(input.days);
      }),

    leads: publicProcedure.query(async ({ ctx }) => {
      await assertAdmin(ctx.req);
      return listLeads();
    }),

    getWebhook: publicProcedure.query(async ({ ctx }) => {
      await assertAdmin(ctx.req);
      const url = await getSetting("webhook_url");
      return { url: url ?? "" } as const;
    }),

    setWebhook: publicProcedure
      .input(z.object({ url: z.string().max(2048) }))
      .mutation(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        await setSetting("webhook_url", input.url.trim());
        return { success: true } as const;
      }),

    testWebhook: publicProcedure.mutation(async ({ ctx }) => {
      await assertAdmin(ctx.req);
      const status = await fireWebhook({
        event: "test",
        message: "Test-Webhook aus dem Fast-Track Admin-Dashboard",
        createdAt: new Date().toISOString(),
      });
      return { status } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
