/**
 * Send email notification via SendGrid HTTP API.
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
Note: ${payload.note || '—'}

📋 Google Sheet: ${sheetUrl}`,
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
Competenze veterinarie: ${payload.competenze_vet === 'si' ? `Sì — ${payload.competenze_vet_dettaglio || 'non specificato'}` : 'No'}
Disponibilità: ${payload.disponibilita}
Link profilo: ${payload.link_profilo || '—'}
Note: ${payload.note || '—'}

📋 Google Sheet: ${sheetUrl}`,
  }
}

// --- User confirmation emails ---

function buildClientConfirmation(payload) {
  const animale = ANIMALI_LABELS[payload.animale] || payload.animale
  const servizio = SERVIZI_LABELS[payload.servizio] || payload.servizio

  return {
    subject: 'PSSG — Abbiamo ricevuto la tua richiesta!',
    body: `Ciao ${payload.nome}!

Abbiamo ricevuto la tua richiesta di pet sitting. Ecco un riepilogo:

Animale: ${animale}
Servizio: ${servizio}
Quando: ${payload.quando}
Zona: ${payload.zona || 'San Giorgio a Cremano'}

Cosa succede adesso?
Stiamo cercando il pet sitter giusto per te. Ti contatteremo su WhatsApp al numero ${payload.telefono} entro 48 ore.

A presto!
Il team PSSG — Pet Sitting San Giorgio a Cremano`,
  }
}

function buildSitterConfirmation(payload) {
  const servizi = (payload.servizi || [])
    .map((s) => SERVIZI_LABELS[s] || s)
    .join(', ')

  return {
    subject: 'PSSG — Candidatura ricevuta!',
    body: `Ciao ${payload.nome}!

Abbiamo ricevuto la tua candidatura come pet sitter. Ecco un riepilogo:

Servizi offerti: ${servizi}
Disponibilita: ${payload.disponibilita}
Zona: ${payload.zona || 'San Giorgio a Cremano'}

Cosa succede adesso?
Valuteremo il tuo profilo e ti ricontatteremo entro 48 ore su WhatsApp al numero ${payload.telefono}.

A presto!
Il team PSSG — Pet Sitting San Giorgio a Cremano`,
  }
}

/**
 * Send confirmation email to the user.
 */
export async function sendConfirmation(env, type, payload) {
  if (!env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping confirmation email.')
    return { sent: false, reason: 'no_api_key' }
  }

  if (!payload.email) {
    return { sent: false, reason: 'no_user_email' }
  }

  const emailFrom = env.EMAIL_FROM || 'noreply@petsittingsgc.it'

  const { subject, body } =
    type === 'client'
      ? buildClientConfirmation(payload)
      : buildSitterConfirmation(payload)

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: payload.email.trim() }],
          subject,
        },
      ],
      from: { email: emailFrom, name: 'PSSG Pet Sitting' },
      content: [
        {
          type: 'text/plain',
          value: body,
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`SendGrid confirmation error: ${res.status} ${text}`)
    return { sent: false, reason: `sendgrid_error_${res.status}` }
  }

  return { sent: true }
}

/**
 * Send notification email to admin.
 */
export async function sendNotification(env, type, payload) {
  // Check if SendGrid is configured
  if (!env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping email notification.')
    return { sent: false, reason: 'no_api_key' }
  }

  const emailTo = env.EMAIL_TO || 'petsittingsangiorgioacremano@gmail.com'
  const emailFrom = env.EMAIL_FROM || 'noreply@petsittingsgc.it'
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${env.SHEET_ID || 'SHEET_ID'}`

  const { subject, body } =
    type === 'client'
      ? buildClientEmail(payload, sheetUrl)
      : buildSitterEmail(payload, sheetUrl)

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: emailTo }],
          subject,
        },
      ],
      from: { email: emailFrom, name: 'PSSG Notifiche' },
      content: [
        {
          type: 'text/plain',
          value: body,
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`SendGrid error: ${res.status} ${text}`)
    return { sent: false, reason: `sendgrid_error_${res.status}` }
  }

  return { sent: true }
}
