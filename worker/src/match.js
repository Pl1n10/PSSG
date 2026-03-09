/**
 * Auto-matching engine.
 * Scores sitters against incoming client/nurse leads,
 * sends results to Roberto via Telegram.
 */

import { readSitters } from './sheets.js'
import { sendTelegramNotification } from './telegram.js'

// --- Service compatibility ---
// Client form uses 'visita_domicilio', sitter form uses 'visite_domicilio'
const SERVICE_ALIASES = {
  visita_domicilio: 'visite_domicilio',
}

function normalizeService(s) {
  return SERVICE_ALIASES[s] || s
}

// --- Text normalization ---

function normalizeZona(zona) {
  return (zona || '')
    .toLowerCase()
    .replace(/[''`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// --- Scoring ---

/**
 * Score a single sitter against a client/nurse request.
 * Returns a number 0–100.
 */
function scoreSitter(sitter, payload, type) {
  let score = 0
  const sitterServizi = sitter.servizi
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  // --- Service match (max 40 pts) ---
  if (type === 'client') {
    const wanted = normalizeService(payload.servizio)
    if (sitterServizi.includes(wanted)) {
      score += 40
    }
  } else if (type === 'nurse_client') {
    // Nurse requests need somministrazione_farmaci
    if (sitterServizi.includes('somministrazione_farmaci')) {
      score += 40
    }
  }

  // --- Vet competence (max 20 pts) ---
  if (type === 'nurse_client') {
    if (sitter.comp_vet === 'si') {
      score += 20
    }
  } else if (type === 'client' && payload.servizio === 'somministrazione_farmaci') {
    if (sitter.comp_vet === 'si') {
      score += 15
    }
  }

  // --- Zone match (max 25 pts) ---
  const clientZona = normalizeZona(payload.zona)
  const sitterZona = normalizeZona(sitter.zona)
  if (clientZona && sitterZona) {
    if (clientZona === sitterZona) {
      score += 25
    } else if (clientZona.includes(sitterZona) || sitterZona.includes(clientZona)) {
      score += 15
    }
  }

  // --- Freshness bonus (max 15 pts) ---
  // Prefer recently registered sitters (more likely active)
  if (sitter.timestamp) {
    const daysAgo = (Date.now() - new Date(sitter.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    if (daysAgo < 7) {
      score += 15
    } else if (daysAgo < 30) {
      score += 10
    } else if (daysAgo < 90) {
      score += 5
    }
  }

  return score
}

/**
 * Find top matches for a lead.
 * Returns array of { sitter, score } sorted by score desc.
 * Minimum threshold: 40 (must at least match the service).
 */
export function findMatches(payload, type, sitters) {
  const MIN_SCORE = 40

  let candidates = sitters

  // For nurse requests, pre-filter to vet-competent sitters
  if (type === 'nurse_client') {
    const vetSitters = candidates.filter((s) => s.comp_vet === 'si')
    if (vetSitters.length > 0) {
      candidates = vetSitters
    }
    // If no vet sitters at all, score everyone (they'll score low but Roberto sees them)
  }

  const scored = candidates
    .map((sitter) => ({
      sitter,
      score: scoreSitter(sitter, payload, type),
    }))
    .sort((a, b) => b.score - a.score)

  // Return top 3 above threshold, or top 3 regardless if none pass threshold
  const aboveThreshold = scored.filter((m) => m.score >= MIN_SCORE)

  if (aboveThreshold.length > 0) {
    return aboveThreshold.slice(0, 3)
  }

  // No good match — return top 3 anyway so Roberto can decide
  return scored.slice(0, 3).map((m) => ({ ...m, belowThreshold: true }))
}

/**
 * Main orchestrator: read sitters, find matches, notify via Telegram.
 * Called from ctx.waitUntil() in index.js.
 */
export async function matchAndNotify(env, type, payload) {
  // Skip if Telegram not configured
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping match notification.')
    return
  }

  // For sitter leads, send a simple notification (no matching)
  if (type === 'sitter') {
    await sendTelegramNotification(env, type, payload, [])
    return
  }

  // Read sitters from Google Sheets
  const sitters = await readSitters(env)

  if (sitters.length === 0) {
    // No sitters registered yet
    await sendTelegramNotification(env, type, payload, [])
    return
  }

  // Find matches
  const matches = findMatches(payload, type, sitters)

  // Send Telegram notification
  await sendTelegramNotification(env, type, payload, matches)
}
