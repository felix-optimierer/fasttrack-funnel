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
