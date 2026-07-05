import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

type Page = "home" | "vsl" | "termin" | "webseite-termin" | "ki-report-termin" | "exit-plan-termin" | "exit-plan" | "ki-report" | "traumwebseite";

const STORAGE_KEY = "ft_visitor_id";

/** Liest oder erstellt eine anonyme Besucher-ID (localStorage). */
function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id =
        (crypto?.randomUUID?.() as string | undefined) ??
        `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

/**
 * Erfasst beim Mount einen Page-View für die angegebene Seite.
 * Jede Seite wird pro Mount genau einmal getrackt.
 */
export function usePageView(page: Page) {
  const track = trpc.tracking.pageView.useMutation();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const visitorId = getVisitorId();
    track.mutate({ page, visitorId: visitorId || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
}
