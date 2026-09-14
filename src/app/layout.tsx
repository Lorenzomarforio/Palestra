import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { NoticeProvider } from '@/lib/notice'

export const metadata: Metadata = {
  title: 'Palestra Progressi',
  description: 'Track your gym progress',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
          <NoticeProvider>
            <main id="main-content">{children}</main>
          </NoticeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}