const WA_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '393331112222').replace(/[\s+\-]/g, '')
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://petsittingsgc.it'

export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Pet Sitting San Giorgio a Cremano',
    description:
      'Mettiamo in contatto famiglie e pet sitter indipendenti a San Giorgio a Cremano.',
    url: SITE_URL,
    telephone: `+${WA_NUMBER}`,
    areaServed: {
      '@type': 'City',
      name: 'San Giorgio a Cremano',
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Napoli',
      },
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: `+${WA_NUMBER}`,
      availableLanguage: 'Italian',
      contactOption: 'https://wa.me/' + WA_NUMBER,
    },
    sameAs: [],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
