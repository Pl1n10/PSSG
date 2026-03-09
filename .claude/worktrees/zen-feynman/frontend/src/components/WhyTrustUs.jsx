export default function WhyTrustUs() {
  const points = [
    {
      icon: '📍',
      title: 'Solo zona San Giorgio a Cremano',
      description: 'Conosciamo il territorio. Niente dispersione: contatti locali e vicini a te.',
    },
    {
      icon: '👀',
      title: 'Selezione manuale dei contatti',
      description: 'Ogni richiesta e candidatura viene letta e valutata da noi prima del contatto.',
    },
    {
      icon: '🩺',
      title: 'Possibile esperienza veterinaria',
      description: 'Alcuni pet sitter possono avere competenze nella somministrazione di farmaci.',
    },
  ]

  return (
    <section className="section-padding" id="perche-noi">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl text-center mb-4">
          Perché <span className="text-sage-600">fidarti</span>
        </h2>
        <p className="text-center text-sage-500 mb-12 max-w-xl mx-auto">
          Non siamo un&apos;app impersonale. Siamo persone che amano gli animali.
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
              <h3 className="text-lg font-display mb-2 text-sage-800">{point.title}</h3>
              <p className="text-sage-500 text-sm leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
