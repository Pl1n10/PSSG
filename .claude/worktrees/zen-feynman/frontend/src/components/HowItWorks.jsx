export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      emoji: '📝',
      title: 'Compila in 30 secondi',
      description: 'Dicci di che servizio hai bisogno o cosa offri. Bastano pochi dati.',
    },
    {
      number: '2',
      emoji: '🤝',
      title: 'Ti ricontattiamo e scegliamo il match',
      description: 'Selezioniamo manualmente i contatti più adatti alla tua richiesta.',
    },
    {
      number: '3',
      emoji: '💬',
      title: 'Ti mettiamo in contatto su WhatsApp',
      description: 'Parlate direttamente e organizzate tutto come preferite.',
    },
  ]

  return (
    <section className="section-padding bg-white" id="come-funziona">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-4">
          Come <span className="text-brand-500">funziona</span>
        </h2>
        <p className="text-center text-sage-500 mb-12 max-w-xl mx-auto">
          Tre passi per trovare il pet sitter giusto (o candidarti).
        </p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center group">
              {/* Connector line (hidden on mobile, visible between cards on md+) */}
              {step.number !== '3' && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-warmgray-200" />
              )}

              {/* Step circle */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-50 border-2 border-brand-100 mb-6 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-brand-100/50 transition-all duration-300">
                <span className="text-4xl">{step.emoji}</span>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-display mb-2 text-sage-800">{step.title}</h3>
              <p className="text-sage-500 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
