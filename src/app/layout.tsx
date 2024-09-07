import './globals.css'
import type { Metadata } from 'next'
import { SupabaseProvider } from '@/components/supabase/provider'

// Remove or comment out the next/font import
// import { Inter } from 'next/font/google'

// Remove this const declaration
// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your App Title',
  description: 'Your app description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  )
}
