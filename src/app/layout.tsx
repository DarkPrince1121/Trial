import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, IBM_Plex_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NarrateAML — STR Narratives Drafted in 60 Seconds',
    template: '%s | NarrateAML',
  },
  description:
    'AI-assisted STR narrative drafting for AML investigators and compliance teams. FINTRAC-oriented, structured for Canadian AML workflows.',
  keywords: [
    'STR narrative',
    'AML',
    'suspicious transaction report',
    'FINTRAC',
    'compliance',
    'AML investigator',
    'narrative drafting',
  ],
  authors: [{ name: 'NarrateAML' }],
  openGraph: {
    title: 'NarrateAML — STR Narratives Drafted in 60 Seconds',
    description:
      'AI-assisted narrative drafting for AML investigators. Structured for Canadian AML workflows.',
    type: 'website',
    siteName: 'NarrateAML',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NarrateAML — STR Narratives Drafted in 60 Seconds',
    description: 'AI-assisted STR narrative drafting for AML compliance teams.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${playfairDisplay.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-background text-text-primary font-sans antialiased">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                border: '1px solid #1E2D45',
                color: '#F8FAFC',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '13px',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
