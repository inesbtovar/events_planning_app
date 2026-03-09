// app/layout.tsx
import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EventsDock — Event Planning Made Simple',
  description: 'Manage guests, send invitations, and create beautiful event websites in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <SpeedInsights />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#112240',
              color: '#E8F0FE',
              border: '1px solid rgba(10,191,188,0.2)',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'var(--font-dm), sans-serif',
            },
            success: { iconTheme: { primary: '#06D6A0', secondary: '#112240' } },
            error: { iconTheme: { primary: '#fca5a5', secondary: '#112240' } },
          }}
        />
      </body>
    </html>
  )
}
