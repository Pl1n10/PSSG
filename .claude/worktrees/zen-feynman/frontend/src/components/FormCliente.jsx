'use client'

import { useState, useRef } from 'react'

const SERVIZI = [
  { value: '', label: 'Seleziona servizio...' },
  { value: 'dog_walking', label: 'Dog walking' },
  { value: 'visita_domicilio', label: 'Visita a domicilio' },
  { value: 'cat_sitting', label: 'Cat sitting' },
  { value: 'somministrazione_farmaci', label: 'Somministrazione farmaci' },
  { value: 'altro', label: 'Altro' },
]

const ANIMALI = [
  { value: '', label: 'Seleziona...' },
  { value: 'cane', label: 'Cane' },
  { value: 'gatto', label: 'Gatto' },
  { value: 'altro', label: 'Altro' },
]

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787'
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '393331112222'

export default function FormCliente() {
  const [form, setForm] = useState({
    nome: '',
    zona: 'San Giorgio a Cremano',
    animale: '',
    servizio: '',
    quando: '',
    telefono: '',
    email: '',
    note: '',
    consenso: false,
    consenso_marketing: false,
    _hp: '', // honeypot
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [cooldown, setCooldown] = useState(false)
  const formRef = useRef(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Inserisci il tuo nome'
    if (!form.animale) errs.animale = 'Seleziona il tipo di animale'
    if (!form.servizio) errs.servizio = 'Seleziona il servizio'
    if (!form.quando.trim()) errs.quando = 'Indica quando hai bisogno'
    if (!form.telefono.trim()) errs.telefono = 'Inserisci il telefono'
    if (!form.email.trim()) {
      errs.email = 'Inserisci la tua email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Inserisci un\'email valida'
    }
    if (!form.consenso) errs.consenso = 'Devi acconsentire al trattamento dati'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Honeypot check
    if (form._hp) return

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Scroll to first error
      const firstErr = formRef.current?.querySelector('.field-error')
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (cooldown) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`${API_BASE}/api/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'client',
          payload: {
            nome: form.nome.trim(),
            zona: form.zona.trim(),
            animale: form.animale,
            servizio: form.servizio,
            quando: form.quando.trim(),
            telefono: form.telefono.trim(),
            email: form.email.trim(),
            note: form.note.trim(),
            consenso: form.consenso,
            consenso_marketing: form.consenso_marketing,
          },
          meta: {
            page: window.location.href,
            utm: Object.fromEntries(new URLSearchParams(window.location.search)),
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Errore nell\'invio. Riprova.')
      }

      setStatus('success')
      // Cooldown 15s
      setCooldown(true)
      setTimeout(() => setCooldown(false), 15000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Errore di connessione. Riprova tra poco.')
    }
  }

  // WhatsApp message
  const waMessage = () => {
    const animaleLabel = ANIMALI.find((a) => a.value === form.animale)?.label || form.animale
    const servizioLabel = SERVIZI.find((s) => s.value === form.servizio)?.label || form.servizio
    return encodeURIComponent(
      `Ciao! Sono ${form.nome}. Cerco pet sitter a San Giorgio a Cremano. Animale: ${animaleLabel}. Servizio: ${servizioLabel}. Quando: ${form.quando}.`
    )
  }

  // SUCCESS STATE
  if (status === 'success') {
    return (
      <section className="section-padding" id="cliente">
        <div className="max-w-lg mx-auto">
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl md:text-3xl mb-3">Grazie!</h2>
            <p className="text-sage-500 mb-8 leading-relaxed">
              Abbiamo ricevuto la tua richiesta e ti abbiamo inviato una conferma via email.<br />
              Per velocizzare, apri WhatsApp e scrivici.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Apri WhatsApp
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding" id="cliente">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🔍</span>
          <h2 className="text-2xl md:text-3xl mb-2">Cerchi un pet sitter?</h2>
          <p className="text-sage-500">
            Compila il form e ti mettiamo in contatto con un pet sitter nella tua zona.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="card space-y-5">
          {/* Honeypot - hidden from real users */}
          <div className="absolute opacity-0 pointer-events-none" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <label htmlFor="c_website">Non compilare</label>
            <input type="text" id="c_website" name="_hp" tabIndex={-1} autoComplete="off" value={form._hp} onChange={handleChange} />
          </div>

          {/* Nome */}
          <div>
            <label htmlFor="c_nome" className="form-label">Nome *</label>
            <input
              type="text" id="c_nome" name="nome"
              value={form.nome} onChange={handleChange}
              placeholder="Il tuo nome"
              className={`form-input ${errors.nome ? 'form-input-error' : ''}`}
            />
            {errors.nome && <p className="field-error">{errors.nome}</p>}
          </div>

          {/* Zona */}
          <div>
            <label htmlFor="c_zona" className="form-label">Zona</label>
            <input
              type="text" id="c_zona" name="zona"
              value={form.zona} onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Animale */}
          <div>
            <label htmlFor="c_animale" className="form-label">Animale *</label>
            <select
              id="c_animale" name="animale"
              value={form.animale} onChange={handleChange}
              className={`form-input ${errors.animale ? 'form-input-error' : ''}`}
            >
              {ANIMALI.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            {errors.animale && <p className="field-error">{errors.animale}</p>}
          </div>

          {/* Servizio */}
          <div>
            <label htmlFor="c_servizio" className="form-label">Servizio richiesto *</label>
            <select
              id="c_servizio" name="servizio"
              value={form.servizio} onChange={handleChange}
              className={`form-input ${errors.servizio ? 'form-input-error' : ''}`}
            >
              {SERVIZI.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.servizio && <p className="field-error">{errors.servizio}</p>}
          </div>

          {/* Quando */}
          <div>
            <label htmlFor="c_quando" className="form-label">Quando hai bisogno? *</label>
            <input
              type="text" id="c_quando" name="quando"
              value={form.quando} onChange={handleChange}
              placeholder='es. "da lunedì prossimo", "weekend"'
              className={`form-input ${errors.quando ? 'form-input-error' : ''}`}
            />
            {errors.quando && <p className="field-error">{errors.quando}</p>}
          </div>

          {/* Telefono */}
          <div>
            <label htmlFor="c_telefono" className="form-label">Telefono *</label>
            <input
              type="tel" id="c_telefono" name="telefono"
              value={form.telefono} onChange={handleChange}
              placeholder="333 1112222"
              className={`form-input ${errors.telefono ? 'form-input-error' : ''}`}
            />
            {errors.telefono && <p className="field-error">{errors.telefono}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="c_email" className="form-label">Email *</label>
            <input
              type="email" id="c_email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="la.tua@email.it"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Note */}
          <div>
            <label htmlFor="c_note" className="form-label">Note (opzionale)</label>
            <textarea
              id="c_note" name="note" rows={3}
              value={form.note} onChange={handleChange}
              placeholder="Altre informazioni utili..."
              className="form-input resize-none"
            />
          </div>

          {/* Consenso */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox" id="c_consenso" name="consenso"
              checked={form.consenso} onChange={handleChange}
              className="form-checkbox mt-1"
            />
            <label htmlFor="c_consenso" className={`text-sm leading-relaxed ${errors.consenso ? 'text-red-600' : 'text-sage-600'}`}>
              Acconsento al trattamento dei dati per essere ricontattato su WhatsApp o telefono. *
            </label>
          </div>
          {errors.consenso && <p className="field-error">{errors.consenso}</p>}

          {/* Consenso marketing */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox" id="c_consenso_marketing" name="consenso_marketing"
              checked={form.consenso_marketing} onChange={handleChange}
              className="form-checkbox mt-1"
            />
            <label htmlFor="c_consenso_marketing" className="text-sm leading-relaxed text-sage-600">
              Desidero ricevere aggiornamenti via email (opzionale)
            </label>
          </div>

          {/* Error message */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading' || cooldown}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Invio in corso...
              </>
            ) : cooldown ? (
              'Richiesta inviata'
            ) : (
              'Invia richiesta'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
