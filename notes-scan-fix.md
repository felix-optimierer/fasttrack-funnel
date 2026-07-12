# KiReport.tsx Element Structure (for Auto-Scan)

## Elements to detect:
1. **Pre-Headline (Badge)**: `div.inline-block.rounded-sm.border.border-gold/50` → "Internes Dokument (inkl. KI-Agenten & Prompts für Physiopraxen)"
2. **Sub-Headline**: `p.italic.text-gold` → "Von 60-Stunden-Wochen zum 3-Tage-Wochenende"  
3. **Main Headline (H1)**: `h1` → "Der Physiopraxis KI-Report 2026"
4. **CTA Button**: GoldButton component → "Jetzt kostenlos herunterladen"

## Problem:
- The page is a React SPA. When fetched with plain HTTP, the HTML only contains `<div id="root"></div>` + JS bundles.
- Cheerio sees no content because React hasn't rendered.

## Solution approach:
- For URLs that match the app's own domain (go.physiofreiheit.de or the dev server), parse the SOURCE FILES directly instead of fetching the rendered HTML.
- Map route → component file → extract elements from JSX source code using regex/AST.
- This is more reliable than headless browser and works instantly.

## Route → File mapping (from App.tsx):
- /ki-report → KiReport.tsx
- /exit-plan → ExitPlan.tsx  
- /traumwebseite → Traumwebseite.tsx
- / → Home.tsx

## CSS Selectors that work on rendered page:
- h1 → main headline
- main p.italic.text-gold → sub-headline (pre-headline above h1)
- div.inline-block.border-gold\\/50 → badge/pre-headline
- button (GoldButton renders as <button>) → CTA
