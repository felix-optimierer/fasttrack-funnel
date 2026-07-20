# Fast-Track Funnel – TODO

## Frontend (Funnel)
- [x] Opt-In Landing Page (/) mit Navy-Gold-Design, Logo, Trust-Badge, Formular
- [x] Lead-Erfassung über tRPC (leads.create) statt nur Navigation
- [x] 2FA-Sublabel vom Opt-In-Button entfernt
- [x] VSL-Page (/vsl) mit Video-Bereich, 7 Fallstudien, Doppel-TÜV-Siegel
- [x] Termin-Seite (/termin) mit Calendly-Embed-Platzhalter
- [x] Echte TÜV-Rheinland-Siegel (ID 0217466534 & 0217466539)
- [x] Responsives Design (mobil + desktop)
- [x] 404-Seite im Funnel-Design wiederhergestellt
- [x] SEO-Meta + Favicon

## Tracking & Backend
- [x] usePageView-Hook (anonyme visitorId via localStorage)
- [x] Page-View-Tracking auf Home, VSL, Termin
- [x] DB-Schema: leads, page_views, settings, users (migriert)
- [x] DB-Helfer (insertLead, insertPageView, getStats, getDailySeries, fireWebhook, Settings)
- [x] Webhook-Versand bei neuem Lead (konfigurierbare URL)
- [x] Owner-Benachrichtigung bei neuem Lead

## Admin
- [x] Admin-Auth (Passwort-Login, JWT-Cookie ft_admin, getrennt von Manus-OAuth)
- [x] tRPC-Router: admin.login/logout/me/stats/series/leads/getWebhook/setWebhook/testWebhook
- [x] Admin-Dashboard (/admin): Login-Screen + Dashboard
- [x] Statistik-Karten (Besucher Home/VSL/Termin + Leads, Tag/Woche/Monat)
- [x] Lead-Tabelle (Name, E-Mail, Telefon, Quelle, Webhook-Status, Datum)
- [x] Webhook-URL-Einstellung mit Speichern + Test-Button
- [x] /admin-Route in App.tsx registriert

## Tests
- [x] Vitest: Admin-Auth (Login, Cookie, Token, Schutz, Logout) – 8 Tests grün
- [x] Manueller API-Test des kompletten Flows (Login, Tracking, Lead, Stats, Webhook)
- [x] Testdaten aufgeräumt

## Änderungen (Runde 2)
- [x] /vsl in /anleitung umbenennen (Route, Datei, alle internen Verweise; /vsl leitet auf /anleitung um)
- [x] Echte Fallstudien recherchiert (Torben Möller, Alexander Reichl, Anica Bommert + echte 5★-Stimmen Marion, Nadine Peter, Desiré Nowak, Frederik Gerber)
- [x] Echte Fallstudien-Bilder gesichert & hochgeladen (Torben, Reichl); kleine/unscharfe Profilbilder durch elegante Monogramm-Karten ersetzt
- [x] Fallstudien authentisch auf /anleitung eingebaut (mit anklickbaren Quellen-Links)
- [x] Admin-Label "Besucher VSL" -> "Besucher Anleitung"
- [x] Tracking-Skript im <head> eingefügt: tracker.js?site-id=VT-3EDD3323-48250
- [x] Cookie-Skript im <body> eingefügt: cookie.js?site-id=VT-3EDD3323-48250

## Änderungen (Runde 3) – Favicon & SEO
- [x] Favicon-Set aus echtem PhysioFreiheit-Symbol erzeugt (16/32/48 ico, 96/180/192/512 png)
- [x] Kleine Favicons mit weißem, abgerundetem Hintergrund (Sichtbarkeit im dunklen Browser-Tab)
- [x] favicon.ico + 16/32 png in client/public; größere PNGs via /manus-storage
- [x] site.webmanifest mit 192/512 Icons + theme/background color
- [x] Apple-Touch-Icon (180, weißer Hintergrund)
- [x] OG-Bild 1200x630 (Symbol auf Navy) erzeugt & verlinkt
- [x] SEO: Title, Description, canonical, author, theme-color sauber gesetzt
- [x] OpenGraph (url/site_name/locale/image+Maße) + Twitter-Card vollständig
- [x] Auslieferung verifiziert (favicon.ico, png, manifest, og-image = HTTP 200)

