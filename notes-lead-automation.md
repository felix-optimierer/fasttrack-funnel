# Lead Automation – Complete API Reference

## SalesSuite CRM API
- **Base URL**: `https://api.salessuite.com/api`
- **Auth Header**: `x-api-key: <API_KEY>`
- **Env var**: `SalesSUite_CRM_API_KEY`
- **Tenant**: Bewegungsoptimierer GmbH

### Key Endpoints
- `GET /v1/auth` - Verify auth
- `GET /v1/contact/by-email?email=X` - Find contact by email (returns array of {contact, contactPersons[]})
- `POST /v1/contact/create` - Create contact (body: JSON with properties)
- `PATCH /v2/contact/{contactId}` - Update contact properties
- `GET /v1/deal/by-email?email=X` - Find deals by email
- `POST /v2/deal` - Create deal (body: { contactId*, phaseId*, name*, ... })
- `PATCH /v2/deal/{dealId}` - Update deal (body: { phaseId, name, ... })
- `POST /v1/note` - Create note (Content-Type: text/html, query: contactId &| dealId)
- `GET /v1/pipelines` - List pipelines with phases

### Setter/Closer Pipeline (ID: cmr0xq72s01od8u01h78u0wz1)
- "Anfrage eingegangen": `cmr0xq73101oe8u01s0bobpab`
- "Nachverfolgung": `cmr0xq73101of8u010s9j4udf`
- "Qualifiziert (ohne Termin)": `cmr0xq73101og8u015qs513rl`
- "Analysegespräch (SC)": `cmr0xq73101oh8u0173dqguzs`
- "Beratungsgespräch (CC)": `cmr0xq73101oi8u01623i7dm8`
- "Verkauft": `cmr0xq73101oj8u01a4dzu7qa`
- "Nicht verkauft": `cmr0xq73101ok8u01i9ngv216`
- "Unqualifiziert": `cmr0xq73101ol8u01theciuq9`

### Contact Create Body (POST /v1/contact/create)
```json
{
  "companyName": "Praxisname",
  "contactPersons": [{ "firstName": "...", "lastName": "...", "email": "...", "phone": "..." }],
  "utm_source": "...", "utm_medium": "...", "utm_campaign": "...", "utm_content": "...", "utm_term": "...",
  "x_leadmagnet_ki_report": "2026-07-14T10:30:00.000Z",
  "x_lead_erhalten_am": "2026-07-14"
}
```

### Contact Custom Properties
- `x_leadmagnet_ki_report` - DateTime ISO 8601
- `x_leadmagnet_exit_plan` - DateTime ISO 8601
- `x_vsl_traumwebseite_lead` - DateTime ISO 8601
- `x_lead_erhalten_am` - Date ISO 8601
- `x_aktuelle_situation`, `x_groesste_baustelle`, `x_traum_motivation`
- `x_jahresumsatz` (array/select), `x_praxis_groesse`

## KlickTipp API
- **Base URL**: `https://api.klicktipp.com`
- **Auth**: API key in request body (`apikey` field)
- **Env var**: `KLICKTIPP_API_Key`
- **Note**: One API key = one tag. Key is linked to a specific opt-in process + tag.

### Endpoint: POST /subscriber/signin
```json
{
  "apikey": "{{API_KEY}}",
  "email": "user@example.com",
  "smsnumber": "+491701234567",
  "fields": {
    "fieldFirstName": "Alex",
    "fieldLastName": "Example",
    "fieldCompanyName": "Praxis XYZ",
    "fieldMobilePhone": "+491701234567"
  }
}
```

### Tags (one API key per tag)
- KI-Report: Tag ID 14857069
- Exit-Plan: Tag ID 14857070
- VSL Traumwebseite: Tag ID 14857068

### Custom Fields (KlickTipp uses Unix timestamps for Date & Time)
- x_leadmagnet_ki_report
- x_leadmagnet_exit_plan
- x_vsl_traumwebseite_lead

## Google Sheets
- **Spreadsheet ID**: `13Q5DGS8ElzOxExO-LZGqYXXFHNppyDD7zHWblW3Zi2w`
- **Sheet**: "Leads" (gid=1471514994)
- **Columns (A-Z)**: Lead-ID, Erstellt am, Funnel, Lead-Typ, Vorname, Nachname, E-Mail, Telefon, Rolle, Praxisstatus, Praxisgröße / Mitarbeiterzahl, UTM Source, UTM Medium, UTM Campaign, UTM Content, UTM Term, Jahresumsatz, Aktuelle Situation, Traum / Motivation, Größte Baustelle, Größte Herausforderung, Zustimmung / Aussagen, Kenntnisdauer, Individuelle Fragen, Antworten Volltext, Umfrage abgeschlossen

## Slack
- **Channel**: #pf-neuer-lead (not found - will send to user DM or create channel)
- **Tool**: slack_send_message via MCP (server: slack)
- **User ID**: U0BA4V04J1M

## Lead Automation Flow
1. Form submit → validate email + phone (E.164 +49)
2. KlickTipp: POST /subscriber/signin with appropriate API key per funnel
3. Google Sheets: Append row to "Leads" sheet via gws CLI
4. SalesSuite:
   - GET /v1/contact/by-email → check if exists
   - If not: POST /v1/contact/create with all data
   - If exists: PATCH /v2/contact/{id} with leadmagnet datetime
   - GET /v1/deal/by-email → check existing deals
   - If deal in "Verkauft" phase → skip deal creation, only update contact fields + add note
   - If no deal in Setter/Closer: POST /v2/deal at "Anfrage eingegangen"
   - POST /v1/note: "Hat sich am [datetime] den [leadmagnet] von [company] eingetragen"
5. Slack: Send notification to #pf-neuer-lead or user DM

## Funnels
- /ki-report → KI-Report 2026 (Tag: 14857069)
- /exit-plan → Exit-Plan (Tag: 14857070)
- / (Home/VSL) → Traumwebseite (Tag: 14857068)

## WhatsApp: +491791653801
