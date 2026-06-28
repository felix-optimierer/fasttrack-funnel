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
