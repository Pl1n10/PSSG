import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-sage-900 text-sage-300">
      <div className="max-w-5xl mx-auto section-padding py-12 md:py-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <p className="text-white font-display text-lg">Pet Sitting SGC</p>
              <p className="text-sage-400 text-sm">San Giorgio a Cremano</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#come-funziona" className="hover:text-white transition-colors">Come funziona</a>
            <a href="#cliente" className="hover:text-white transition-colors">Cerco pet sitter</a>
            <a href="#sitter" className="hover:text-white transition-colors">Candidati</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/privacy/" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sage-700 pt-8">
          {/* Disclaimer */}
          <p className="text-xs text-sage-400 leading-relaxed mb-4 max-w-3xl">
            <strong className="text-sage-300">Disclaimer:</strong>{' '}
            Pet Sitting San Giorgio a Cremano (PSSG) mette in contatto proprietari e pet sitter 
            indipendenti. Il servizio è fornito dal pet sitter. PSSG non è responsabile per 
            l&apos;operato dei singoli pet sitter.
          </p>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-sage-500">
            <p>© {year} Pet Sitting San Giorgio a Cremano</p>
            <p>
              Contatto:{' '}
              <a
                href="mailto:info@petsittingsangiorgio.it"
                className="text-sage-400 hover:text-white transition-colors underline"
              >
                info@petsittingsangiorgio.it
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
