/**
 * Telegram Bot notifications for PSSG auto-matching.
 * Sends match results to Roberto with WhatsApp quick-action buttons.
 * Zero dependencies — uses native fetch.
 */

// --- Labels (same as email.js, duplicated to keep modules independent) ---

const SERVIZI_LABELS = {
  dog_walking: 'Dog walking',
  visita_domicilio: 'Visita a domicilio',
  visite_domicilio: 'Visite a domicilio',
  cat_sitting: 'Cat sitting',
  somministrazione_farmaci: 'Somm. farmaci',
  altro: 'Altro',
}

const ANIMALI_LABELS = {
  cane: 'Cane',
  gatto: 'Gatto',
  altro: 'Altro',
}

const FREQUENZE_LABELS = {
  giornaliera: 'Giornaliera',
  settimanale: 'Settimanale',
  al_bisogno: 'Al bisogno',
  altro: 'Altro',
}

const URGENZE_LABELS = {
  urgente_24h: 'Urgente (entro 24h)',
  entro_settimana: 'Entro questa settimana',
  programmabile: 'Programmabile',
}

// --- Phone number helpers ---

/**
 * Strip non-digit characters from phone number.
 */
function cleanPhone(phone) {
  return (phone || '').replace(/[^\d]/g, '')
}

/**
 * Build a wa.me link with pre-filled message.
 * Assumes Italian numbers (prefix 39 if not already present).
 */
