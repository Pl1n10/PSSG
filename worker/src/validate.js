/**
 * Validate incoming lead payload.
 * Returns { valid: true } or { valid: false, error: string }
 */

const VALID_ANIMALI = ['cane', 'gatto', 'altro']
const VALID_SERVIZI_CLIENTE = [
  'dog_walking', 'visita_domicilio', 'cat_sitting',
  'somministrazione_farmaci', 'altro',
]
const VALID_SERVIZI_SITTER = [
  'dog_walking', 'cat_sitting', 'visite_domicilio',
  'somministrazione_farmaci', 'altro',
]
const VALID_FREQUENZE = ['giornaliera', 'settimanale', 'al_bisogno', 'altro']
const VALID_URGENZE = ['urgente_24h', 'entro_settimana', 'programmabile']

export function validateLead(body) {
  // Type check
  if (!body || !body.type) {
    return { valid: false, error: 'Campo "type" obbligatorio.' }
  }
  if (!['client', 'sitter', 'nurse_client'].includes(body.type)) {
    return { valid: false, error: 'Tipo non valido.' }
  }

  const p = body.payload
  if (!p || typeof p !== 'object') {
    return { valid: false, error: 'Payload mancante.' }
  }

  // Honeypot check (field name varies but we check common patterns)
  if (p._hp || p.website || p._honeypot) {
    return { valid: false, error: 'Richiesta non valida.' }
  }

  // Consenso
  if (!p.consenso) {
    return { valid: false, error: 'Il consenso al trattamento dati è obbligatorio.' }
  }

  // Telefono (both types)
  if (!p.telefono || !p.telefono.trim()) {
    return { valid: false, error: 'Telefono obbligatorio.' }
  }

  // Nome (both types)
  if (!p.nome || !p.nome.trim()) {
    return { valid: false, error: 'Nome obbligatorio.' }
  }

  // --- Email (both types) ---
  if (!p.email || !p.email.trim()) {
    return { valid: false, error: 'Email obbligatoria.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
    return { valid: false, error: 'Formato email non valido.' }
  }

  // --- Client-specific ---
  if (body.type === 'client') {
    if (!p.animale || !VALID_ANIMALI.includes(p.animale)) {
      return { valid: false, error: 'Seleziona un tipo di animale valido.' }
    }
    if (!p.servizio || !VALID_SERVIZI_CLIENTE.includes(p.servizio)) {
      return { valid: false, error: 'Seleziona un servizio valido.' }
    }
    if (!p.quando || !p.quando.trim()) {
      return { valid: false, error: 'Indica quando hai bisogno del servizio.' }
    }
  }

  // --- Sitter-specific ---
  if (body.type === 'sitter') {
    // At least 1 service
    if (!Array.isArray(p.servizi) || p.servizi.length === 0) {
      return { valid: false, error: 'Seleziona almeno un servizio offerto.' }
    }
    // Validate each service
    for (const s of p.servizi) {
      if (!VALID_SERVIZI_SITTER.includes(s)) {
        return { valid: false, error: `Servizio "${s}" non valido.` }
      }
    }
    if (!p.esperienza || !p.esperienza.trim()) {
      return { valid: false, error: 'Descrivi la tua esperienza.' }
    }
    if (!p.disponibilita || !p.disponibilita.trim()) {
      return { valid: false, error: 'Indica la tua disponibilità.' }
    }
  }

  // --- Nurse client-specific ---
  if (body.type === 'nurse_client') {
    if (!p.animale || !VALID_ANIMALI.includes(p.animale)) {
      return { valid: false, error: 'Seleziona un tipo di animale valido.' }
    }
    if (!p.patologia || !p.patologia.trim()) {
      return { valid: false, error: 'Descrivi la patologia del tuo animale.' }
    }
    if (!p.farmaco || !p.farmaco.trim()) {
      return { valid: false, error: 'Indica il farmaco o trattamento necessario.' }
    }
    if (!p.frequenza || !VALID_FREQUENZE.includes(p.frequenza)) {
      return { valid: false, error: 'Seleziona una frequenza valida.' }
    }
    if (!p.urgenza || !VALID_URGENZE.includes(p.urgenza)) {
      return { valid: false, error: 'Seleziona un livello di urgenza valido.' }
    }
  }

  return { valid: true }
}
