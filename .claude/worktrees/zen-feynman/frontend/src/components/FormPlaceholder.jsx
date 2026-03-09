export default function FormPlaceholder({ type }) {
  const isClient = type === 'cliente'

  return (
    <section
      className={`section-padding ${isClient ? '' : 'bg-white'}`}
      id={isClient ? 'cliente' : 'sitter'}
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="card border-2 border-dashed border-warmgray-200 py-12">
          <span className="text-4xl mb-4 block">
            {isClient ? '🔍' : '💼'}
          </span>
          <h2 className="text-2xl md:text-3xl mb-3">
            {isClient ? 'Cerchi un pet sitter?' : 'Vuoi lavorare con gli animali?'}
          </h2>
          <p className="text-sage-500 mb-6">
            {isClient
              ? 'Compila il form e ti mettiamo in contatto con un pet sitter nella tua zona.'
              : 'Candidati come pet sitter a San Giorgio a Cremano.'}
          </p>
          <div className="inline-block px-6 py-3 bg-warmgray-100 rounded-xl text-sage-400 text-sm font-medium">
            📋 Form in arrivo — Milestone 2
          </div>
        </div>
      </div>
    </section>
  )
}
