import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";

const state = vi.hoisted(() => ({ search: "" }));
vi.mock("wouter", () => ({ useLocation: () => ["/selbstzahler", vi.fn()], useSearch: () => state.search }));
vi.mock("@/hooks/usePageView", () => ({ usePageView: vi.fn() }));
vi.mock("@/hooks/useTrackingData", () => ({ useTrackingData: () => ({}) }));
vi.mock("@/lib/trpc", () => ({ trpc: { leads: { create: { useMutation: () => ({ isPending: false }) } } } }));

import Selbstzahler from "../client/src/pages/Selbstzahler";
import DankeSelbstzahler from "../client/src/pages/DankeSelbstzahler";
import Termin from "../client/src/pages/Termin";
import { LeadPopup } from "../client/src/components/LeadPopup";
import { TripleSeals } from "../client/src/components/funnel";
import { SEO_CONFIG } from "../client/src/lib/seo-config";

beforeEach(() => { state.search = ""; });

describe("Selbstzahler V1", () => {
  it("shows the requested headline, benefits and honest pre-registration instead of immediate download", () => {
    const html = renderToStaticMarkup(createElement(Selbstzahler));
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(text).toContain("Kostenloser Report enthüllt:");
    expect(text).toContain("Wie deine Angestellten-Therapeuten endlich täglich");
    expect(text).toContain("Selbstzahler-Angebote verkaufen");
    expect(text).toContain("Mehr Gewinn bei weniger Behandlungsstunden");
    expect(text).toContain("Endlich kassenunabhängige Online-Umsätze in deiner Physiopraxis");
    expect(text).toContain("Report kostenlos vormerken");
    expect(text).toContain("Versand nächste Woche nach Fertigstellung");
    expect(text).toContain("Mockup folgt");
    expect(text).not.toContain("Jetzt kostenlos herunterladen");
  });

  it("keeps source and thank-you redirect specific to the new funnel", () => {
    const source = readFileSync(new URL("../client/src/pages/Selbstzahler.tsx", import.meta.url), "utf8");
    expect(source).toContain('source="selbstzahler"');
    expect(source).toContain('redirectTo="/danke-selbstzahler"');
    expect(source).toContain('submitLabel="Report kostenlos vormerken"');
  });

  it("thanks registrants transparently and offers a genuine booking link without making booking mandatory", () => {
    const html = renderToStaticMarkup(createElement(DankeSelbstzahler));
    expect(html).toContain("Das ging schnell!");
    expect(html).toContain("finalen Schliff bei unserem Designer");
    expect(html).toContain("nächste Woche fertig");
    expect(html).toContain('href="/termin?quelle=selbstzahler"');
    expect(html).toContain("unabhängig von einer Buchung");
    expect(html).not.toContain("wistia-player");
  });

  it("uses dedicated canonical URLs", () => {
    expect(SEO_CONFIG.selbstzahler.canonical).toBe("https://go.physiofreiheit.de/selbstzahler");
    expect(SEO_CONFIG.dankeSelbstzahler.canonical).toBe("https://go.physiofreiheit.de/danke-selbstzahler");
  });

  it("customizes the popup CTA while preserving existing default download copy", () => {
    const props = { open: true, onClose: () => {}, headline: "Vormerken", source: "selbstzahler" };
    expect(renderToStaticMarkup(createElement(LeadPopup, { ...props, submitLabel: "Report kostenlos vormerken" }))).toContain("Report kostenlos vormerken");
    expect(renderToStaticMarkup(createElement(LeadPopup, props))).toContain("Jetzt kostenlos herunterladen");
  });

  it("uses the shared Calendly booking for the new context and leaves other entry paths unchanged", () => {
    state.search = "quelle=selbstzahler";
    const custom = renderToStaticMarkup(createElement(Termin));
    expect(custom).toContain("kostenlose 1:1 Praxisanalyse");
    expect(custom).toContain("utm_campaign=selbstzahler");
    state.search = "";
    const normal = renderToStaticMarkup(createElement(Termin));
    expect(normal).toContain("kostenlose 1:1 KI-Praxisanalyse");
    expect(normal).not.toContain("utm_campaign=selbstzahler");
  });
});

describe("compact three-seal row", () => {
  it("keeps three real, uncropped seals and individual verification links in one row", () => {
    const html = renderToStaticMarkup(createElement(TripleSeals));
    expect(html).toContain("grid-cols-3");
    expect(html).not.toContain("grid-cols-2");
    expect(html).not.toContain("col-span-2");
    expect(html).not.toContain("flex-wrap");
    expect(html.match(/<img /g)).toHaveLength(3);
    expect(html.match(/object-contain/g)).toHaveLength(3);
    for (const id of ["0217466534", "0217466539", "0217466756"]) {
      expect(html).toContain(`https://www.certipedia.com/quality_marks/${id}`);
    }
  });
});
