import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";

const state = vi.hoisted(() => ({ search: "" }));
vi.mock("wouter", () => ({ useLocation: () => ["/selbstzahler", vi.fn()], useSearch: () => state.search }));
vi.mock("@/hooks/usePageView", () => ({ usePageView: vi.fn() }));
vi.mock("@/hooks/useTrackingData", () => ({ useTrackingData: () => ({}) }));
vi.mock("@/lib/trpc", () => ({ trpc: { leads: { create: { useMutation: () => ({ isPending: false }) } } } }));

import Selbstzahler from "../client/src/pages/Selbstzahler";
import DankeSelbstzahler from "../client/src/pages/DankeSelbstzahler";
import Home from "../client/src/pages/Home";
import Termin from "../client/src/pages/Termin";
import { LeadPopup } from "../client/src/components/LeadPopup";
import { TripleSeals, Footer } from "../client/src/components/funnel";
import { SEO_CONFIG } from "../client/src/lib/seo-config";

const CTA = "Kostenlosen Report sichern";
const DELAYED_OR_IMMEDIATE_COPY = /vormerk|merke dir|finalisiert|finalen Schliff|nächste Woche|Fertigstellung|sofort|herunterladen|Download|in Kürze.*zugestellt/i;
const pageSource = (name: string) => readFileSync(new URL(`../client/src/pages/${name}.tsx`, import.meta.url), "utf8");
const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// Render the real popup with the actual literal props used by the landing page,
// rather than asserting against a separately maintained example of its copy.
function selbstzahlerPopupProps(): ComponentProps<typeof LeadPopup> {
  const popup = pageSource("Selbstzahler").match(/<LeadPopup\s[\s\S]*?\/>/)?.[0];
  if (!popup) throw new Error("Selbstzahler popup missing");
  const prop = (name: string) => {
    const value = popup.match(new RegExp(`${name}="([^"]*)"`))?.[1];
    if (!value) throw new Error(`Popup prop ${name} missing`);
    return value;
  };
  return {
    open: true,
    onClose: () => {},
    headline: prop("headline"),
    subtext: prop("subtext"),
    source: prop("source"),
    redirectTo: prop("redirectTo"),
    submitLabel: prop("submitLabel"),
  };
}

beforeEach(() => { state.search = ""; });