## Änderungen (Runde 4) – Termin & Danke
- [x] TÜV-Logos (DoubleSeals) auf /termin eingebunden
- [x] Calendly-Analysegespräch eingebettet (calendly.com/d/d3f9-kc7-rc3/kostenloses-ki-analysegesprach)
- [x] Analysegespräch-Text auf /termin (kassenabhängig -> kassenunabhängig, Umsatz)
- [x] Sub-Headline + "100 % kostenlos"/"ca. 30 Minuten"/"ohne Verpflichtung"-Häkchen entfernt
- [x] /danke-Seite mit drei nächsten Schritten erstellt + TÜV-Siegel
- [x] Auto-Weiterleitung auf /danke nach Calendly-Buchung (event_scheduled)
- [x] Alte /vsl-Redirect-Route entfernt (Vsl.tsx existiert nicht mehr)

## Änderungen (Runde 5) – Exit-Plan & Impressum
- [x] Impressum/Datenschutz-Links auf allen Seiten auf physiofrei.de mit UTM-Parametern gesetzt
- [x] Neue /exit-plan-Seite nach Vorbild speedscaling.de/roas-5 mit PhysioFreiheit-Design und gegebenen Texten (Mockup-Platzhalter bis Bild kommt)

## Änderungen (Runde 6) – Exit-Plan Fix, KI-Report, Popup
- [x] /exit-plan: Badge zurück auf "INTERNES DOKUMENT (INKL. UMSETZUNGS-ROADMAP)", Über-Headline "Interne Schritt für Schritt Anleitung" kursiv darüber
- [x] Popup-Formular auf /exit-plan und /ki-report: Name, E-Mail, WhatsApp (mit DE-Flagge), Checkbox, Validierung, X-Close, goldener Button
- [x] /ki-report als Duplikat von /exit-plan mit neuen Texten (KI-Report 2026)
- [x] Route /ki-report registrieren + Tracking ergänzen

## Änderungen (Runde 7) – KI-Report Mockup-Bilder
- [x] /ki-report rechte Seite: Blurred-Hintergrundbild + scharfes Buch-Mockup zentriert darüber (wie SpeedScaling-Referenz)
- [x] Weißer Hintergrund bei beiden Bildern entfernt, als WebP hochgeladen
- [x] Gradient-Overlay blendet links sauber in Navy über
- [x] Mobile-Fallback zeigt scharfes Mockup direkt an
- [x] /ki-report: Button schmaler (nicht volle Breite, von rechts kürzer)
- [x] /ki-report: Headline umbrechen: "Der Physiopraxis" / "KI-Report 2026" (2 Zeilen)
- [x] /ki-report: Sub-Headline darf mehrzeilig sein (nicht erzwungen einzeilig)
- [x] /ki-report: Bild-System wie SpeedScaling: Blurred-Bild als Hintergrund rechts, scharfes Mockup zentriert darüber
- [x] /ki-report: Blurred-Bild als Fullscreen-Hintergrund (über ganze Seite, wie SpeedScaling mobil)
- [x] /ki-report: Mockup sauber zentriert über dem Blurred-Hintergrund
- [x] /ki-report Mobile: Reihenfolge = Text → Button → TÜV-Logos → Mockup → Häkchen
- [x] /ki-report Mobile: Hintergrund über die ganze Seite (wie SpeedScaling mobil)
- [x] /ki-report: Badge-Kasten mobil fixen (kein Overflow nach rechts)
- [x] /ki-report: Original-Bild (LeadmagnetKIReportMockupsBlurredweniger.png) direkt als WebP konvertieren OHNE Bearbeitung als Hintergrund nutzen
- [x] /exit-plan: Gleiches SpeedScaling-Layout-System anwenden (Fullscreen-BG + Mobile-Reihenfolge)

## Änderungen (Runde 8) – Mobile BG + Termin-Seiten
- [x] /ki-report + /exit-plan: Mobile Gradient reduzieren – Hintergrundbild auf ganzer Seite sichtbar
- [x] /termin → /webseite-termin umbenennen + Headline: "Sichere dir deine kostenlose KI-Praxisanalyse" + Sub-Headline löschen
- [x] /ki-report-termin erstellen: Badge "Dein Report ist per WhatsApp auf dem Weg zu dir" + Headline "Sichere dir jetzt deine 1:1-Praxisanalyse"
- [x] /exit-plan-termin erstellen: Badge "Der Exit-Plan ist per WhatsApp auf dem Weg zu dir" + Headline "Sichere dir jetzt deine 1:1-Praxisanalyse"
- [x] Nach Opt-in auf /ki-report → Weiterleitung zu /ki-report-termin
- [x] Nach Opt-in auf /exit-plan → Weiterleitung zu /exit-plan-termin
- [x] Alle neuen Routen in App.tsx registrieren

