import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderSeoLegalShell } from "./seo-legal-html";

const template = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");

describe("crawlbare Footer-Navigation", () => {
  it("liefert Root mit Self-Canonical und drei echten Links im initialen HTML", () => {
    const html = renderSeoLegalShell(template, "/");
    expect(html).toContain('<link rel="canonical" href="https://go.physiofreiheit.de/"');
    expect(html).toContain('<meta name="robots" content="index, follow"');
    for (const url of ["https://physiofreiheit.de/", "/impressum", "/datenschutz"]) {
      expect(html).toContain(`<a href="${url}">`);
    }
    expect(html).not.toMatch(/<a[^>]*rel="nofollow"/);
    expect((html.match(/<nav class="seo-legal-nav"/g) || []).length).toBe(1);
  });

  for (const [path, title] of [
    ["/impressum", "Impressum | Physio Freiheit"],
    ["/datenschutz", "Datenschutzerklärung | Physio Freiheit"],
  ]) {
    it(`verlinkt von ${path} auf Root und zeigt eigene Metadaten`, () => {
      const html = renderSeoLegalShell(template, path);
      expect(html).toContain('<a href="https://go.physiofreiheit.de/">');
      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toContain(`<link rel="canonical" href="https://go.physiofreiheit.de${path}"`);
      expect(html).toContain(`<meta property="og:url" content="https://go.physiofreiheit.de${path}"`);
    });
  }

  it("greift auf anderen Funnels nicht in die Navigation ein", () => {
    const html = renderSeoLegalShell(template, "/ki-report");
    expect(html).not.toContain("seo-legal-navigation-->");
    expect(html).not.toContain('<nav class="seo-legal-nav"');
  });
});