describe("Selbstzahler V1", () => {
  it("retains the requested headline and benefits with the exact secure-report CTA, without timing promises", () => {
    const html = renderToStaticMarkup(createElement(Selbstzahler));
    const text = plainText(html);
    expect(text).toContain("Kostenloser Report enthüllt:");
    expect(text).toContain("Wie deine Angestellten-Therapeuten endlich täglich");
    expect(text).toContain("Selbstzahler-Angebote verkaufen");
    expect(text).toContain("Mehr Gewinn bei weniger Behandlungsstunden");
    expect(text).toContain("Endlich kassenunabhängige Online-Umsätze in deiner Physiopraxis");
    expect(html).toMatch(/<button[^>]*>[\s\S]*?<span[^>]*>Kostenlosen Report sichern /);
    expect(text).toContain(CTA);
    expect(text).toContain("Mockup folgt");
    expect(text).not.toMatch(DELAYED_OR_IMMEDIATE_COPY);
  });

  it("includes the requested profit goal in the full headline with a linked disclaimer and no goal box", () => {
    const html = renderToStaticMarkup(createElement(Selbstzahler));
    const text = plainText(html);
    const headline = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
    expect(plainText((headline || "").replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/, "")).trim()).toBe("Wie deine Angestellten-Therapeuten endlich täglich Selbstzahler-Angebote verkaufen für 1.000 € extra Gewinn pro Therapeut im Monat");
    expect(html).toMatch(/<h1 aria-describedby="selbstzahler-ziel-hinweis"[^>]*>/);
    expect(html).toContain('id="selbstzahler-ziel-hinweis"');
    expect(text).toContain("Gewinnziel, keine Ergebnisgarantie.");
    expect(text).toContain("deinen individuellen Angeboten, deiner Marge und deiner Umsetzung");
    expect(text).not.toMatch(/Studie|garantierte[rsn]? (Gewinn|Ertrag)/i);
    expect(text).not.toContain("Dein Ziel:");
    expect(pageSource("Selbstzahler")).not.toContain('rounded-xl border border-gold/30 bg-gold/10 p-4');
  });

  it("links the headline star to one note below the footer logo, not near the headline or CTA", () => {
    const html = renderToStaticMarkup(createElement(Selbstzahler));
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || "";
    const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1] || "";
    expect(main).toContain('href="#selbstzahler-ziel-hinweis"');
    expect(main).not.toContain("Gewinnziel, keine Ergebnisgarantie.");
    expect(main).not.toContain('id="selbstzahler-ziel-hinweis"');
    expect(footer).toContain("* Gewinnziel, keine Ergebnisgarantie.");
    expect(footer.indexOf("<img")).toBeLessThan(footer.indexOf('id="selbstzahler-ziel-hinweis"'));
    expect(footer.indexOf('id="selbstzahler-ziel-hinweis"')).toBeLessThan(footer.indexOf("©"));
    expect(html.match(/id="selbstzahler-ziel-hinweis"/g)).toHaveLength(1);
  });

  it("leaves shared footers on other pages without the Selbstzahler footnote", () => {
    expect(renderToStaticMarkup(createElement(Footer))).not.toContain("Gewinnziel");
    expect(renderToStaticMarkup(createElement(Home))).not.toContain("selbstzahler-ziel-hinweis");
    expect(renderToStaticMarkup(createElement(DankeSelbstzahler))).not.toContain("selbstzahler-ziel-hinweis");
  });

  it("places the full-width headline above, not inside, the narrower content columns", () => {
    const html = renderToStaticMarkup(createElement(Selbstzahler));
    const source = pageSource("Selbstzahler");
    expect(html.indexOf("data-selbstzahler-intro")).toBeLessThan(html.indexOf("<h1"));
    expect(html.indexOf("</h1>")).toBeLessThan(html.indexOf("data-selbstzahler-content"));
    expect(html).toMatch(/<h1[^>]*class="w-full /);
    expect(source).toContain('data-selbstzahler-intro className="mb-7 w-full lg:mb-9"');
  });

  it("keeps source and thank-you redirect specific to the new funnel", () => {
    const props = selbstzahlerPopupProps();
    expect(props.source).toBe("selbstzahler");
    expect(props.redirectTo).toBe("/danke-selbstzahler");
    expect(props.submitLabel).toBe(CTA);
    expect(props.headline).toBe("An wen dürfen wir den Selbstzahler-Report senden?");
  });

  it("uses the same exact CTA on the home card without pre-registration or delivery dates", () => {
    const html = renderToStaticMarkup(createElement(Home));
    const text = plainText(html);
    expect(text).toContain("Der Selbstzahler-Report");
    expect(text).toContain(CTA);
    expect(text).not.toMatch(DELAYED_OR_IMMEDIATE_COPY);
    expect(pageSource("Home")).toContain('href: "/selbstzahler"');
  });

  it("preserves the complete thank-you designer and delivery copy and optional booking", () => {
    const html = renderToStaticMarkup(createElement(DankeSelbstzahler));
    const text = plainText(html);
    expect(text).toContain("Das ging schnell!");
    expect(text).toContain("Der letzte Schliff läuft gerade.");
    expect(text).toContain("Der Report liegt gerade beim finalen Schliff bei unserem Designer. Sobald er nächste Woche fertig ist, senden wir ihn dir sofort zu. Du musst dich dafür nicht noch einmal eintragen.");
    expect(text).toContain("Du musst nicht bis nächste Woche warten");
    expect(html).toContain('href="/termin?quelle=selbstzahler"');
    expect(text).toContain("Kostenlos &amp; unverbindlich. Dein Report bleibt unabhängig von einer Buchung für dich vorgemerkt.");
    expect(html).not.toContain("wistia-player");
  });

  it("uses dedicated canonicals and excludes delayed or immediate promises from front-facing SEO", () => {
    expect(SEO_CONFIG.selbstzahler.canonical).toBe("https://go.physiofreiheit.de/selbstzahler");
    expect(SEO_CONFIG.dankeSelbstzahler.canonical).toBe("https://go.physiofreiheit.de/danke-selbstzahler");
    for (const config of [SEO_CONFIG.home, SEO_CONFIG.selbstzahler]) {
      expect(`${config.title} ${config.description}`).not.toMatch(DELAYED_OR_IMMEDIATE_COPY);
    }
    expect(SEO_CONFIG.selbstzahler.description).toContain(CTA);
    expect(SEO_CONFIG.dankeSelbstzahler.description).toBe("Dein Selbstzahler-Report wird finalisiert. Buche in der Zwischenzeit deine kostenlose Praxisanalyse und passe die Strategie auf deine Physiopraxis an.");
  });

  it("renders the actual Selbstzahler popup without delayed text or immediate-download promises", () => {
    const html = renderToStaticMarkup(createElement(LeadPopup, selbstzahlerPopupProps()));
    const text = plainText(html);
    expect(html).toContain('role="dialog"');
    expect(text).toContain(CTA);
    expect(text).toContain("inklusive WhatsApp-Nummer");
    expect(text).not.toMatch(DELAYED_OR_IMMEDIATE_COPY);
  });

  it("preserves the existing default download CTA for other funnels", () => {
    const props = { open: true, onClose: () => {}, headline: "KI-Report sichern", source: "ki-report" };
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

describe("responsive three-seal row", () => {
  it("keeps the three real, uncropped seals and verification links in their stable left-to-right order", () => {
    const html = renderToStaticMarkup(createElement(TripleSeals));
    expect(html).toContain("grid-cols-3");
    expect(html).not.toMatch(/(?:\w+:)?grid-cols-[12]|col-span|flex-wrap|object-cover|overflow-hidden|order-/);
    expect(html.match(/<img /g)).toHaveLength(3);
    expect(html.match(/object-contain/g)).toHaveLength(3);
    const ids = Array.from(html.matchAll(/href="https:\/\/www\.certipedia\.com\/quality_marks\/(\d+)"/g), ([, id]) => id);
    expect(ids).toEqual(["0217466534", "0217466539", "0217466756"]);
    const sealAlts = Array.from(html.matchAll(/alt="([^"]+)"/g), ([, alt]) => alt);
    expect(sealAlts).toEqual([
      "TÜV Rheinland Business Development Professional – Robin Nürnberg, ID 0217466534",
      "TÜV Rheinland Business Development Professional – Felix Brandt, ID 0217466539",
      "TÜV Rheinland Experte für Verkaufspsychologie – Felix Brandt, ID 0217466756",
    ]);
  });

  it("uses full available width, intrinsic proportions and a bounded 72px desktop height", () => {
    const html = renderToStaticMarkup(createElement(TripleSeals));
    expect(html).toContain("grid w-full min-w-0 max-w-2xl");
    expect(html.match(/h-auto max-h-18 w-full max-w-full/g)).toHaveLength(3);
    expect(html.match(/aspect-\[217\/80\]/g)).toHaveLength(2);
    expect(html.match(/aspect-\[434\/159\]/g)).toHaveLength(1);
    expect(html.match(/class="min-w-0/g)).toHaveLength(3);
    expect(html).not.toMatch(/(?:^|[ :"])h-(?:10|12)(?:\s|")|min-w-\[|w-\[|max-w-lg/);
  });

  it.each(["Home", "Traumwebseite", "Selbstzahler", "KiReport", "ExitPlan"])("prevents shrinking flex wrappers around seals on %s", (page) => {
    const source = pageSource(page);
    const wrappers = Array.from(source.matchAll(/<div className="([^"]+)">\s*<TripleSeals\s*\/>/g), ([, classes]) => classes);
    expect(wrappers.length).toBeGreaterThan(0);
    for (const classes of wrappers) expect(classes.split(" ")).toContain("w-full");
  });
});
