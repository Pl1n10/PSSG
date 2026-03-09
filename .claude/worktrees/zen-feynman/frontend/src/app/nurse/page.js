import HeroNurse from '@/components/nurse/HeroNurse'
import HowItWorksNurse from '@/components/nurse/HowItWorksNurse'
import WhyTrustUsNurse from '@/components/nurse/WhyTrustUsNurse'
import FormNurseClient from '@/components/nurse/FormNurseClient'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Pet Nurse | Assistenza Veterinaria a Domicilio — San Giorgio a Cremano',
  description:
    'Professionisti qualificati per la somministrazione di farmaci e cure veterinarie a domicilio a San Giorgio a Cremano. Richiedi un pet nurse per il tuo animale.',
  keywords: [
    'pet nurse',
    'somministrazione farmaci animali',
    'assistenza veterinaria domicilio',
    'San Giorgio a Cremano',
    'cure animali casa',
  ],
}

export default function NursePage() {
  return (
    <main>
      <HeroNurse />
      <HowItWorksNurse />
      <WhyTrustUsNurse />
      <FormNurseClient />
      <FAQ />
      <Footer />
      {/* Link back to main page */}
      <div className="text-center pb-8 -mt-4">
        <a href="/" className="text-sm text-sage-400 hover:text-sage-600 transition-colors">
          Cerchi pet sitting generico? Vai alla pagina principale &rarr;
        </a>
      </div>
    </main>
  )
}
