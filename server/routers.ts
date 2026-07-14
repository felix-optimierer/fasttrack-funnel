import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  CHANNELS,
  bulkImportAdSpend,
  fireChannelWebhook,
  fireWebhook,
  getAllWebhooks,
  getChannelSeries,
  getDailySeries,
  getDistinctUtmValues,
  getFunnelStatsByChannel,
  getLeadById,
  getSetting,
  getStats,
  getUtmPivot,
  getWebhookByChannel,
  insertAppointment,
  insertLead,
  insertPageView,
  listAdSpend,
  listLeads,
  listLeadsEnhanced,
  setAdSpend,
  setSetting,
  setWebhookByChannel,
  updateLeadCrmStatus,
  updateLeadNotes,
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
import { testoptimiererRouter } from "./testoptimierer/router";
import { processLeadAutomation, type FunnelType } from "./leads/automation";

const periodSchema = z.enum(["day", "week", "month"]);
const channelSchema = z.enum(["ki-report", "exit-plan", "traumwebseite"]);

async function assertAdmin(req: any) {
  const ok = await isAdminRequest(req);
  if (!ok) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin-Login erforderlich." });
  }
}

/** IP-Adresse aus Request extrahieren. */
function getClientIp(req: any): string | null {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) {
    const first = (typeof forwarded === "string" ? forwarded : forwarded[0]).split(",")[0].trim();
    return first || null;
  }
  return req.socket?.remoteAddress ?? req.ip ?? null;
}

