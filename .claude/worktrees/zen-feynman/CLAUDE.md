# CLAUDE.md — PSSG Project Context

## What is this project?

**Pet Sitting San Giorgio a Cremano (PSSG)** is an MVP to connect pet owners with independent pet sitters in San Giorgio a Cremano (Naples, Italy). It's a lead-gen funnel: QR code → landing page → form → manual screening → WhatsApp contact.

There is NO user authentication, NO payments, NO database beyond Google Sheets. This is intentionally simple.

## Architecture

```
┌─────────────────┐     POST /api/lead     ┌──────────────────┐
│  Frontend        │ ───────────────────→   │  Cloudflare      │
│  Next.js static  │                        │  Worker           │
│  (Netlify)       │ ←─────────────────     │                  │
│                  │     JSON response      │  ├─ validate      │
└─────────────────┘                        │  ├─ rate-limit    │
                                           │  ├─ → Google Sheets│
                                           │  └─ → Resend      │
                                           └──────────────────┘
```

- **Frontend** (`/frontend`): Next.js 14 App Router, static export (`output: 'export'`), Tailwind CSS, deployed on Netlify
- **Backend** (`/worker`): Cloudflare Worker (ESM), no framework, plain JS modules
- **Storage**: Google Sheets (4 tabs: `clients`, `sitters`, `nurse_clients`, `mailing_list`), accessed via Sheets API v4 with Service Account JWT
- **Email**: Resend HTTP API — admin notifications + user confirmation emails (non-blocking, graceful fallback if unconfigured)
- **Rate limiting**: Cloudflare KV (10 req/hr per IP hash), in-memory Map fallback

## Key technical decisions

- **Static export**: `next.config.js` has `output: 'export'`. No SSR, no API routes in Next.js. All dynamic behavior is client-side.
- **No external auth libraries**: The Worker does its own JWT signing for Google Sheets using Web Crypto API (`crypto.subtle`). Zero npm dependencies in the worker.
- **IP hashing**: IPs are SHA-256 hashed with a salt (`IP_HASH_SALT` env) before storage. Only the hash prefix (first 8 bytes hex) is stored. If the salt is missing in production, a warning is logged but the worker continues with a fallback salt.
- **Honeypot anti-spam**: Hidden `_hp` field in all forms. If filled, request is silently rejected.
- **Cooldown**: Client-side 15s cooldown after successful form submit.
- **CORS + Origin enforcement**: Worker returns CORS headers AND actively rejects POST requests from unauthorized origins with 403. Requests without an Origin header (curl/Postman) are allowed through.
- **Body size limit**: Requests larger than 10 KB are rejected with 413 before parsing, using both Content-Length header check and actual body length check.
- **Non-blocking I/O**: After validation and rate-limit pass, Sheets write, admin notification, user confirmation email, and mailing list write all run in background via `ctx.waitUntil()`. The HTTP response returns immediately. Background errors are logged with `[bg]` prefix but never fail the request.
- **User confirmation emails**: Both clients and sitters receive an automatic confirmation email after form submission with a summary of their request and next steps (WhatsApp contact within 48h).
- **Mailing list**: Users who opt in via a separate GDPR-compliant checkbox (`consenso_marketing`) are added to the `mailing_list` tab in Google Sheets for future communications. The marketing consent is separate from the data processing consent.

## Frontend conventions

- **Components**: `/frontend/src/components/*.jsx` — all React functional components. Nurse-specific components in `/frontend/src/components/nurse/*.jsx`.
- **Styling**: Tailwind utility classes. Custom theme in `tailwind.config.js` with `brand` (orange), `sage` (green), `cream`, `warmgray` color palettes.
- **Fonts**: DM Serif Display (headings) + DM Sans (body), loaded via Google Fonts CSS import in `globals.css`.
- **Form state**: Each form manages its own state with `useState`. States: `idle` → `loading` → `success` | `error`.
- **Client components**: Only components with interactivity have `'use client'` directive (forms, FAQ, WhatsAppFloat).
- **No localStorage/sessionStorage**: Not supported in some deployment contexts.
- **Path aliases**: `@/*` maps to `./src/*` via `jsconfig.json`.

## Worker conventions

- **Pure ESM**: All files use `import`/`export`. Entry point is `src/index.js` with `export default { fetch() }`.
- **No npm dependencies**: Everything is hand-rolled (JWT, Google auth, Resend calls). This keeps the Worker tiny and avoids bundling issues.
- **Module structure**:
  - `index.js` — routing + main handler (origin enforcement, body size limit, ctx.waitUntil for background work)
  - `cors.js` — CORS headers + `isOriginAllowed()` check + `getAllowedOrigins()` parser
  - `validate.js` — payload validation (returns `{ valid, error }`)
  - `rate-limit.js` — KV-based rate limiter with in-memory fallback + salt safety check
  - `sheets.js` — Google Sheets JWT auth + append row + `saveToMailingList()`
  - `email.js` — Resend admin notification + user confirmation emails (`sendNotification()` + `sendConfirmation()`)
- **Error handling**: Sheets and email run in `ctx.waitUntil()` — they never block the response and never cause user-facing errors. Background failures are logged with `[bg]` prefix.
- **Logging**: Only `type` + `timestamp` are logged. Never log full payload (GDPR).

