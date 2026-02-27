import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import WhyTrustUs from '@/components/WhyTrustUs'
import FormCliente from '@/components/FormCliente'
import FormSitter from '@/components/FormSitter'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <WhyTrustUs />
      <FormCliente />
      <FormSitter />
      <FAQ />
      <Footer />
    </main>
  )
}
