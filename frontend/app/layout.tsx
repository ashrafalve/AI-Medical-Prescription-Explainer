import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'AiMedico — AI-Powered Prescription Explainer',
    template: '%s | AiMedico',
  },
  description:
    'Upload your doctor prescriptions and medical reports. AiMedico uses AI to explain medicines, dosage, and medical terms in simple English and Bangla.',
  keywords: ['medical AI', 'prescription explainer', 'medicine information', 'healthcare AI', 'AiMedico'],
  authors: [{ name: 'AiMedico Team' }],
  openGraph: {
    title: 'AiMedico — AI-Powered Prescription Explainer',
    description: 'Understand your prescriptions with AI. Simple, safe, and multilingual.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
