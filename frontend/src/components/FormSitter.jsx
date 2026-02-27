'use client'

import { useState, useRef } from 'react'

const SERVIZI_OPTIONS = [
  { value: 'dog_walking', label: 'Dog walking' },
  { value: 'cat_sitting', label: 'Cat sitting' },
  { value: 'visite_domicilio', label: 'Visite a domicilio' },
  { value: 'somministrazione_farmaci', label: 'Somministrazione farmaci' },
  { value: 'altro', label: 'Altro' },
]

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8787'
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '393331112222'

export default function FormSitter() {
  const [form, setForm] = useState({
    nome: '',
    zona: 'San Giorgio a Cremano',
    servizi: [],
    esperienza: '',
    competenze_vet: '', // 'si' | 'no' | ''
    competenze_vet_dettaglio: '',
    disponibilita: '',
    telefono: '',
    email: '',
    link_profilo: '',
    note: '',
    consenso: false,
    consenso_marketing: false,
    _hp: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [cooldown, setCooldown] = useState(false)
  const formRef = useRef(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleServiziChange = (value) => {
    setForm((prev) => {
      const next = prev.servizi.includes(value)
        ? prev.servizi.filter((s) => s !== value)
        : [...prev.servizi, value]
      return { ...prev, servizi: next }
    })
    if (errors.servizi) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.servizi
        return next
      })
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Inserisci il tuo nome'
    if (form.servizi.length === 0) errs.servizi = 'Seleziona almeno un servizio'
    if (!form.esperienza.trim()) errs.esperienza = 'Raccontaci la tua esperienza'
    if (!form.competenze_vet) errs.competenze_vet = 'Seleziona una opzione'
    if (!form.disponibilita.trim()) errs.disponibilita = 'Indica la tua disponibilità'
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
    if (form._hp) return

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
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
          type: 'sitter',
          payload: {
            nome: form.nome.trim(),
            zona: form.zona.trim(),
            servizi: form.servizi,
            esperienza: form.esperienza.trim(),
            competenze_vet: form.competenze_vet,
            competenze_vet_dettaglio: form.competenze_vet_dettaglio.trim(),
            disponibilita: form.disponibilita.trim(),
            telefono: form.telefono.trim(),
            email: form.email.trim(),
            link_profilo: form.link_profilo.trim(),
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
      setCooldown(true)
      setTimeout(() => setCooldown(false), 15000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Errore di connessione. Riprova tra poco.')
    }
  }

  const waMessage = () => {
    const serviziLabels = form.servizi
      .map((v) => SERVIZI_OPTIONS.find((s) => s.value === v)?.label || v)
      .join(', ')
    const espBreve = form.esperienza.length > 80
      ? form.esperienza.slice(0, 80) + '...'
      : form.esperienza
    return encodeURIComponent(
      `Ciao! Sono ${form.nome}. Vorrei candidarmi come pet sitter a San Giorgio a Cremano. Servizi: ${serviziLabels}. Disponibilità: ${form.disponibilita}. Esperienza: ${espBreve}.`
    )
  }

  // SUCCESS STATE
  if (status === 'success') {
    return (
      <section className="section-padding bg-white" id="sitter">
        <div className="max-w-lg mx-auto">
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl md:text-3xl mb-3">Grazie!</h2>
            <p className="text-sage-500 mb-8 leading-relaxed">
              Abbiamo ricevuto la tua candidatura e ti abbiamo inviato una conferma via email.<br />
              Per velocizzare, apri WhatsApp e scrivici.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
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
    <section className="section-padding bg-white" id="sitter">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">💼</span>
          <h2 className="text-2xl md:text-3xl mb-2">Vuoi lavorare con gli animali?</h2>
          <p className="text-sage-500">
            Candidati come pet sitter a San Giorgio a Cremano.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="card space-y-5">
          {/* Honeypot */}
          <div className="absolute opacity-0 pointer-events-none" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
            <label htmlFor="s_website">Non compilare</label>
            <input type="text" id="s_website" name="_hp" tabIndex={-1} autoComplete="off" value={form._hp} onChange={handleChange} />
          </div>

          {/* Nome */}
          <div>
            <label htmlFor="s_nome" className="form-label">Nome *</label>
            <input
              type="text" id="s_nome" name="nome"
              value={form.nome} onChange={handleChange}
              placeholder="Il tuo nome"
              className={`form-input ${errors.nome ? 'form-input-error' : ''}`}
            />
            {errors.nome && <p className="field-error">{errors.nome}</p>}
          </div>

          {/* Zona */}
          <div>
            <label htmlFor="s_zona" className="form-label">Zona</label>
            <input
              type="text" id="s_zona" name="zona"
              value={form.zona} onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Servizi offerti - checkbox group */}
          <fieldset>
            <legend className="form-label">Servizi offerti *</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {SERVIZI_OPTIONS.map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${form.servizi.includes(s.value)
                      ? 'border-sage-400 bg-sage-50'
                      : 'border-warmgray-200 hover:border-warmgray-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={form.servizi.includes(s.value)}
                    onChange={() => handleServiziChange(s.value)}
                    className="form-checkbox"
                  />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
            {errors.servizi && <p className="field-error">{errors.servizi}</p>}
          </fieldset>

          {/* Esperienza */}
          <div>
            <label htmlFor="s_esperienza" className="form-label">Esperienza *</label>
            <textarea
              id="s_esperienza" name="esperienza" rows={3}
              value={form.esperienza} onChange={handleChange}
              placeholder="Raccontaci brevemente la tua esperienza con animali."
              className={`form-input resize-none ${errors.esperienza ? 'form-input-error' : ''}`}
            />
            {errors.esperienza && <p className="field-error">{errors.esperienza}</p>}
          </div>

          {/* Competenze veterinarie */}
          <fieldset>
            <legend className="form-label">Hai competenze veterinarie? *</legend>
            <div className="flex gap-4 mt-1">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all
                ${form.competenze_vet === 'si' ? 'border-sage-400 bg-sage-50' : 'border-warmgray-200 hover:border-warmgray-300'}`}>
                <input type="radio" name="competenze_vet" value="si"
                  checked={form.competenze_vet === 'si'} onChange={handleChange}
                  className="form-radio" />
                <span className="text-sm">Sì</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all
                ${form.competenze_vet === 'no' ? 'border-sage-400 bg-sage-50' : 'border-warmgray-200 hover:border-warmgray-300'}`}>
                <input type="radio" name="competenze_vet" value="no"
                  checked={form.competenze_vet === 'no'} onChange={handleChange}
                  className="form-radio" />
                <span className="text-sm">No</span>
              </label>
            </div>
            {errors.competenze_vet && <p className="field-error">{errors.competenze_vet}</p>}
          </fieldset>

          {/* Conditional: quali competenze? */}
          {form.competenze_vet === 'si' && (
            <div className="ml-2 pl-4 border-l-2 border-sage-200">
              <label htmlFor="s_vet_dettaglio" className="form-label">Quali competenze?</label>
              <input
                type="text" id="s_vet_dettaglio" name="competenze_vet_dettaglio"
                value={form.competenze_vet_dettaglio} onChange={handleChange}
                placeholder="es. somministrazione farmaci, primo soccorso..."
                className="form-input"
              />
            </div>
          )}

          {/* Disponibilità */}
          <div>
            <label htmlFor="s_disponibilita" className="form-label">Disponibilità *</label>
            <input
              type="text" id="s_disponibilita" name="disponibilita"
              value={form.disponibilita} onChange={handleChange}
              placeholder='es. "lun-ven dopo 18, weekend"'
              className={`form-input ${errors.disponibilita ? 'form-input-error' : ''}`}
            />
            {errors.disponibilita && <p className="field-error">{errors.disponibilita}</p>}
          </div>

          {/* Telefono */}
          <div>
            <label htmlFor="s_telefono" className="form-label">Telefono *</label>
            <input
              type="tel" id="s_telefono" name="telefono"
              value={form.telefono} onChange={handleChange}
              placeholder="333 1112222"
              className={`form-input ${errors.telefono ? 'form-input-error' : ''}`}
            />
            {errors.telefono && <p className="field-error">{errors.telefono}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="s_email" className="form-label">Email *</label>
            <input
              type="email" id="s_email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="la-tua@email.it"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Link profilo */}
          <div>
            <label htmlFor="s_link" className="form-label">Link (opzionale) a CV/LinkedIn/Drive</label>
            <input
              type="url" id="s_link" name="link_profilo"
              value={form.link_profilo} onChange={handleChange}
              placeholder="https://..."
              className="form-input"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="s_note" className="form-label">Note (opzionale)</label>
            <textarea
              id="s_note" name="note" rows={3}
              value={form.note} onChange={handleChange}
              placeholder="Altre informazioni utili..."
              className="form-input resize-none"
            />
          </div>

          {/* Consenso */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox" id="s_consenso" name="consenso"
              checked={form.consenso} onChange={handleChange}
              className="form-checkbox mt-1"
            />
            <label htmlFor="s_consenso" className={`text-sm leading-relaxed ${errors.consenso ? 'text-red-600' : 'text-sage-600'}`}>
              Acconsento al trattamento dei dati per essere ricontattato su WhatsApp o telefono. *
            </label>
          </div>
          {errors.consenso && <p className="field-error">{errors.consenso}</p>}

          {/* Consenso marketing */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox" id="s_consenso_marketing" name="consenso_marketing"
              checked={form.consenso_marketing} onChange={handleChange}
              className="form-checkbox mt-1"
            />
            <label htmlFor="s_consenso_marketing" className="text-sm leading-relaxed text-sage-600">
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
            className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
              'Candidatura inviata'
            ) : (
              'Invia candidatura'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}