## Änderungen (Runde 9) – Hauptseite als Übersicht + Cleanup
- [x] /danke-termin: "Analysegespräch" → "Praxisanalyse" (grammatikalisch korrekt)
- [x] /termin komplett löschen (Route + Datei Termin.tsx)
- [x] Aktuelle Hauptseite (/) duplizieren auf /traumwebseite
- [x] Neue Hauptseite (/): Headline "Sichere dir unsere kostenlosen Inhalte", 3 Container (Traumwebseite, KI-Report, Exit-Plan) mit Beschreibung + Mockup + CTA-Button, TÜV-Logos, physiofreiheit.de-Link
- [x] Popup mobil: Trust-Hinweise (Daten sicher + SSL) einzeilig machen
- [x] Popup mobil: X-Button über der Headline mit eigenem Abstand (nicht auf der Headline)
- [x] /ki-report + /exit-plan Mobile: Abstand unter Mockup reduziert (mb-5 → mb-2)

## Änderungen (Runde 10) – Admin-Dashboard Komplett-Überarbeitung
- [x] DB: Termine-Tabelle (appointments) mit source-Feld (ki-report, exit-plan, traumwebseite)
- [x] DB: Webhooks-Tabelle pro Kanal (ki-report, exit-plan, traumwebseite) statt einzelner URL
- [x] DB: CPL-Feld oder Ad-Spend-Tracking (für spätere Meta-API-Anbindung)
- [x] Backend: Funnel-Stats pro Kanal (Besucher → Leads → Termine + CR + CPL)
- [x] Backend: Zeitfilter (Tag/Woche/Monat) für alle Stats
- [x] Backend: Webhook-CRUD pro Kanal (3 separate Webhooks)
- [x] Frontend: Hauptseite-Besucher im Dashboard anzeigen
- [x] Frontend: Funnel-Übersicht pro Kanal (Besucher → LP-CR → Leads → Termin-CR → Termine + CPL)
- [x] Frontend: Zeitfilter (Tag/Woche/Monat) umschaltbar
- [x] Frontend: Charts – CR-Entwicklung pro Kanal über Zeit
- [x] Frontend: Charts – Terminquote pro Kanal über Zeit
- [x] Frontend: Charts – CPL-Entwicklung pro Kanal über Zeit
- [x] Frontend: Einstellungen mit separaten Webhooks pro Kanal

## Änderungen (Runde 11) – Favicon & SEO-Optimierung
- [x] Neues Favicon (PhysioFreiheit_Favicon_Hell_Transparent) in WebP konvertieren und hochladen
- [x] Favicon in allen Größen (16, 32, 48, 96, 180, 192, 512) als WebP + ICO generieren
- [x] Favicon sauber benannt mit Alt-Text in HTML einbinden
- [x] SEO-Metatitel für alle Seiten setzen (/, /traumwebseite, /ki-report, /exit-plan, /webseite-termin, /ki-report-termin, /exit-plan-termin, /danke-termin, /admin)
- [x] SEO-Meta-Beschreibungen für alle Seiten setzen
- [x] site.webmanifest mit neuem Favicon aktualisieren

## Änderungen (Runde 12) – Fallstudien erweitern auf 9
- [x] Marion → "Marion Stegemann, Psychotherapeutin" + Link physiotherapie-greussen.de + Bild (WebP)
- [x] Desirée Nowak → Link physiotherapie-greussen.de + Bild (WebP)
- [x] Florian Zurheiden neu hinzufügen (schwarzwald-physio.de) + Bild + Fakten
- [x] Andrea Schaich neu hinzufügen (physioschaich.de) + Bild + Fakten
- [x] Alle Bilder komprimiert in WebP, Gesicht vollständig sichtbar
- [x] "7 Fallstudien" → "9 Fallstudien" überall anpassen (Traumwebseite, Anleitung, Home)

