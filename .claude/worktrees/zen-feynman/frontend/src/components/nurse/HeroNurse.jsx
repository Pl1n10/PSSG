'use client'

export default function HeroNurse() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 paw-pattern" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage-100/30 rounded-full blur-3xl" />

      <div className="relative section-padding max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-warmgray-200 mb-6 animate-fade-in-up">
          <span className="text-2xl">🩺</span>
          <span className="text-sm font-medium text-sage-700">Assistenza veterinaria a domicilio</span>
        </div>

        {/* H1 */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-tight mb-6 animate-fade-in-up animate-delay-100">
          Pet <span className="text-brand-500">Nurse</span><br />
          San Giorgio a Cremano
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-sage-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animate-delay-200">
          Professionisti qualificati per la somministrazione di farmaci,
          cure post-operatorie e assistenza ad animali anziani o con patologie croniche.
          Direttamente a casa tua.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#nurse-form"
            className="btn-primary"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Richiedi un pet nurse
          </a>
          <a
            href="/#sitter"
            className="btn-secondary"
          >
            Sei un professionista?
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-sage-400 animate-fade-in-up animate-delay-400">
          Solo professionisti con esperienza veterinaria verificata
        </p>
      </div>
    </section>
  )
}
