import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Pet Sitting San Giorgio a Cremano',
  description: 'Informativa sulla privacy di Pet Sitting San Giorgio a Cremano.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-sage-900 text-white py-8 px-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🐾</span>
            <span className="font-display text-lg">Pet Sitting SGC</span>
          </Link>
          <Link href="/" className="text-sm text-sage-300 hover:text-white transition-colors">
            ← Torna alla home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto section-padding">
        <h1 className="text-3xl md:text-4xl mb-8">Informativa sulla Privacy</h1>

        <div className="prose-custom space-y-6 text-sage-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">Chi siamo</h2>
            <p>
              Pet Sitting San Giorgio a Cremano (PSSG) è un servizio che mette in contatto 
              proprietari di animali domestici e pet sitter indipendenti nella zona di 
              San Giorgio a Cremano (NA), Italia.
            </p>
            <p className="mt-2">
              Email di contatto:{' '}
              <a href="mailto:petsittingsangiorgioacremano@gmail.com" className="text-brand-600 underline">
                petsittingsangiorgioacremano@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">Quali dati raccogliamo</h2>
            <p>Attraverso i form presenti sul sito raccogliamo i seguenti dati personali:</p>
            <p className="mt-2">
              <strong>Per i clienti:</strong> nome, zona, tipo di animale, servizio richiesto, 
              periodo di necessità, numero di telefono, eventuali note aggiuntive.
            </p>
            <p className="mt-2">
              <strong>Per i pet sitter:</strong> nome, zona, servizi offerti, esperienza con animali, 
              competenze veterinarie, disponibilità, numero di telefono, email, eventuale link a 
              profilo/CV, eventuali note aggiuntive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">Finalità del trattamento</h2>
            <p>I dati raccolti vengono utilizzati esclusivamente per:</p>
            <p className="mt-2">
              Mettere in contatto proprietari di animali e pet sitter tramite WhatsApp o telefono, 
              valutare le candidature dei pet sitter, e gestire le richieste di servizio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">Base giuridica</h2>
            <p>
              Il trattamento dei dati si basa sul consenso espresso dell&apos;interessato, 
              fornito tramite la checkbox presente nei form di contatto (Art. 6, par. 1, lett. a, GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">Conservazione dei dati</h2>
            <p>
              I dati vengono conservati per il tempo necessario a gestire la richiesta e per un 
              massimo di 12 mesi dalla raccolta. Trascorso tale periodo, i dati vengono cancellati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">Condivisione dei dati</h2>
            <p>
              I dati non vengono venduti a terzi. Possono essere condivisi esclusivamente con il 
              pet sitter o il proprietario selezionato per il match, al fine di metterli in contatto.
            </p>
            <p className="mt-2">
              I dati sono conservati tramite Google Sheets (Google LLC) con accesso limitato 
              ai gestori del servizio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">I tuoi diritti</h2>
            <p>
              Ai sensi del GDPR, hai diritto di accedere ai tuoi dati, richiederne la rettifica 
              o la cancellazione, limitarne il trattamento, e revocare il consenso in qualsiasi 
              momento. Per esercitare questi diritti, contattaci a:{' '}
              <a href="mailto:petsittingsangiorgioacremano@gmail.com" className="text-brand-600 underline">
                petsittingsangiorgioacremano@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display text-sage-900 mb-3">Cookie e analytics</h2>
            <p>
              Il sito potrebbe utilizzare Cloudflare Web Analytics, un servizio di analisi 
              rispettoso della privacy che non utilizza cookie e non traccia gli utenti 
              individualmente.
            </p>
          </section>

          <p className="text-sm text-sage-400 pt-4 border-t border-warmgray-100">
            Ultimo aggiornamento: Febbraio 2026
          </p>
        </div>
      </div>
    </main>
  )
}