## Änderungen (Runde 13) – Admin-Dashboard Komplett-Überarbeitung (nach Dashboard-Paket)
- [x] DB: leads erweitern um utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, ip_address, user_agent, time_on_page, crm_status, notes
- [x] DB: page_views erweitern um utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, ip_address, user_agent
- [x] Backend: Lead-Erfassung (leads.create) um UTM, IP, User-Agent, Referrer erweitern
- [x] Backend: Page-View-Tracking um UTM, IP, User-Agent, Referrer erweitern
- [x] Backend: Verweildauer-Tracking (time_on_page) bei Lead-Erstellung oder separatem Endpoint
- [x] Backend: Lead-Detail-Endpoint (admin.leadDetail) mit allen erweiterten Feldern
- [x] Backend: UTM-Aggregation für Pivot-Tabelle
- [x] Backend: CRM-Status-Update (admin.updateLeadStatus) + Notizen (admin.updateLeadNotes)
- [x] Backend: CSV-Export-Endpoint für Leads
- [x] Backend: Ad-Costs CSV-Import-Endpoint
- [x] Frontend: Lead-Detail-Modal (Klick auf Lead → IP, UTM, User-Agent, Verweildauer, Referrer)
- [x] Frontend: Enhanced Submissions List (Suche, Filter, Sort, Pagination, CSV-Export)
- [x] Frontend: UTM-Pivot-Tabelle (Kreuztabelle UTM x Metriken)
- [x] Frontend: CRM-Kanban-Board (Drag&Drop Pipeline)
- [x] Frontend: Ad-Costs CSV-Upload + Kostenzuordnung
- [x] Frontend: Drill-Down Dialog (Klick auf Chart/KPI → Detail-Liste)

## Änderungen (Runde 14) – Fallstudien-Optimierung
- [x] Frederik Gerber → Tabea Gründer ersetzen (Webseite + Bewertung + Bild)
- [x] Desirée Nowak: Bild-Zuschnitt optimieren (Gesicht sauber sichtbar)
- [x] Florian Zurheiden: Bild-Zuschnitt optimieren (Gesicht sauber sichtbar)
- [x] Andrea Schaich: Logo statt Platzhalterbild verwenden

## Änderungen (Runde 15) – Fallstudien weiter optimieren
- [x] Nadine Peter → Klaus Leipholz ersetzen (kraftwerk-berlin.com + Bewertung Expertenmarkt)
- [x] Klaus Leipholz: Bild von kraftwerk-berlin.com + Webseite + Bewertungs-Link verlinken
- [x] Florian Zurheiden: Neues Bild (vom User bereitgestellt) austauschen
- [x] Anica Bommert: Neues Bild (vom User bereitgestellt) austauschen
- [x] Marion Stegemann: Verifizierte Bewertung verlinken
- [x] Alexander Reichl: Verifizierte Bewertung verlinken

## Änderungen (Runde 16) – Bilder schärfer, Bewertungs-Links, CTA-Text
- [x] Anica Bommert: Bild mit vollem Gesicht (nicht abgeschnitten)
- [x] Florian Zurheiden: Bild schärfer/besser
- [x] Verifizierte Bewertungs-Links für alle Fallstudien ergänzen (Anica, Desirée, Tabea, Florian, Andrea)
- [x] CTA-Button auf /anleitung: "Kostenlose Demo sichern" → "Kostenlose 1:1 Praxisanalyse sichern"

## Testoptimierer – A/B Testing System

### Phase 1: Database Schema
- [x] Add ab_projects table to drizzle schema
- [x] Add ab_elements table to drizzle schema
- [x] Add ab_tests table with status enum (running, paused, winner_a, winner_b, no_result, stopped, skipped)
- [x] Add ab_visitors table to drizzle schema
- [x] Add ab_notifications_log table to drizzle schema
- [x] Add ab_settings table for configurable significance thresholds
- [x] Run pnpm db:push to migrate

### Phase 2: Backend - Tracking & Tag Generator
- [x] Create server/testoptimierer/tag-generator.ts (dynamic JS script generation)
- [x] Create server/testoptimierer/tracking.ts (Express routes for impression/conversion)
- [x] Create server/testoptimierer/statistics.ts (Chi-Squared calculation)
- [x] Register Express routes in server with CORS headers
- [x] Anti-flicker implementation in generated script

