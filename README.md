# 🐾 Pet Sitting San Giorgio a Cremano (PSSG)

MVP per mettere in contatto proprietari di animali e pet sitter indipendenti a San Giorgio a Cremano.

**Stack:** Next.js (static) su Netlify + Cloudflare Worker + Google Sheets + SendGrid

---

## Struttura del progetto

```
├── frontend/          # Next.js + Tailwind (static export)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js         # Root layout, SEO meta, JSON-LD
│   │   │   ├── page.js           # Landing page
│   │   │   ├── globals.css       # Tailwind + custom styles
│   │   │   └── privacy/page.js   # Pagina privacy GDPR
│   │   └── components/
│   │       ├── Hero.jsx           # Hero con CTA
│   │       ├── HowItWorks.jsx     # 3 step
│   │       ├── WhyTrustUs.jsx     # 3 trust points
│   │       ├── FormCliente.jsx    # Form cliente completo
│   │       ├── FormSitter.jsx     # Form sitter completo
│   │       ├── FAQ.jsx            # Accordion 4 domande
│   │       ├── Footer.jsx         # Disclaimer + contatti
│   │       ├── WhatsAppFloat.jsx  # Bottone floating WhatsApp
│   │       ├── Analytics.jsx      # Cloudflare Web Analytics
│   │       └── JsonLd.jsx         # Schema.org LocalBusiness
│   ├── public/
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── netlify.toml
│   ├── next.config.js            # output: 'export'
│   ├── tailwind.config.js
│   └── .env.example
│
└── worker/            # Cloudflare Worker
    ├── src/
    │   ├── index.js       # Entry point + routing
    │   ├── cors.js        # CORS handler
    │   ├── validate.js    # Validazione payload
    │   ├── rate-limit.js  # Rate limit (KV + in-memory)
    │   ├── sheets.js      # Google Sheets API (JWT auth)
    │   └── email.js       # SendGrid notifiche
    ├── wrangler.toml
    ├── .env.example
    └── .dev.vars.example
```

---

## 1. Setup Google Sheets

### 1.1 Crea lo Spreadsheet

