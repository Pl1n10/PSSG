/**
 * Send emails via Resend HTTP API.
 * Falls back gracefully if not configured.
 */

const SERVIZI_LABELS = {
  dog_walking: 'Dog walking',
  visita_domicilio: 'Visita a domicilio',
  visite_domicilio: 'Visite a domicilio',
  cat_sitting: 'Cat sitting',
  somministrazione_farmaci: 'Somministrazione farmaci',
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

// --- Admin notification email builders ---

function buildClientEmail(payload, sheetUrl) {
  const animale = ANIMALI_LABELS[payload.animale] || payload.animale
  const servizio = SERVIZI_LABELS[payload.servizio] || payload.servizio

  return {
    subject: '[PSSG] Nuova richiesta CLIENTE',
    body: `Nuova richiesta da un CLIENTE

Nome: ${payload.nome}
Zona: ${payload.zona || 'San Giorgio a Cremano'}
Telefono: ${payload.telefono}
Email: ${payload.email}
Animale: ${animale}
Servizio: ${servizio}
Quando: ${payload.quando}
Note: ${payload.note || '\u2014'}

\u{1F4CB} Google Sheet: ${sheetUrl}`,
  }
}

function buildSitterEmail(payload, sheetUrl) {
  const servizi = (payload.servizi || [])
    .map((s) => SERVIZI_LABELS[s] || s)
    .join(', ')

  return {
    subject: '[PSSG] Nuovo SITTER',
    body: `Nuova candidatura SITTER

Nome: ${payload.nome}
Zona: ${payload.zona || 'San Giorgio a Cremano'}
Telefono: ${payload.telefono}
Email: ${payload.email}
Servizi offerti: ${servizi}
Esperienza: ${payload.esperienza}
Competenze veterinarie: ${payload.competenze_vet === 'si' ? `S\u00ec \u2014 ${payload.competenze_vet_dettaglio || 'non specificato'}` : 'No'}
Disponibilit\u00e0: ${payload.disponibilita}
Link profilo: ${payload.link_profilo || '\u2014'}
Note: ${payload.note || '\u2014'}

\u{1F4CB} Google Sheet: ${sheetUrl}`,
  }
}

function buildNurseClientEmail(payload, sheetUrl) {
  const animale = ANIMALI_LABELS[payload.animale] || payload.animale
  const frequenza = FREQUENZE_LABELS[payload.frequenza] || payload.frequenza
  const urgenza = URGENZE_LABELS[payload.urgenza] || payload.urgenza

  return {
    subject: '[PSSG] \u{1FA7A} Nuova richiesta PET NURSE',
    body: `Nuova richiesta PET NURSE

Nome: ${payload.nome}
Zona: ${payload.zona || 'San Giorgio a Cremano'}
Telefono: ${payload.telefono}
Email: ${payload.email}
Animale: ${animale}
Patologia: ${payload.patologia}
Farmaco/trattamento: ${payload.farmaco}
Frequenza: ${frequenza}
Urgenza: ${urgenza}
Note: ${payload.note || '\u2014'}

\u{1F4CB} Google Sheet: ${sheetUrl}`,
  }
}

// --- HTML email wrapper ---

function htmlEmail(greeting, summaryRows, nextSteps) {
  const rows = summaryRows
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#5a6b5a;font-size:14px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 12px;color:#1a2e1a;font-size:14px">${value}</td></tr>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;padding:24px 0">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden">
  <!-- Header -->
  <tr><td style="background-color:#2d4a2d;padding:28px 32px;text-align:center">
    <span style="font-size:32px">&#x1F43E;</span>
    <p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:600">Pet Sitting SGC</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px">
    <p style="margin:0 0 20px;color:#1a2e1a;font-size:16px;line-height:1.5">${greeting}</p>
    <!-- Summary table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f0;border-radius:8px;margin:0 0 24px">
      ${rows}
    </table>
    <!-- Next steps -->
    <div style="border-left:3px solid #e87c3e;padding:12px 16px;background-color:#fef8f4;border-radius:0 8px 8px 0;margin:0 0 24px">
      <p style="margin:0 0 4px;color:#e87c3e;font-size:13px;font-weight:600;text-transform:uppercase">Cosa succede adesso?</p>
      <p style="margin:0;color:#1a2e1a;font-size:14px;line-height:1.5">${nextSteps}</p>
    </div>
    <p style="margin:0;color:#5a6b5a;font-size:14px">A presto!</p>
    <p style="margin:4px 0 0;color:#1a2e1a;font-size:14px;font-weight:600">Il team PSSG</p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background-color:#f7f5f0;padding:16px 32px;text-align:center;border-top:1px solid #e8e4dc">
    <p style="margin:0;color:#8a9b8a;font-size:12px">Pet Sitting San Giorgio a Cremano</p>
    <p style="margin:4px 0 0;color:#8a9b8a;font-size:11px">info@petsittingsangiorgio.it</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// --- User confirmation email builders ---

function buildClientConfirmation(payload) {
  const animale = ANIMALI_LABELS[payload.animale] || payload.animale
  const servizio = SERVIZI_LABELS[payload.servizio] || payload.servizio
  const zona = payload.zona || 'San Giorgio a Cremano'

  return {
    subject: 'PSSG \u2014 Abbiamo ricevuto la tua richiesta!',
    text: `Ciao ${payload.nome}!\n\nAbbiamo ricevuto la tua richiesta di pet sitting. Ecco un riepilogo:\n\nAnimale: ${animale}\nServizio: ${servizio}\nQuando: ${payload.quando}\nZona: ${zona}\n\nCosa succede adesso?\nStiamo cercando il pet sitter giusto per te. Ti contatteremo su WhatsApp al numero ${payload.telefono} entro 48 ore.\n\nA presto!\nIl team PSSG \u2014 Pet Sitting San Giorgio a Cremano`,
    html: htmlEmail(
      `Ciao <strong>${payload.nome}</strong>!<br>Abbiamo ricevuto la tua richiesta di pet sitting.`,
      [['Animale', animale], ['Servizio', servizio], ['Quando', payload.quando], ['Zona', zona]],
      `Stiamo cercando il pet sitter giusto per te. Ti contatteremo su <strong>WhatsApp</strong> al numero <strong>${payload.telefono}</strong> entro 48 ore.`
    ),
  }
}

function buildSitterConfirmation(payload) {
  const servizi = (payload.servizi || [])
    .map((s) => SERVIZI_LABELS[s] || s)
    .join(', ')
  const zona = payload.zona || 'San Giorgio a Cremano'

  return {
    subject: 'PSSG \u2014 Candidatura ricevuta!',
    text: `Ciao ${payload.nome}!\n\nAbbiamo ricevuto la tua candidatura come pet sitter. Ecco un riepilogo:\n\nServizi offerti: ${servizi}\nDisponibilita: ${payload.disponibilita}\nZona: ${zona}\n\nCosa succede adesso?\nValuteremo il tuo profilo e ti ricontatteremo entro 48 ore su WhatsApp al numero ${payload.telefono}.\n\nA presto!\nIl team PSSG \u2014 Pet Sitting San Giorgio a Cremano`,
    html: htmlEmail(
      `Ciao <strong>${payload.nome}</strong>!<br>Abbiamo ricevuto la tua candidatura come pet sitter.`,
      [['Servizi', servizi], ['Disponibilit\u00e0', payload.disponibilita], ['Zona', zona]],
      `Valuteremo il tuo profilo e ti ricontatteremo entro 48 ore su <strong>WhatsApp</strong> al numero <strong>${payload.telefono}</strong>.`
    ),
  }
}

function buildNurseClientConfirmation(payload) {
  const animale = ANIMALI_LABELS[payload.animale] || payload.animale
  const frequenza = FREQUENZE_LABELS[payload.frequenza] || payload.frequenza
  const zona = payload.zona || 'San Giorgio a Cremano'

  return {
    subject: 'PSSG \u2014 Richiesta pet nurse ricevuta!',
    text: `Ciao ${payload.nome}!\n\nAbbiamo ricevuto la tua richiesta di pet nurse a domicilio. Ecco un riepilogo:\n\nAnimale: ${animale}\nPatologia: ${payload.patologia}\nFarmaco/trattamento: ${payload.farmaco}\nFrequenza: ${frequenza}\nZona: ${zona}\n\nCosa succede adesso?\nStiamo cercando il professionista giusto per il tuo animale. Ti contatteremo su WhatsApp al numero ${payload.telefono} entro 48 ore.\n\nA presto!\nIl team PSSG \u2014 Pet Sitting San Giorgio a Cremano`,
    html: htmlEmail(
      `Ciao <strong>${payload.nome}</strong>!<br>Abbiamo ricevuto la tua richiesta di pet nurse a domicilio.`,
      [['Animale', animale], ['Patologia', payload.patologia], ['Trattamento', payload.farmaco], ['Frequenza', frequenza], ['Zona', zona]],
      `Stiamo cercando il professionista giusto per il tuo animale. Ti contatteremo su <strong>WhatsApp</strong> al numero <strong>${payload.telefono}</strong> entro 48 ore.`
    ),
  }
}

// --- Core send function (Resend API) ---

/**
 * Send a single email via Resend.
 * @param {string} apiKey - Resend API key (re_xxxxx)
 * @param {string} from - Sender (e.g. "PSSG <info@petsittingsangiorgio.it>")
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} [html] - Optional HTML body
 * @returns {{ sent: boolean, reason?: string }}
 */
async function sendEmail(apiKey, from, to, subject, text, html) {
  const payload = { from, to, subject, text }
  if (html) payload.html = html

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error(`Resend error: ${res.status} ${errBody}`)
    return { sent: false, reason: `resend_error_${res.status}` }
  }

  return { sent: true }
}

// --- Public exports ---

/**
 * Send confirmation email to the user.
 */
export async function sendConfirmation(env, type, payload) {
  if (!env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping confirmation email.')
    return { sent: false, reason: 'no_api_key' }
  }

  if (!payload.email) {
    return { sent: false, reason: 'no_user_email' }
  }

  const from = `PSSG Pet Sitting <${env.EMAIL_FROM || 'info@petsittingsangiorgio.it'}>`

  let emailContent
  if (type === 'client') {
    emailContent = buildClientConfirmation(payload)
  } else if (type === 'nurse_client') {
    emailContent = buildNurseClientConfirmation(payload)
  } else {
    emailContent = buildSitterConfirmation(payload)
  }

  return sendEmail(env.RESEND_API_KEY, from, payload.email.trim(), emailContent.subject, emailContent.text, emailContent.html)
}

/**
 * Send notification email to admin.
 */
export async function sendNotification(env, type, payload) {
  if (!env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping email notification.')
    return { sent: false, reason: 'no_api_key' }
  }

  const emailTo = env.EMAIL_TO || 'petsittingsangiorgioacremano@gmail.com'
  const from = `PSSG Notifiche <${env.EMAIL_FROM || 'info@petsittingsangiorgio.it'}>`
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${env.SHEET_ID || 'SHEET_ID'}`

  let notifContent
  if (type === 'client') {
    notifContent = buildClientEmail(payload, sheetUrl)
  } else if (type === 'nurse_client') {
    notifContent = buildNurseClientEmail(payload, sheetUrl)
  } else {
    notifContent = buildSitterEmail(payload, sheetUrl)
  }

  return sendEmail(env.RESEND_API_KEY, from, emailTo, notifContent.subject, notifContent.body)
}
