/**
 * PSSG Cloudflare Worker
 * Handles POST /api/lead — validates, rate-limits, saves to Sheets, sends email.
 */

import { getCorsHeaders, handleOptions, isOriginAllowed } from './cors.js'
import { validateLead } from './validate.js'
import { checkRateLimit } from './rate-limit.js'
import { saveToSheets, saveToMailingList } from './sheets.js'
import { sendNotification, sendConfirmation } from './email.js'
import { matchAndNotify } from './match.js'

/** Max request body size in bytes (10 KB). */
const MAX_BODY_BYTES = 10 * 1024

/**
 * JSON response helper.
 */
function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

/**
 * Get client IP from request.
 */
function getClientIP(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  )
}

/**
 * Main lead handler.
 */
async function handleLead(request, env, ctx) {
  const cors = getCorsHeaders(request, env)

  // Only POST
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405, cors)
  }

  // --- PATCH 1: Origin enforcement ---
  if (!isOriginAllowed(request, env)) {
    return jsonResponse({ error: 'Origin non autorizzato.' }, 403, cors)
  }

  // --- PATCH 4: Body size limit ---
  const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10)
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Richiesta troppo grande.' }, 413, cors)
  }

  // Read body as text first to enforce size even without Content-Length
  let rawBody
  try {
    rawBody = await request.text()
  } catch {
    return jsonResponse({ error: 'Errore nella lettura del body.' }, 400, cors)
  }

  if (rawBody.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Richiesta troppo grande.' }, 413, cors)
  }

  // Parse JSON
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return jsonResponse({ error: 'JSON non valido.' }, 400, cors)
  }

  // Validate
  const validation = validateLead(body)
  if (!validation.valid) {
    return jsonResponse({ error: validation.error }, 422, cors)
  }

  // Rate limit
  const ip = getClientIP(request)
  const rateResult = await checkRateLimit(ip, env)

  if (!rateResult.allowed) {
    return jsonResponse(
      { error: 'Troppe richieste. Riprova tra un\'ora.' },
      429,
      {
        ...cors,
        'Retry-After': '3600',
      }
    )
  }

  // --- PATCH 2: Non-blocking background work via ctx.waitUntil ---
  const userAgent = request.headers.get('User-Agent') || ''

  ctx.waitUntil(
    (async () => {
      try {
        await saveToSheets(env, body.type, body.payload, rateResult.ipHash, userAgent)
      } catch (err) {
        console.error(`[bg] Sheets error: ${err.message}`)
      }

      try {
        await sendNotification(env, body.type, body.payload)
      } catch (err) {
        console.error(`[bg] Email error: ${err.message}`)
      }

      try {
        await sendConfirmation(env, body.type, body.payload)
      } catch (err) {
        console.error(`[bg] Confirmation email error: ${err.message}`)
      }

      if (body.payload.consenso_marketing) {
        try {
          await saveToMailingList(env, body.payload.email, body.payload.nome, body.type, body.payload.telefono)
        } catch (err) {
          console.error(`[bg] Mailing list error: ${err.message}`)
        }
      }

      // Auto-matching + Telegram notification
      try {
        await matchAndNotify(env, body.type, body.payload)
      } catch (err) {
        console.error(`[bg] Match+Telegram error: ${err.message}`)
      }
    })()
  )

  // Log minimal info (no payload)
  console.log(`Lead accepted: type=${body.type} ts=${new Date().toISOString()}`)

  return jsonResponse(
    {
      ok: true,
      message: 'Richiesta ricevuta con successo.',
    },
    200,
    cors
  )
}

/**
 * Worker fetch handler.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env)
    }

    // Routes
    if (url.pathname === '/api/lead') {
      return handleLead(request, env, ctx)
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', ts: Date.now() }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
