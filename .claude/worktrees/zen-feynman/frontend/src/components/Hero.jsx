'use client'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 paw-pattern" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative section-padding max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-warmgray-100 mb-8">
          <span className="text-2xl">🐾</span>
          <span className="text-sm font-medium text-sage-700">San Giorgio a Cremano</span>
        </div>

        {/* H1 */}
        <h1 className="animate-fade-in-up animate-delay-100 text-4xl md:text-5xl lg:text-6xl font-display text-sage-900 leading-tight mb-6">
          Pet Sitting{' '}
          <span className="text-brand-500">San Giorgio a Cremano</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up animate-delay-200 text-lg md:text-xl text-sage-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Mettiamo in contatto famiglie e pet sitter affidabili nella tua zona.
          <br className="hidden md:block" />
          Contatto rapido su WhatsApp.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="#cliente" className="btn-primary w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Cerco un pet sitter
          </a>
          <a href="#sitter" className="btn-secondary w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Voglio lavorare con gli animali
          </a>
        </div>

        {/* Social proof hint */}
        <p className="animate-fade-in-up animate-delay-400 mt-8 text-sm text-sage-400">
          ✓ Gratuito · ✓ Solo zona San Giorgio · ✓ Risposta rapida su WhatsApp
        </p>
      </div>
    </section>
  )
}