export const appRouter = router({
  system: systemRouter,
  testoptimierer: testoptimiererRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /** Öffentliche Lead-Erfassung + Webhook-Versand (per Channel). */
  leads: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          email: z.string().email().max(320),
          phone: z.string().min(3).max(64),
          source: z.string().max(64).optional(),
          // UTM-Parameter (vom Frontend übergeben)
          utmSource: z.string().max(255).optional(),
          utmMedium: z.string().max(255).optional(),
          utmCampaign: z.string().max(255).optional(),
          utmTerm: z.string().max(255).optional(),
          utmContent: z.string().max(255).optional(),
          referrer: z.string().max(2048).optional(),
          fbclid: z.string().max(512).optional(),
          pageUrl: z.string().max(2048).optional(),
          device: z.string().max(32).optional(),
          browser: z.string().max(128).optional(),
          timeOnPageSeconds: z.number().int().min(0).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const source = input.source ?? "home";
        const ipAddress = getClientIp(ctx.req);
        const userAgent = ctx.req.headers?.["user-agent"] ?? null;

        const id = await insertLead({
          name: input.name,
          email: input.email,
          phone: input.phone,
          source,
          webhookStatus: "pending",
          utmSource: input.utmSource ?? null,
          utmMedium: input.utmMedium ?? null,
          utmCampaign: input.utmCampaign ?? null,
          utmTerm: input.utmTerm ?? null,
          utmContent: input.utmContent ?? null,
          referrer: input.referrer ?? null,
          fbclid: input.fbclid ?? null,
          pageUrl: input.pageUrl ?? null,
          device: input.device ?? null,
          browser: input.browser ?? null,
          ipAddress,
          userAgent,
          timeOnPageSeconds: input.timeOnPageSeconds ?? null,
          crmStatus: "new",
        });

        const payload = {
          event: "new_lead",
          id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          source,
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          createdAt: new Date().toISOString(),
        };

        const status = await fireChannelWebhook(source, payload);
        if (id) await updateLeadWebhookStatus(id, status);

        notifyOwner({
          title: "Neuer Lead im Fast-Track Funnel",
          content: `${input.name} · ${input.email} · ${input.phone} (Quelle: ${source})`,
        }).catch(() => {});

        // ─── Lead Automation Pipeline (KlickTipp, Google Sheets, SalesSuite, Slack) ───
        // Parse first/last name from the full name
        const nameParts = input.name.trim().split(/\s+/);
        const firstName = nameParts[0] || input.name;
        const lastName = nameParts.slice(1).join(" ") || "";

        // Map source to funnel type
        const funnelMap: Record<string, FunnelType> = {
          "ki-report": "ki-report",
          "exit-plan": "exit-plan",
          "traumwebseite": "traumwebseite",
          "home": "traumwebseite",
        };
        const funnel: FunnelType = funnelMap[source] || "traumwebseite";

        // Fire-and-forget: run automation pipeline in background
        processLeadAutomation({
          firstName,
          lastName,
          email: input.email,
          phone: input.phone,
          funnel,
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmContent: input.utmContent,
          utmTerm: input.utmTerm,
          referrer: input.referrer,
          fbclid: input.fbclid,
          pageUrl: input.pageUrl,
          device: input.device,
          browser: input.browser,
          ipAddress: ipAddress ?? undefined,
          userAgent: userAgent ?? undefined,
        }).then((result) => {
          console.log(`[LeadAutomation] ${input.email} (${funnel}):`, JSON.stringify(result));
        }).catch((err) => {
          console.error(`[LeadAutomation] ${input.email} failed:`, err.message);
        });

        return { success: true, id } as const;
      }),
  }),

  /** Öffentliches Besucher-Tracking. */
  tracking: router({
    pageView: publicProcedure
      .input(
        z.object({
          page: z.enum([
            "home", "vsl", "termin", "webseite-termin",
            "ki-report-termin", "exit-plan-termin",
            "exit-plan", "ki-report", "traumwebseite",
          ]),
          visitorId: z.string().max(64).optional(),
          utmSource: z.string().max(255).optional(),
          utmMedium: z.string().max(255).optional(),
          utmCampaign: z.string().max(255).optional(),
          utmTerm: z.string().max(255).optional(),
          utmContent: z.string().max(255).optional(),
          referrer: z.string().max(2048).optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const ipAddress = getClientIp(ctx.req);
        const userAgent = ctx.req.headers?.["user-agent"] ?? null;

        await insertPageView({
          page: input.page,
          visitorId: input.visitorId ?? null,
          utmSource: input.utmSource ?? null,
          utmMedium: input.utmMedium ?? null,
          utmCampaign: input.utmCampaign ?? null,
          utmTerm: input.utmTerm ?? null,
          utmContent: input.utmContent ?? null,
          referrer: input.referrer ?? null,
          ipAddress,
          userAgent,
        });
        return { success: true } as const;
      }),
  }),

  /** Öffentlicher Endpoint für Calendly-Webhook. */
  appointments: router({
    create: publicProcedure
      .input(
        z.object({
          source: channelSchema,
          name: z.string().max(255).optional(),
          email: z.string().email().max(320).optional(),
          eventUri: z.string().max(512).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const id = await insertAppointment({
          source: input.source,
          name: input.name ?? null,
          email: input.email ?? null,
          eventUri: input.eventUri ?? null,
        });

        notifyOwner({
          title: "Neuer Termin gebucht",
          content: `${input.name ?? "Unbekannt"} · ${input.email ?? "-"} (Kanal: ${input.source})`,
        }).catch(() => {});

        return { success: true, id } as const;
      }),
  }),

  /** Admin-Bereich. */
  admin: router({
    login: publicProcedure
      .input(z.object({ email: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!validateAdminCredentials(input.email, input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "E-Mail oder Passwort falsch." });
        }
        const token = await createAdminToken(input.email);
        ctx.res.cookie(ADMIN_COOKIE, token, {
          httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return { success: true } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE, { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: -1 });
      return { success: true } as const;
    }),

    me: publicProcedure.query(async ({ ctx }) => {
      const ok = await isAdminRequest(ctx.req);
      return { isAdmin: ok } as const;
    }),

    // ─── Stats ────────────────────────────────────────────────────────────
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

    // ─── Leads (legacy simple list) ─────────────────────────────────────
    leads: publicProcedure.query(async ({ ctx }) => {
      await assertAdmin(ctx.req);
      return listLeads();
    }),

    // ─── Enhanced Leads (search, filter, pagination) ────────────────────
    leadsEnhanced: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        source: z.string().optional(),
        crmStatus: z.string().optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        limit: z.number().min(1).max(200).optional(),
        offset: z.number().min(0).optional(),
      }))
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return listLeadsEnhanced(input);
      }),

    // ─── Lead Detail ────────────────────────────────────────────────────
    leadDetail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return getLeadById(input.id);
      }),

    // ─── CRM Status Update ──────────────────────────────────────────────
    updateCrmStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        crmStatus: z.string().max(32),
      }))
      .mutation(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        await updateLeadCrmStatus(input.id, input.crmStatus);
        return { success: true } as const;
      }),

    // ─── Lead Notes ─────────────────────────────────────────────────────
    updateNotes: publicProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string().max(10000),
      }))
      .mutation(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        await updateLeadNotes(input.id, input.notes);
        return { success: true } as const;
      }),

    // ─── UTM Pivot ──────────────────────────────────────────────────────
    utmPivot: publicProcedure
      .input(z.object({ period: periodSchema }))
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return getUtmPivot(input.period as Period);
      }),

    // ─── Distinct UTM Values (for filter dropdowns) ─────────────────────
    utmValues: publicProcedure.query(async ({ ctx }) => {
      await assertAdmin(ctx.req);
      return getDistinctUtmValues();
    }),

    // ─── Per-Channel Funnel Stats ───────────────────────────────────────
    funnelStats: publicProcedure
      .input(z.object({ period: periodSchema }))
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return getFunnelStatsByChannel(input.period as Period);
      }),

    channelSeries: publicProcedure
      .input(z.object({ days: z.number().min(1).max(90) }))
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return getChannelSeries(input.days);
      }),

    // ─── Webhooks ───────────────────────────────────────────────────────
    getWebhooks: publicProcedure.query(async ({ ctx }) => {
      await assertAdmin(ctx.req);
      return getAllWebhooks();
    }),

    getWebhook: publicProcedure
      .input(z.object({ channel: channelSchema }).optional())
      .query(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        if (input?.channel) {
          const wh = await getWebhookByChannel(input.channel);
          return { url: wh?.url ?? "", active: wh?.active ?? true };
        }
        const url = await getSetting("webhook_url");
        return { url: url ?? "", active: true };
      }),

    setWebhook: publicProcedure
      .input(z.object({ channel: channelSchema, url: z.string().max(2048), active: z.boolean().optional() }))
      .mutation(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        await setWebhookByChannel(input.channel, input.url.trim(), input.active ?? true);
        return { success: true } as const;
      }),

    testWebhook: publicProcedure
      .input(z.object({ channel: channelSchema }).optional())
      .mutation(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        const payload = { event: "test", channel: input?.channel ?? "global", message: "Test-Webhook aus dem Fast-Track Admin-Dashboard", createdAt: new Date().toISOString() };
        if (input?.channel) {
          const status = await fireChannelWebhook(input.channel, payload);
          return { status } as const;
        }
        const status = await fireWebhook(payload);
        return { status } as const;
      }),

    // ─── Ad Spend ───────────────────────────────────────────────────────
    setAdSpend: publicProcedure
      .input(z.object({
        channel: channelSchema,
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        amountCents: z.number().int().min(0),
        campaignName: z.string().max(255).optional(),
        notes: z.string().max(1000).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        await setAdSpend(input.channel, input.date, input.amountCents, input.campaignName, input.notes);
        return { success: true } as const;
      }),

    bulkAdSpend: publicProcedure
      .input(z.object({
        rows: z.array(z.object({
          channel: z.string().max(64),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          amountCents: z.number().int().min(0),
          campaignName: z.string().max(255).optional(),
          notes: z.string().max(1000).optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        await assertAdmin(ctx.req);
        return bulkImportAdSpend(input.rows);
      }),

    listAdSpend: publicProcedure.query(async ({ ctx }) => {
      await assertAdmin(ctx.req);
      return listAdSpend();
    }),
  }),
});

export type AppRouter = typeof appRouter;