### Phase 3: Backend - Admin tRPC & Heartbeat
- [x] Create server/testoptimierer/router.ts with all admin procedures
- [x] Projects CRUD (list, get, create, update, delete)
- [x] Elements CRUD (list, create, update, delete)
- [x] Tests CRUD (list, get, create, stop, skip, pause, resume)
- [x] Test status management (active, paused, stopped, skipped)
- [x] Stats queries (dashboard, scorecard, overall performance per project)
- [x] Settings procedures (get/update significance thresholds)
- [x] Create heartbeat job for significance checking (every 3 hours)
- [x] E-Mail notifications via notifyOwner (winner found, no significance)
- [x] Auto-promote winner when significance reached

### Phase 4: Frontend - Dashboard Pages
- [x] Create /testoptimierer route and navigation entry
- [x] Overview page with project cards grid
- [x] Project detail page with active test, elements, test history
- [x] New test page (select element, enter variant text, set traffic split)
- [x] Scorecard page (all completed tests as cards)
- [x] Setup page (create new project with domain + conversion URL)
- [x] Settings page (configurable significance levels with explanations)
- [x] Test status controls (active/paused/stopped/skipped dropdown per test)

### Phase 5: Frontend - Charts & Performance
- [x] Conversion rate chart with confidence bands
- [x] Overall project performance metric (weighted cumulative improvement)
- [x] Additional leads gained/lost calculation
- [x] Test history timeline view
- [x] Filter and sort options for scorecard

### Phase 6: Initial Projects Setup
- [x] Find CSS selectors for KI-Report landing page headlines (h1, main p.italic.text-gold, button)
- [x] Find CSS selectors for Exit-Plan landing page headlines (h1, main p.italic.text-gold, button)
- [x] Updated tag-generator with SPA retry logic (polling for React hydration)
- [x] Both pages share same conversion pattern (/danke)
- [x] Create initial projects in production (user will do via dashboard - selectors documented)

### Phase 7: Testing & Verification
- [x] Write vitest tests for statistics engine (15 tests passing)
- [x] Manual end-to-end verification (API tests all passing)
- [x] TypeScript compiles cleanly
- [x] All 23 tests passing
- [x] Save final checkpoint and deliver to user

## Testoptimierer – UX Overhaul (Runde 2)

### Navigation & Routing
- [x] Admin ↔ Testoptimierer Wechsel-Buttons (in beiden Dashboards)
- [x] Eigene URL-Unterseiten statt Tabs (/testoptimierer, /testoptimierer/scorecard, /testoptimierer/einstellungen, /testoptimierer/projekt/:id, /testoptimierer/neu, /testoptimierer/projekt/:id/neuer-test)

### Auto-Scan & Smart Setup
- [x] Backend: Auto-Scan-Endpoint der eine URL fetcht und testbare Elemente (h1, h2, p, button) mit aktuellem Text findet
- [x] Frontend: Beim Projekt-Erstellen automatisch Elemente scannen und vorschlagen
- [x] Aktueller Text wird automatisch aus dem Scan übernommen (kein manuelles Eintippen)
- [x] CSS-Selektor wird automatisch generiert (User muss keinen eingeben)
- [x] Alternative Headline per LLM vorschlagen beim Test-Start (suggestVariant mit 3 Varianten + Begründung)

### Embed & Integration
- [x] Erklärung warum nur 1 Tag nötig ist (Conversion per URL-Match, kein zweiter Tag)
- [x] Kopierbarer Manus-Prompt zum Einbetten des Tags (Domain + Script-URL)
- [x] Optional: Tag automatisch in eigene Seiten einbauen – NICHT umgesetzt (bewusst): Die eigenen Seiten sind SPAs, das Tag funktioniert bereits über die externe Script-URL. Ein Selbst-Embed würde nur Komplexität hinzufügen ohne Mehrwert, da der Tag ohnehin über die Domain eingebunden wird.

### Performance & Analytics
- [x] Wochenbasierte Performance-Ansicht (welche Woche wie viel gewonnen/verloren)
- [x] Timeline: Wann welche Tests gestartet/beendet wurden (Start/Ende-Datum + Dauer in Test-Historie)

### Signifikanz-Empfehlung
- [x] Prüfen und dokumentieren ob 0.20 p-Value bei 1.000 Besuchern sinnvoll ist (Antwort: Ja, gute Kombination)
- [x] Bessere Erklärungen in den Einstellungen mit konkreten Empfehlungen (Tabelle + OptiMind-Vergleich)

## Testoptimierer – Fixes (Runde 3)

