export default function HowItWorksNurse() {
  const steps = [
    {
      number: '1',
      emoji: '📋',
      title: 'Descrivi le esigenze',
      description: 'Compila il form con la patologia del tuo animale, il farmaco da somministrare e la frequenza.',
    },
    {
      number: '2',
      emoji: '🔍',
      title: 'Troviamo il professionista',
      description: 'Selezioniamo un pet nurse con le competenze veterinarie adatte al tuo caso specifico.',
    },
    {
      number: '3',
      emoji: '💬',
      title: 'Vi mettiamo in contatto',
      description: 'Ti contattiamo su WhatsApp entro 48 ore per organizzare il primo appuntamento a domicilio.',
    },
  ]

  return (
    <section className="section-padding bg-white" id="come-funziona-nurse">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-4 font-display">
          Come <span className="text-brand-500">funziona</span>
        </h2>
        <p className="text-center text-sage-500 mb-12 max-w-xl mx-auto">
          Tre semplici passi per trovare il pet nurse giusto per il tuo animale.
        </p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center group">
              {/* Connector line */}
              {step.number !== '3' && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-warmgray-200" />
              )}

              {/* Step circle */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-50 border-2 border-brand-100 mb-5 transition-all group-hover:scale-105 group-hover:shadow-lg">
                <span className="text-4xl">{step.emoji}</span>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-display mb-2">{step.title}</h3>
              <p className="text-sage-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
