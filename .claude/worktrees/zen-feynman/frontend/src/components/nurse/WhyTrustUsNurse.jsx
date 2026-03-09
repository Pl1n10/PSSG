export default function WhyTrustUsNurse() {
  const points = [
    {
      icon: '🩺',
      title: 'Professionisti verificati',
      description: 'Solo infermieri e tecnici con esperienza veterinaria comprovata. Ogni profilo viene verificato manualmente.',
    },
    {
      icon: '📍',
      title: 'A domicilio, nella tua zona',
      description: 'Il pet nurse viene direttamente a casa tua a San Giorgio a Cremano e dintorni. Zero stress per il tuo animale.',
    },
    {
      icon: '🔒',
      title: 'Sicurezza e affidabilità',
      description: 'Screening manuale di ogni candidato. Il tuo animale è in mani sicure, anche quando non puoi essere presente.',
    },
  ]

  return (
    <section className="section-padding" id="perche-noi-nurse">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-4 font-display">
          Perché <span className="text-sage-600">sceglierci</span>
        </h2>
        <p className="text-center text-sage-500 mb-12 max-w-xl mx-auto">
          Il tuo animale merita cure professionali, anche a casa.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {points.map((point, i) => (
            <div
              key={i}
              className="card hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-sage-50 flex items-center justify-center text-2xl mb-5">
                {point.icon}
              </div>
              <h3 className="text-lg font-display mb-2">{point.title}</h3>
              <p className="text-sage-500 text-sm leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
