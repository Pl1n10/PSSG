'use client'

import Script from 'next/script'

export default function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN

  if (!token) return null

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
      strategy="afterInteractive"
    />
  )
}