function waLink(phone, message) {
  let num = cleanPhone(phone)
  // Add Italy country code if number starts with 3 (Italian mobile)
  if (num.startsWith('3') && num.length === 10) {
    num = '39' + num
  }
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

// --- Message builders ---

/**
 * Build Telegram message for a CLIENT lead.
 */
function buildClientMessage(payload, matches, sheetUrl) {
  const animale = ANIMALI_LABELS[payload.animale] || payload.animale
  const servizio = SERVIZI_LABELS[payload.servizio] || payload.servizio

  let text = `\u{1F415} <b>Nuova richiesta!</b>\n\n`
  text += `<b>${esc(payload.nome)}</b> cerca <b>${esc(servizio)}</b> per un <b>${esc(animale)}</b>\n`
  text += `\u{1F4CD} ${esc(payload.zona || 'San Giorgio a Cremano')}\n`
  text += `\u{1F4C5} ${esc(payload.quando || '\u2014')}\n`
  if (payload.note) {
    text += `\u{1F4DD} ${esc(payload.note)}\n`
  }

  text += buildMatchSection(matches)
  text += `\n\u{1F4CB} <a href="${sheetUrl}">Google Sheet</a>`

  return text
}

/**
 * Build Telegram message for a NURSE_CLIENT lead.
 */
function buildNurseClientMessage(payload, matches, sheetUrl) {
  const animale = ANIMALI_LABELS[payload.animale] || payload.animale
  const frequenza = FREQUENZE_LABELS[payload.frequenza] || payload.frequenza
  const urgenza = URGENZE_LABELS[payload.urgenza] || payload.urgenza

  let text = `\u{1FA7A} <b>Nuova richiesta PET NURSE!</b>\n\n`
  text += `<b>${esc(payload.nome)}</b> \u2014 <b>${esc(animale)}</b>\n`
  text += `\u{1F48A} Patologia: ${esc(payload.patologia)}\n`
  text += `\u{1F489} Farmaco: ${esc(payload.farmaco)}\n`
  text += `\u{1F504} Frequenza: ${esc(frequenza)}\n`
  text += `\u26A1 Urgenza: ${esc(urgenza)}\n`
  text += `\u{1F4CD} ${esc(payload.zona || 'San Giorgio a Cremano')}\n`
  if (payload.note) {
    text += `\u{1F4DD} ${esc(payload.note)}\n`
  }

  text += buildMatchSection(matches)
  text += `\n\u{1F4CB} <a href="${sheetUrl}">Google Sheet</a>`

  return text
}

/**
 * Build Telegram message for a new SITTER registration (no matching).
 */
function buildSitterMessage(payload, sheetUrl) {
  const servizi = (payload.servizi || [])
    .map((s) => SERVIZI_LABELS[s] || s)
    .join(', ')

  let text = `\u{1F464} <b>Nuovo sitter registrato!</b>\n\n`
  text += `<b>${esc(payload.nome)}</b> \u2014 ${esc(payload.zona || 'SGC')}\n`
  text += `\u{1F4BC} Servizi: ${esc(servizi)}\n`
  text += `\u{1FA7A} Comp. vet: ${payload.competenze_vet === 'si' ? '\u2705 S\u00EC' : '\u274C No'}\n`
  if (payload.competenze_vet === 'si' && payload.competenze_vet_dettaglio) {
    text += `   \u2192 ${esc(payload.competenze_vet_dettaglio)}\n`
  }
  text += `\u{1F4C5} Disponibilit\u00E0: ${esc(payload.disponibilita)}\n`
  if (payload.esperienza) {
    text += `\u{1F4D6} Esperienza: ${esc(payload.esperienza)}\n`
  }
  text += `\n\u{1F4CB} <a href="${sheetUrl}">Google Sheet</a>`

  return text
}

/**
 * Build the match results section for Telegram messages.
 */
function buildMatchSection(matches) {
  if (matches.length === 0) {
    return '\n\n\u26A0\uFE0F <i>Nessun sitter registrato.</i>'
  }

  const allBelowThreshold = matches.every((m) => m.belowThreshold)
  let text = '\n\n'

  if (allBelowThreshold) {
    text += '\u26A0\uFE0F <b>Nessun match forte.</b> Sitter disponibili:\n'
  } else {
    text += '\u{1F3C6} <b>Match suggeriti:</b>\n'
  }

  matches.forEach((m, i) => {
    const sitterServizi = m.sitter.servizi
      .split(',')
      .map((s) => SERVIZI_LABELS[s.trim()] || s.trim())
      .join(', ')
    const vet = m.sitter.comp_vet === 'si' ? ' \u{1FA7A}\u2705' : ''
    text += `${i + 1}. <b>${esc(m.sitter.nome)}</b> (${m.score} pts) \u2014 ${esc(sitterServizi)}${vet}\n`
  })

  return text
}

// --- WhatsApp message templates ---

/**
 * Build WhatsApp message for Roberto → client.
 */
function buildWaClientMessage(payload, sitterName, servizio) {
  const serv = SERVIZI_LABELS[servizio] || servizio
  return `Ciao ${payload.nome}! Sono Roberto di PSSG \u{1F43E}\nHo trovato un pet sitter per il tuo ${ANIMALI_LABELS[payload.animale] || payload.animale}!\nTi metto in contatto con ${sitterName}, che si occupa di ${serv} nella tua zona.\nTi contatter\u00E0 a breve su WhatsApp.`
}

/**
 * Build WhatsApp message for Roberto → sitter.
 */
function buildWaSitterMessage(payload, type, sitterName) {
  if (type === 'nurse_client') {
    return `Ciao ${sitterName}! Sono Roberto di PSSG.\nHo una richiesta pet nurse per un ${ANIMALI_LABELS[payload.animale] || payload.animale} a ${payload.zona || 'San Giorgio a Cremano'}.\nPatologia: ${payload.patologia}\nFarmaco: ${payload.farmaco}\nFrequenza: ${FREQUENZE_LABELS[payload.frequenza] || payload.frequenza}\n${payload.nome} ha bisogno di aiuto. Sei disponibile?`
  }
  return `Ciao ${sitterName}! Sono Roberto di PSSG.\nHo una richiesta di ${SERVIZI_LABELS[payload.servizio] || payload.servizio} per un ${ANIMALI_LABELS[payload.animale] || payload.animale} a ${payload.zona || 'San Giorgio a Cremano'}.\n${payload.nome} ha bisogno del servizio ${payload.quando || 'appena possibile'}.\nSei disponibile? Ti passo il contatto.`
}

// --- Inline keyboard builder ---

/**
 * Build Telegram inline keyboard with WhatsApp action buttons.
 */
function buildKeyboard(payload, type, matches) {
  const buttons = []

  // Button: WhatsApp the client
  if (payload.telefono) {
    const clientMsg = type === 'sitter'
      ? `Ciao ${payload.nome}! Sono Roberto di PSSG. Ho ricevuto la tua candidatura come sitter. Ti contatto per un breve colloquio conoscitivo.`
      : matches.length > 0
        ? buildWaClientMessage(payload, matches[0].sitter.nome, type === 'nurse_client' ? 'somministrazione_farmaci' : payload.servizio)
        : `Ciao ${payload.nome}! Sono Roberto di PSSG \u{1F43E}\nHo ricevuto la tua richiesta. Stiamo cercando il pet sitter giusto per te, ti aggiorno presto!`

    buttons.push([{
      text: `\u{1F4F1} WhatsApp ${payload.nome}`,
      url: waLink(payload.telefono, clientMsg),
    }])
  }

  // Buttons: WhatsApp each matched sitter
  matches.forEach((m) => {
    if (m.sitter.telefono) {
      const sitterMsg = buildWaSitterMessage(payload, type, m.sitter.nome)
      buttons.push([{
        text: `\u{1F4F1} WhatsApp ${m.sitter.nome} (${m.score} pts)`,
        url: waLink(m.sitter.telefono, sitterMsg),
      }])
    }
  })

  return buttons.length > 0 ? { inline_keyboard: buttons } : undefined
}

// --- HTML escaping ---

function esc(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// --- Main send function ---

/**
 * Send a Telegram notification to Roberto.
 * Gracefully skips if not configured.
 */
export async function sendTelegramNotification(env, type, payload, matches) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return
  }

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${env.SHEET_ID || 'SHEET_ID'}`

  let text
  if (type === 'sitter') {
    text = buildSitterMessage(payload, sheetUrl)
  } else if (type === 'nurse_client') {
    text = buildNurseClientMessage(payload, matches, sheetUrl)
  } else {
    text = buildClientMessage(payload, matches, sheetUrl)
  }

  const keyboard = buildKeyboard(payload, type, matches)

  const body = {
    chat_id: env.TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  if (keyboard) {
    body.reply_markup = keyboard
  }

  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Telegram API error: ${res.status} ${errText}`)
  }

  return { sent: true }
}
