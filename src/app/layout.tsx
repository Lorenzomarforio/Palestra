import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Palestra Progressi',
  description: 'Track your gym progress',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">
          Vai al contenuto principale
        </a>
        <ThemeProvider>
          <main id="main-content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}