## Environment variables

### Frontend (Netlify)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE` | Yes | Worker URL (e.g. `https://pssg-worker.xxx.workers.dev`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes | WhatsApp number with country code, no `+` (e.g. `393331112222`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL for SEO |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | No | Cloudflare Web Analytics token |

### Worker (Cloudflare secrets)

| Secret | Required | Description |
|--------|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Yes | Full JSON key from Google Cloud |
| `SHEET_ID` | Yes | Google Sheets spreadsheet ID |
| `ALLOWED_ORIGIN` | Yes | Frontend URL for CORS |
| `IP_HASH_SALT` | Yes | Random string for IP hashing |
| `EMAIL_TO` | Yes | Notification recipient email |
| `RESEND_API_KEY` | No* | Resend API key (*email won't send without it) |
| `EMAIL_FROM` | No* | Verified sender email in Resend (e.g. info@petsittingsangiorgio.it) |

KV binding: `RATE_KV` (defined in `wrangler.toml`)

## Google Sheets schema

**Tab `clients`**: timestamp, type, ip_hash, user_agent, nome, zona, telefono, email, animale, servizio, quando, note

**Tab `sitters`**: timestamp, type, ip_hash, user_agent, nome, zona, telefono, email, servizi, esperienza, comp_vet, comp_vet_dettaglio, disponibilita, link_profilo, note

**Tab `nurse_clients`**: timestamp, type, ip_hash, user_agent, nome, zona, telefono, email, animale, patologia, farmaco, frequenza, urgenza, note

**Tab `mailing_list`**: timestamp, email, nome, tipo, telefono

## Common tasks

### Add a new form field

1. Add the field to the React form component (`FormCliente.jsx` or `FormSitter.jsx`)
2. Add it to the form state object and include in the POST body payload
3. Add validation in `worker/src/validate.js` if required
4. Add the column to the Google Sheet tab (append to the right)
5. Add the value to the `values` array in `worker/src/sheets.js` (same position as the Sheet column)
6. Add it to the email body template in `worker/src/email.js`
7. Update the WhatsApp message template if relevant

### Add a new service option

1. Add to `SERVIZI` array in `FormCliente.jsx`
2. Add to `SERVIZI_OPTIONS` in `FormSitter.jsx`
3. Add to `VALID_SERVIZI_CLIENTE` and/or `VALID_SERVIZI_SITTER` in `worker/src/validate.js`
4. Add to `SERVIZI_LABELS` in `worker/src/email.js`

### Test the worker locally

```bash
cd worker
cp .dev.vars.example .dev.vars  # fill in values
npx wrangler dev
# Then: curl -X POST http://localhost:8787/api/lead -H "Content-Type: application/json" -d '...'
```

### Test the frontend locally

```bash
cd frontend
cp .env.example .env.local  # fill in values, point API_BASE to localhost:8787
npm install
npm run dev
```

### Deploy

```bash
# Worker
cd worker && npx wrangler deploy

# Frontend: push to GitHub, Netlify auto-deploys
cd frontend && git push
```

## Content & copy

- All copy is in **Italian**, informal/friendly tone ("tu" form)
- Target audience: families and animal lovers in a small town near Naples
- **No prices** anywhere — prices are set by individual sitters
- Disclaimer is mandatory in the footer: PSSG connects people, does not provide the service
- Privacy page at `/privacy/` covers GDPR basics

## Pages

| Route | Description | Components |
|-------|-------------|------------|
| `/` | Landing page principale — pet sitting generico | Hero, HowItWorks, WhyTrustUs, FormCliente, FormSitter, FAQ, Footer |
| `/nurse/` | Landing page pet nursing — QR fuori cliniche vet | HeroNurse, HowItWorksNurse, WhyTrustUsNurse, FormNurseClient, FAQ, Footer |
| `/privacy/` | Privacy policy GDPR | Static content |

The `/nurse/` page targets pet owners at veterinary clinics who need specialized care (medication administration, post-op care, chronic conditions). It uses a dedicated form with `type: 'nurse_client'` that collects patologia, farmaco, frequenza, and urgenza fields. The worker validates this type separately and writes to the `nurse_clients` Google Sheet tab.

## Email system

The worker sends two types of email via Resend for each lead type (client, sitter, nurse_client):

1. **Admin notification** (`sendNotification`) — sent to `EMAIL_TO` when a new lead arrives. Contains full form data + link to Google Sheet.
2. **User confirmation** (`sendConfirmation`) — sent to the user's email address. Contains a summary of their request and "we'll contact you on WhatsApp within 48h".

Both are non-blocking (run in `ctx.waitUntil`). If Resend is not configured, both skip silently.

The **mailing list** is a separate concern: only users who check the `consenso_marketing` checkbox are written to the `mailing_list` tab. This is GDPR-compliant — marketing consent is separate from data processing consent.

## Things NOT to do

- Don't add authentication — this is a lead-gen MVP
- Don't add a database — Google Sheets is the "database" by design
- Don't add SSR or API routes in Next.js — it's static export only
- Don't add npm dependencies to the Worker — keep it zero-dep
- Don't log user payload in the Worker — only type + timestamp
- Don't put prices or rate information on the site
- Don't expand beyond San Giorgio a Cremano without explicit decision
