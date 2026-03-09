'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Quanto costa?',
    a: 'I prezzi li stabilisce il pet sitter. Ti mettiamo in contatto e concordate direttamente.',
  },
  {
    q: 'Coprite altre zone?',
    a: 'Per ora solo San Giorgio a Cremano. Vogliamo garantire un servizio locale e di qualità.',
  },
  {
    q: 'Siete un\'agenzia?',
    a: 'No. Mettiamo in contatto proprietari e pet sitter indipendenti. Il servizio è fornito dal pet sitter.',
  },
  {
    q: 'Posso candidarmi senza CV?',
    a: 'Sì, assolutamente. Raccontaci la tua esperienza e la tua disponibilità nel form, è sufficiente.',
  },
]

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-warmgray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-display text-sage-800 group-hover:text-brand-600 transition-colors">
          {faq.q}
        </span>
        <span
          className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-brand-500 text-white rotate-45'
              : 'bg-warmgray-100 text-sage-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-40 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sage-500 leading-relaxed px-1">{faq.a}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="section-padding bg-white" id="faq">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-4">
          Domande <span className="text-brand-500">frequenti</span>
        </h2>
        <p className="text-center text-sage-500 mb-10">
          Le risposte rapide che cerchi.
        </p>

        <div className="card">
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
