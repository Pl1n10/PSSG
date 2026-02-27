import './globals.css'
import JsonLd from '@/components/JsonLd'
import Analytics from '@/components/Analytics'
import WhatsAppFloat from '@/components/WhatsAppFloat'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://petsittingsgc.it'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Pet Sitting San Giorgio a Cremano | Contatto WhatsApp',
  description:
    'Cerchi un pet sitter a San Giorgio a Cremano? Compila il form e ti mettiamo in contatto con pet sitter indipendenti nella tua zona.',
  keywords: [
    'pet sitting',
    'pet sitter',
    'San Giorgio a Cremano',
    'dog walking',
    'cat sitting',
    'dog sitter Napoli',
    'pet sitter Napoli',
  ],
  authors: [{ name: 'Pet Sitting San Giorgio a Cremano' }],
  openGraph: {
    title: 'Pet Sitting San Giorgio a Cremano',
    description:
      'Mettiamo in contatto famiglie e pet sitter affidabili a San Giorgio a Cremano. Contatto rapido su WhatsApp.',
    type: 'website',
    locale: 'it_IT',
    url: SITE_URL,
    siteName: 'Pet Sitting San Giorgio a Cremano',
  },
  twitter: {
    card: 'summary',
    title: 'Pet Sitting San Giorgio a Cremano',
    description:
      'Cerchi un pet sitter a San Giorgio a Cremano? Contatto rapido su WhatsApp.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <JsonLd />
      </head>
      <body className="grain">
        {children}
        <WhatsAppFloat />
        <Analytics />
      </body>
    </html>
  )
}