1. Vai su [Google Sheets](https://sheets.google.com) e crea un nuovo foglio
2. Rinomina il foglio in **"PSSG Leads"**
3. Crea **2 tab** (fogli) con questi nomi esatti:

**Tab `clients`** — intestazioni riga 1:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | type | ip_hash | user_agent | nome | zona | telefono | animale | servizio | quando | note |

**Tab `sitters`** — intestazioni riga 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | type | ip_hash | user_agent | nome | zona | telefono | email | servizi | esperienza | comp_vet | comp_vet_dettaglio | disponibilita | link_profilo | note |

4. Copia l'ID dello Spreadsheet dall'URL:
   ```
   https://docs.google.com/spreadsheets/d/[QUESTO_È_LO_SHEET_ID]/edit
   ```

### 1.2 Crea Service Account Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuovo progetto (es. "pssg-backend")
3. Abilita la **Google Sheets API**:
   - Menu → API e servizi → Libreria
   - Cerca "Google Sheets API" → Abilita
4. Crea un Service Account:
   - Menu → API e servizi → Credenziali
   - "Crea credenziali" → "Account di servizio"
   - Nome: `pssg-sheets` → Crea
   - (Salta ruoli opzionali) → Fine
5. Genera la chiave JSON:
   - Clicca sul service account appena creato
   - Tab "Chiavi" → "Aggiungi chiave" → "Crea nuova chiave" → JSON → Crea
   - Scarica il file JSON (lo userai come secret)
6. Condividi lo Spreadsheet con il service account:
   - Apri il tuo Google Sheet
   - "Condividi" → incolla l'email del service account (es. `pssg-sheets@progetto.iam.gserviceaccount.com`)
   - Permesso: **Editor**

---

## 2. Setup SendGrid

1. Registrati su [sendgrid.com](https://sendgrid.com) (piano gratuito: 100 email/giorno)
2. Vai su Settings → API Keys → "Create API Key"
   - Nome: `pssg-notifications`
   - Permesso: "Restricted Access" → Mail Send: Full Access
   - Copia la API key (inizia con `SG.`)
3. Verifica un sender:
   - Settings → Sender Authentication → "Verify a Single Sender"
   - Usa l'email che vuoi come mittente (es. `noreply@petsittingsgc.it` o la tua email)

---

## 3. Deploy del Worker (Cloudflare)

### 3.1 Prerequisiti

```bash
npm install -g wrangler
wrangler login
```

### 3.2 Crea il KV namespace

```bash
cd worker

# Produzione
wrangler kv namespace create RATE_KV
# → Copia l'ID e sostituiscilo in wrangler.toml (campo "id")

# Preview (per wrangler dev)
wrangler kv namespace create RATE_KV --preview
# → Copia l'ID e sostituiscilo in wrangler.toml (campo "preview_id")
```

### 3.3 Aggiorna wrangler.toml

Sostituisci i placeholder `YOUR_KV_NAMESPACE_ID` e `YOUR_KV_PREVIEW_ID` con gli ID reali ottenuti al passo precedente.

### 3.4 Imposta i secrets

```bash
# Google Service Account (incolla l'intero JSON su una riga)
wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON

# ID dello Spreadsheet
wrangler secret put SHEET_ID

# Origin del frontend
wrangler secret put ALLOWED_ORIGIN
# → Inserisci: https://petsittingsgc.it (o il tuo dominio Netlify)

# Salt per hash IP (genera con: openssl rand -hex 32)
wrangler secret put IP_HASH_SALT

# Email destinatario notifiche
wrangler secret put EMAIL_TO
# → Inserisci: petsittingsangiorgioacremano@gmail.com

# SendGrid
wrangler secret put SENDGRID_API_KEY
# → Inserisci la chiave SG.xxxxx

wrangler secret put EMAIL_FROM
# → Inserisci l'email verificata su SendGrid
```

### 3.5 Deploy

```bash
wrangler deploy
```

Prendi nota dell'URL del worker (es. `https://pssg-worker.tuousername.workers.dev`).

### 3.6 Test locale

```bash
# Copia e compila le variabili locali
cp .dev.vars.example .dev.vars
# Modifica .dev.vars con i tuoi valori

wrangler dev
```

Il worker gira su `http://localhost:8787`. Testa con:

```bash
curl -X POST http://localhost:8787/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "type": "client",
    "payload": {
      "nome": "Test",
      "zona": "San Giorgio a Cremano",
      "animale": "cane",
      "servizio": "dog_walking",
      "quando": "domani",
      "telefono": "3331112222",
      "note": "",
      "consenso": true
    },
    "meta": { "page": "http://localhost:3000" }
  }'
```

Risposta attesa: `{"ok":true,"message":"Richiesta ricevuta con successo."}`

---

## 4. Deploy del Frontend (Netlify)

### 4.1 Push su Git

```bash
cd frontend
git init
git add .
git commit -m "PSSG frontend v1"
git remote add origin https://github.com/TUO_USER/pssg-frontend.git
git push -u origin main
```

### 4.2 Collega a Netlify

1. Vai su [app.netlify.com](https://app.netlify.com)
2. "Add new site" → "Import an existing project" → GitHub
3. Seleziona il repo `pssg-frontend`
4. Impostazioni build:
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
5. Imposta le variabili d'ambiente in Netlify (Site settings → Environment variables):

| Variabile | Valore |
|-----------|--------|
| `NEXT_PUBLIC_API_BASE` | `https://pssg-worker.tuousername.workers.dev` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `393331112222` (il tuo numero reale) |
| `NEXT_PUBLIC_SITE_URL` | `https://tuosito.netlify.app` (o dominio custom) |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | (opzionale, da Cloudflare Web Analytics) |

6. Deploy! 🚀

### 4.3 Test locale

```bash
cd frontend
cp .env.example .env.local
# Modifica .env.local con i tuoi valori

npm install
npm run dev
```

Il sito gira su `http://localhost:3000`.

---

## 5. Cloudflare Web Analytics (opzionale)

1. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com) → Web Analytics
2. "Add a site" → inserisci il dominio
3. Copia il token (es. `abc123def456`)
4. Aggiungilo come variabile `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` su Netlify
5. Rideploya il frontend

---

## 6. Dominio custom (opzionale)

1. Compra un dominio (es. `petsittingsgc.it`)
2. Su Netlify: Site settings → Domain management → Add custom domain
3. Aggiorna `NEXT_PUBLIC_SITE_URL` e rideploya
4. Aggiorna `ALLOWED_ORIGIN` nel Worker:
   ```bash
   wrangler secret put ALLOWED_ORIGIN
   # → https://petsittingsgc.it
   ```
5. Aggiorna `sitemap.xml` e `robots.txt` con il dominio reale

---

## Flusso completo

```
Utente scansiona QR → Landing page
  ↓
Compila form (cliente o sitter)
  ↓
Frontend POST → Worker /api/lead
  ↓
Worker (sincrono):
  1. Origin enforcement (403 se non autorizzato)
  2. Body size check (413 se > 10KB)
  3. Valida payload JSON
  4. Rate limit check (10/h per IP)
  5. Risponde 200 OK
  ↓                          ↓ (background, ctx.waitUntil)
Frontend mostra              Worker:
"Grazie ✅"                    6. Salva riga su Google Sheets
  + bottone WhatsApp           7. Invia email notifica
  ↓
Gestore legge email/Sheet → screena → mette in contatto via WhatsApp
```

---

## Checklist pre-lancio

- [ ] Google Sheet creato con tab `clients` e `sitters` + headers
- [ ] Service Account creato e Sheet condiviso con esso
- [ ] Worker deployato con tutti i secrets configurati
- [ ] Frontend deployato su Netlify con variabili env
- [ ] Testato form cliente → verifica riga su Sheet + email ricevuta
- [ ] Testato form sitter → verifica riga su Sheet + email ricevuta
- [ ] Testato bottone WhatsApp → messaggio precompilato corretto
- [ ] Numero WhatsApp reale configurato in `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] `ALLOWED_ORIGIN` impostato sul dominio di produzione
- [ ] Pagina /privacy/ accessibile e corretta
- [ ] robots.txt e sitemap.xml con URL reale
- [ ] (Opzionale) Cloudflare Web Analytics attivo
- [ ] (Opzionale) Dominio custom configurato

---

## Troubleshooting

**Il form restituisce errore 403 "Origin non autorizzato":**
→ Il Worker blocca richieste da origin non nella lista. Verifica che `ALLOWED_ORIGIN` includa esattamente l'URL del frontend (con `https://`). Supporta lista separata da virgole. `localhost:3000` è sempre consentito.

**Il form restituisce errore 413 "Richiesta troppo grande":**
→ Il body supera i 10 KB. Questo non dovrebbe accadere con i form normali. Potrebbe indicare un attacco o un campo note molto lungo.

**Il form restituisce errore CORS:**
→ Verifica che `ALLOWED_ORIGIN` nel Worker corrisponda esattamente all'URL del frontend (incluso `https://`).

**Email non arriva ma il form ha risposto con successo:**
→ Sheets e email girano in background (`ctx.waitUntil`). Controlla i log del Worker con `wrangler tail` e cerca errori con prefisso `[bg]`. Verifica che `SENDGRID_API_KEY` sia corretto e che il sender sia verificato su SendGrid.

**Warning "[SECURITY] IP_HASH_SALT is not set in production":**
→ Imposta il salt con `wrangler secret put IP_HASH_SALT`. Il worker funziona comunque con un salt di fallback, ma in produzione ogni IP verrebbe hashato con lo stesso salt predefinito.

**Riga non appare su Google Sheets:**
→ Verifica che lo Sheet sia condiviso con l'email del Service Account come Editor. Controlla i log: `wrangler tail`.

**Rate limit troppo aggressivo in dev:**
→ Il rate limit è 10 req/ora per IP. In locale con `wrangler dev`, l'IP è sempre `127.0.0.1`. Puoi aumentare `MAX_REQUESTS` in `rate-limit.js` temporaneamente.

**Build Next.js fallisce su Netlify:**
→ Assicurati che il build command sia `npm run build` e la publish directory `out`.

---

## Licenza

Progetto privato — tutti i diritti riservati.
