/**
 * Google Sheets API integration.
 * Uses Service Account JWT for authentication (no external deps).
 */

// --- JWT / Auth helpers ---

function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlFromBuffer(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Import a PEM private key for signing.
 */
async function importPrivateKey(pem) {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

/**
 * Create a signed JWT for Google Sheets API.
 */
async function createJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(payload))
  const signingInput = `${headerB64}.${payloadB64}`

  const key = await importPrivateKey(serviceAccount.private_key)
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput)
  )

  const signatureB64 = base64urlFromBuffer(signature)
  return `${signingInput}.${signatureB64}`
}

/**
 * Exchange JWT for an access token.
 */
async function getAccessToken(serviceAccount) {
  const jwt = await createJWT(serviceAccount)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google OAuth failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.access_token
}

// --- Sheets API ---

/**
 * Append a row to a Google Sheet tab.
 */
async function appendRow(accessToken, sheetId, tab, values) {
  const range = `${tab}!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [values],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sheets append failed: ${res.status} ${text}`)
  }

  return await res.json()
}

// --- Public API ---

/**
 * Save a lead to the appropriate Google Sheets tab.
 */
export async function saveToSheets(env, type, payload, ipHash, userAgent) {
  const serviceAccount = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON)
  const accessToken = await getAccessToken(serviceAccount)

  const timestamp = new Date().toISOString()

  if (type === 'client') {
    const values = [
      timestamp,
      'client',
      ipHash,
      userAgent || '',
      payload.nome || '',
      payload.zona || '',
      payload.telefono || '',
      payload.email || '',
      payload.animale || '',
      payload.servizio || '',
      payload.quando || '',
      payload.note || '',
    ]
    await appendRow(accessToken, env.SHEET_ID, 'clients', values)
  } else {
    const values = [
      timestamp,
      'sitter',
      ipHash,
      userAgent || '',
      payload.nome || '',
      payload.zona || '',
      payload.telefono || '',
      payload.email || '',
      (payload.servizi || []).join(', '),
      payload.esperienza || '',
      payload.competenze_vet || '',
      payload.competenze_vet_dettaglio || '',
      payload.disponibilita || '',
      payload.link_profilo || '',
      payload.note || '',
    ]
    await appendRow(accessToken, env.SHEET_ID, 'sitters', values)
  }
}

/**
 * Save email to mailing_list tab (only if user opted in).
 */
export async function saveToMailingList(env, email, nome, tipo, telefono) {
  const serviceAccount = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON)
  const accessToken = await getAccessToken(serviceAccount)

  const values = [
    new Date().toISOString(),
    email,
    nome || '',
    tipo,
    telefono || '',
  ]
  await appendRow(accessToken, env.SHEET_ID, 'mailing_list', values)
}