### Auto-Scan Fix
- [x] scanPage liest für eigene SPA-Seiten die JSX-Quelldateien direkt (Route→Datei-Mapping)
- [x] Elemente auf /ki-report korrekt erkennen (h1, pre-headline, CTA-Button, sub-headline)

### Manuelles Element-Management
- [x] Button "Element hinzufügen" auf Projekt-Detail-Seite
- [x] Formular: Element-Typ, CSS-Selektor, aktueller Text
- [x] Element bearbeiten/löschen auf Projekt-Detail-Seite
- [x] "Neuer Test"-Seite zeigt Elemente korrekt an (auch manuell angelegte)

### Tag-Verifizierung
- [x] Testfunktion auf Projekt-Detail-Seite: "Tag testen" Button prüft ob Besucher erfasst werden

### UI-Cleanup
- [x] "Warum nur 1 Tag"-Hinweiscontainer auf Projekt-Detail-Seite entfernt

### Tag-Einbettung
- [x] Testoptimierer-Tag auf /ki-report eingebettet (useEffect mit script.src = /api/testoptimierer/tag/120001)

## Testoptimierer – Fixes (Runde 4)

### Tag-Verifizierung Fix
- [x] Tag-Verifizierung prüft nur ob Script geladen ist (kein Test nötig)
- [x] Verification-Endpoint angepasst: Prüft ob Script auf der Seite erreichbar ist

### Auto-Scan & Projekt-Management
- [x] Re-Scan Button auf Projekt-Detail-Seite (Elemente neu scannen, z.B. nach Seitenänderungen)
- [x] Projekt löschen mit Sicherheitsabfrage (Confirm-Dialog)
- [x] Auto-Scan erkennt Popup-Elemente (Headline + CTA im Popup/Modal)

### Scorecard Erweiterungen
- [x] LP Conversion Rate anzeigen (Start-CR vs. Aktuelle CR)
- [x] Klick auf Projekt in Scorecard → zeigt alle Tests mit Einzelergebnissen (expandierbar)

### Tag-Einbettung
- [x] Testoptimierer-Tag auf /exit-plan eingebettet (useEffect mit /api/testoptimierer/tag/150001)

## Terminseiten Umbau – WhatsApp CTA

- [x] KI-Report Terminseite: Headline "Herzlichen Glückwunsch, du hast dir den KI-Report 2026 gesichert."
- [x] KI-Report Terminseite: Badge "Klicke auf den Button und sende uns eine WhatsApp-Nachricht, um anschließend den KI-Report 2026 zu erhalten."
- [x] KI-Report Terminseite: Grüner WhatsApp-Button mit API-Link (Keyword: "KI-Report 2026", Nummer: +491791653801)
- [x] KI-Report Terminseite: Darunter weiterhin Calendly "Sichere dir jetzt deine 1:1-Praxisanalyse"
- [x] Exit-Plan Terminseite: Gleicher Umbau mit Keyword "Exit-Plan"

## Lead Automation Pipeline

- [x] Backend: Phone validation + E.164 formatting utility
- [x] Backend: KlickTipp integration (POST /subscriber/signin)
- [x] Backend: Google Sheets integration (via Make.com Webhook)
- [x] Backend: SalesSuite integration (contact find/create, deal create, note add)
- [x] Backend: Slack notification (via Make.com Webhook)
- [x] Backend: tRPC public procedure leads.create already calls processLeadAutomation
- [x] Frontend: KiReport.tsx already wired via leads.create (source='ki-report')
- [x] Frontend: ExitPlan.tsx already wired via leads.create (source='exit-plan')
- [x] Frontend: Home.tsx (Traumwebseite) already wired via leads.create (source='home'→'traumwebseite')
- [x] Frontend: UTM params already captured and passed to leads.create
- [x] Add KLICKTIPP_API_KEY and SALESSUITE_API_KEY as webdev secrets

## Admin Password & Production Fixes
- [x] Set admin password to user-provided value
- [x] Make Slack integration production-ready (via Make.com Webhook)
- [x] Make Google Sheets integration production-ready (via Make.com Webhook)
- [x] Deploy automation code (save checkpoint)

## Webhook Payload Erweiterung
- [x] Add fbclid to webhook payload
- [x] Add referrer to webhook payload
- [x] Add pageUrl to webhook payload
- [x] Add device (Gerät) to webhook payload
- [x] Add browser to webhook payload
- [x] Add userAgent to webhook payload
- [x] Add ipAddress to webhook payload
- [x] Frontend: Capture fbclid from URL and pass to leads.create
- [x] Frontend: Capture pageUrl and pass to leads.create

