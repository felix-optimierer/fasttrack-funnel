// The public funnel remains a client-rendered SPA. This route-aware shell provides
// genuine crawlable legal links without changing the form, tracking or CTA tree.
const ORIGIN = "https://go.physiofreiheit.de";

const LEGAL_PAGES: Record<string, { title: string; description: string }> = {
  "/impressum": {
    title: "Impressum | Physio Freiheit",
    description: "Impressum der Bewegungsoptimierer GmbH für go.physiofreiheit.de.",
  },
  "/datenschutz": {
    title: "Datenschutzerklärung | Physio Freiheit",
    description: "Datenschutzerklärung der Bewegungsoptimierer GmbH für go.physiofreiheit.de.",
  },
};

function replaceMeta(html: string, attribute: string, value: string, content: string): string {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(<meta\\s+${attribute}="${escaped}"\\s+content=")[^"]*("\\s*/?>)`, "i");
  return html.replace(pattern, (_match, before: string, after: string) => before + content + after);
}

export function renderSeoLegalShell(html: string, pathname: string): string {
  const legal = LEGAL_PAGES[pathname];
  if (pathname !== "/" && !legal) {
    return html.replace("<!--seo-legal-navigation-->", "");
  }

  if (legal) {
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${legal.title}</title>`);
    html = replaceMeta(html, "name", "description", legal.description);
    html = replaceMeta(html, "property", "og:title", legal.title);
    html = replaceMeta(html, "property", "og:description", legal.description);
    html = replaceMeta(html, "name", "twitter:title", legal.title);
    html = replaceMeta(html, "name", "twitter:description", legal.description);
    html = replaceMeta(html, "property", "og:url", ORIGIN + pathname);
    html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/i,
      (_match, before: string, after: string) => before + ORIGIN + pathname + after);
  }

  const links = pathname === "/"
    ? `<a href="https://physiofreiheit.de/">Physio Freiheit</a><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a>`
    : `<a href="${ORIGIN}/">Kostenlose Inhalte für Praxisinhaber</a>${pathname === "/impressum"
      ? `<a href="/datenschutz">Datenschutz</a>`
      : `<a href="/impressum">Impressum</a>`}`;

  return html.replace("<!--seo-legal-navigation-->",
    `<nav class="seo-legal-nav" aria-label="Weitere Seiten">${links}</nav>`);
}
