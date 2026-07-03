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