## Resend E-Mail Integration
- [x] Add RESEND_API_KEY as webdev secret
- [x] Install resend npm package
- [x] Build email helper module (server/email.ts)
- [x] Test email sending with Resend API
- [x] Provide domain verification instructions (domain already verified by user)

## Wöchentlicher Montags-KPI-Report
- [x] Send test email via Resend to felix@onboarding-prozesse.de
- [x] Build weekly KPI report email template (visitors, signups, conversion per funnel)
- [x] Set up Heartbeat job for Monday morning delivery (task_uid: aPzY94Nhe8f6xStgrjCEaH)

## Deduplizierung & Lead-Verwaltung
- [x] Add isDuplicate boolean column to leads table
- [x] Auto-detect duplicates on insert (same email within 2 min)
- [x] Exclude isDuplicate leads from all statistics/KPI queries
- [x] Admin: Single lead delete button with confirmation dialog
- [x] Admin: Bulk select (checkbox) + bulk delete with confirmation
- [x] Set up Heartbeat cron job for Monday 7:00 CET weekly report (task_uid: aPzY94Nhe8f6xStgrjCEaH)
- [x] Admin: Configurable table columns (show/hide, reorder via drag-and-drop)
- [x] Admin: All lead fields available as optional columns (UTM params, device, browser, etc.)

## Meta Ads Kosten-Automatisierung

### Backend
- [x] Discover Meta Marketing MCP tools and find campaign IDs
- [x] Build Meta Ads cost fetcher (query campaign spend by date)
- [x] Upsert logic: ad_spend table per day per funnel (update if exists)
- [x] Scheduled endpoint /api/scheduled/sync-ad-costs
- [x] Admin tRPC procedure for manual refresh (admin.refreshAdCosts)

### Frontend
- [x] Admin: "Ad-Kosten von heute aktualisieren" Button (MetaRefreshButton) im Dashboard
- [x] Show ad costs per day in existing ad-costs table

### Cron Jobs
- [x] AGENT Cron: Daily 00:30 UTC (sync previous day final costs) — combined into 6h cron (midnight run fetches yesterday's final data)
- [x] AGENT Cron: Every 6 hours (update current day costs) — task_uid: Wy3ll5AZi7dllxZgN0kWFs
- [x] Backfill last 3 days for VSL Traumwebseite campaign (Jul 14-16: €79.59, €243.19, €35.07 + Exit-Plan Jul 16: €91.31)

## Bug Fix: Ad-Spend Zeitfilter

- [x] Ad-Kosten (Ausgaben + CPL) müssen sich an den Zeitfilter (Heute/Diese Woche/Dieser Monat) anpassen — aktuell werden immer alle Kosten summiert statt nur die des gewählten Zeitraums

## SalesSuite: Telefonnummer bei bestehendem Kontakt updaten

- [x] Bei Schritt 2b (bestehender Kontakt) auch die Telefonnummer per PATCH aktualisieren

## SalesSuite: Deal-Logik anpassen

- [x] Neuer Deal wenn: kein Deal in Setter/Closer Pipeline ODER nur Deal(s) in Phase "Verkauft" — bei aktiven Deals (nicht "Verkauft") kein neuer Deal

## Telefonnummer-Validierung vor SalesSuite

- [x] libphonenumber einbauen: Normalisieren → Validieren → Korrigieren
- [x] Ungültige Nummern trotzdem eintragen, aber Hinweis in der Notiz ergänzen

## Impressum & Datenschutz Links korrigieren

- [x] Alle Impressum-Links auf physiofreiheit.de/impressum mit UTM-Parametern ändern
- [x] Alle Datenschutz-Links auf physiofreiheit.de/datenschutz mit UTM-Parametern ändern

## Admin Dashboard Verbesserungen

- [x] Überall €-Zeichen statt $-Zeichen verwenden (Euro-Icon aus lucide-react)
- [x] Leads-Diagramm: Balkendiagramm mit Gesamtzahl Leads pro Tag + gestrichelte Durchschnittslinie
- [x] Conversion-Rate-Diagramm: gestrichelte Linie für Tagesdurchschnitt CR + gewichteter Gesamtdurchschnitt (alle Besucher / alle Leads) als zweite Linie
